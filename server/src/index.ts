import express from "express"
import cors from "cors";
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const app = express();
const PORT = 4000;
const db = drizzle(process.env.DATABASE_URL!);


app.use(express.json());
app.use(cors())



app.get("/", () => {
    console.log("Server is running");
})

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
})