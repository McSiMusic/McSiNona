import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import convertRouter from "./routes/convert";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB (используйте переменные окружения!)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Простой роут для проверки
app.get("/", (req, res) => {
  res.send("Express + TypeScript + Mongoose");
});

app.use("/api", convertRouter);

export default app;
