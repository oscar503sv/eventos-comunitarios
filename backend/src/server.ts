import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API con TypeScript funcionando 🚀" });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
