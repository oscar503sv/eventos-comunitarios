import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase.js';

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string | undefined;
        displayName: string | undefined;
      };
    }
  }
}

export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token malformed' });
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
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
