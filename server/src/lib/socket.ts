import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on("join:leaderboard", ({ challengeId }: { challengeId: string }) => {
      socket.join(`leaderboard:${challengeId}`);
      console.log(`[Socket] ${socket.id} joined leaderboard:${challengeId}`);
    });

    socket.on("leave:leaderboard", ({ challengeId }: { challengeId: string }) => {
      socket.leave(`leaderboard:${challengeId}`);
      console.log(`[Socket] ${socket.id} left leaderboard:${challengeId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized — call initSocket first");
  return io;
};