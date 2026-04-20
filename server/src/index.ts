import express from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import authRoutes from "./routes/authRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import cookie from "cookie-parser";
import { startCronJobs } from "./services/cron.service.js";
import { initSocket } from "./lib/socket.js";

const app = express();
const PORT = Number(process.env.PORT) || 4001;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://talent-arena-iota.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookie());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/auth", authRoutes);
app.use("/challenge", challengeRoutes);
app.use("/submission", submissionRoutes);

// Create HTTP server from express app
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

startCronJobs();

httpServer.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});