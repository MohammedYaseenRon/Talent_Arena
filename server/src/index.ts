import express from "express"
import cors from "cors";
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { redis } from "./redis/index.js"

const app = express();
const PORT = 4000;
const db = drizzle(process.env.DATABASE_URL!);


app.use(express.json());
app.use(cors())



app.get("/", (req, res) => {
    console.log("Server is running");
})

async function startServer() {
  //Redis test (TEMPORARY)
  await redis.set("ping", "pong");
  const value = await redis.get("ping");
  console.log("Redis test:", value);

  app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
  });
}

startServer();
