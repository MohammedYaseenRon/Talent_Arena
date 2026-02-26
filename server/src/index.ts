import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";

import cookie from "cookie-parser";
import { startChallengeScheduler } from "./jobs/challengeScheduler.js";
import { startCronJobs } from "./services/cron.service.js";

const app = express();
const PORT = Number(process.env.PORT) || 4001;


app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://app.ronyx.xyz"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"})); //for form data
app.use(cookie());


app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/auth", authRoutes);
app.use("/challenge", challengeRoutes)

// async function startServer() {
//   //Redis test (TEMPORARY)
//   await redis.set("ping", "pong");
//   const value = await redis.get("ping");
//   console.log("Redis test:", value);
// }
startCronJobs();
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
