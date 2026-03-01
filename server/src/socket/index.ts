import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { challengeSessions, sessionParticipants, users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export function initializeSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const accessToken = cookies.accessToken;

      if (!accessToken) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET!
      ) as {
        userId: string;
        role: string;
      };

      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;

      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.userId} (${socket.data.role})`);

    socket.on("MONITOR_CHALLENGE", async (data: { sessionId: string }) => {
      try {
        if (socket.data.role !== "RECRUITER") {
          socket.emit("ERROR", { message: "Only recruiters can monitor" });
          return;
        }

        const { sessionId } = data;

        const [session] = await db
          .select()
          .from(challengeSessions)
          .where(eq(challengeSessions.id, sessionId))
          .limit(1);

        if (!session) {
          socket.emit("ERROR", { message: "Challenge session not found or access denied" });
          return;
        }

        // Join monitoring room
        const roomName = `session:${sessionId}`;
        await socket.join(roomName);

        // Get current participants
        const participants = await db
          .select({
            id: sessionParticipants.id,
            sessionId: sessionParticipants.sessionId,
            userId: sessionParticipants.userId,
            startedAt: sessionParticipants.startedAt,
            finishedAt: sessionParticipants.finishedAt,
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
          })
          .from(sessionParticipants)
          .leftJoin(users, eq(sessionParticipants.userId, users.id))
          .where(eq(sessionParticipants.sessionId, sessionId));

        socket.emit("MONITORING_STARTED", {
          sessionId,
          participants,
        });

        console.log(`Recruiter ${socket.data.userId} monitoring session: ${sessionId}`);
      } catch (error) {
        console.error("Error monitoring challenge:", error);
        socket.emit("ERROR", { message: "Failed to start monitoring" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
}