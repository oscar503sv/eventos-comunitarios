import express, { Request, Response } from "express";
import userRouter from "./routes/user.route";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API con TypeScript funcionando 🚀" });
});

app.use("/api/v1/users", userRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
