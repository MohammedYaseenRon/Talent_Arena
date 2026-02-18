import { userRoleEnum } from "../src/db/schema";

type Role = (typeof userRoleEnum.enumValues)[number];

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export {};