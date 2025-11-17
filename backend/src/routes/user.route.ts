import { Router } from "express";
import { syncUser } from '../controllers/user.controller.js';
import { verifyFirebaseToken } from '../middleware/auth.middleware.js';

const userRouter = Router();

// Sincronizar usuario de Firebase con la base de datos
userRouter.post('/sync', verifyFirebaseToken, syncUser);

export default userRouter;