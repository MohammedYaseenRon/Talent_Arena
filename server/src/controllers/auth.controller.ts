import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  users,
  refreshTokens,
  passwordResets,
  userRoleEnum,
} from "../db/schema.js";

// const resend = new Resend(process.env.RESEND_API_KEY);

type Role = (typeof userRoleEnum.enumValues)[number];

const generateAccessToken = (userId: string, role: Role) => {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};

export const registration = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: "USER",
      })
      .returning();

    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // important for cross-origin
      maxAge: 15 * 60 * 1000, // 15 min
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/auth", // limit scope
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await db.insert(refreshTokens).values({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // important for cross-origin
      maxAge: 15 * 60 * 1000, // 15 min
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/auth", // limit scope
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth",
    });

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
    };

    const [tokenRecord] = await db
      .select({
        token: refreshTokens.token,
        expiresAt: refreshTokens.expiresAt,
        userId: users.id,
        userRole: users.role,
      })
      .from(refreshTokens)
      .innerJoin(users, eq(refreshTokens.userId, users.id))
      .where(eq(refreshTokens.token, token));

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    const newAccessToken = generateAccessToken(
      tokenRecord.userId,
      tokenRecord.userRole,
    );

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    console.error("REFRESH TOKEN ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// export const requestPasswordReset = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;

//     const [user] = await db.select().from(users).where(eq(users.email, email));

//     if (!user) {
//       return res.status(200).json({
//         message:
//           "If an account exists with that email, a password reset link has been sent",
//       });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     await db.delete(passwordResets).where(eq(passwordResets.email, email));

//     await db.insert(passwordResets).values({
//       email,
//       token: hashedToken,
//       expiresAt: new Date(Date.now() + 60 * 60 * 1000),
//     });

//     const resetUrl = `${process.env.FRONTEND_URL}/reset?token=${resetToken}`;
//     const { data, error } = await resend.emails.send({
//       from: "OneGod <onboarding@resend.dev>",
//       to: [email],
//       subject: "Password Reset Request",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2>Password Reset Request</h2>
//           <p>You requested to reset your password. Click the button below to reset it:</p>
//           <a href="${resetUrl}" 
//              style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
//             Reset Password
//           </a>
//           <p>Or copy and paste this link into your browser:</p>
//           <p style="color: #666; word-break: break-all;">${resetUrl}</p>
//           <p style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
//           <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
//         </div>
//       `,
//     });
//     if (error) {
//       console.error("Email send error:", error);
//       return res.status(500).json({ error: "Failed to send reset email" });
//     }
//     return res.status(200).json({
//       message:
//         "If an account exists with that email, a password reset link has been sent",
//     });
//   } catch (error) {
//     console.error("PASSWORD RESET REQUEST ERROR:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

export const verifyResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const [resetRecord] = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.token, hashedToken));

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    return res.status(200).json({
      message: "Token is valid",
      email: resetRecord.email,
    });
  } catch (error) {
    console.error("VERIFY TOKEN ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and newPassword must be required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const [resetRecord] = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.token, hashedToken));

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, resetRecord.email));

    await db
      .delete(passwordResets)
      .where(eq(passwordResets.token, hashedToken));

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
