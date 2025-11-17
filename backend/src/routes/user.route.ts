import { Router } from "express";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.json({ message: "La ruta de usuario está funcionando!" });
});

export default userRouter;