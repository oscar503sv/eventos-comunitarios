import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase.js';

// Interfaz para el usuario autenticado
interface AuthUser {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
}

// Extender Request usando module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Token malformed' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email ?? undefined,
      displayName: decodedToken.name ?? undefined,
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};
