import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import adminRoutes from './routes/admin'
import productRoutes from './routes/product.routes'
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/products',productRoutes);

app.use(errorHandler)

// ─── START SERVER ────────────────────────────────────────────────────
// app.use((error: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
//   if (error instanceof SyntaxError && "body" in error) {
//     return res.status(400).json({ error: "Request body must be valid JSON" });
//   }

//   next(error);
// });

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});