import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import convertRouter from "./routes/convert.routes";
import nonogramRouter from "./routes/nonogram.routes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mcsinona";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Express + TypeScript + Mongoose");
});

app.use("/api", convertRouter);
app.use("/api/nonograms", nonogramRouter);

export default app;
