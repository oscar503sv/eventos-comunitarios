import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const syncUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user || !user.uid) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { uid, email, displayName } = user;

    // Buscar o crear usuario en la base de datos
    const dbUser = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        email: email || '',
        displayName: displayName ?? null,
      },
      create: {
        firebaseUid: uid,
        email: email || '',
        displayName: displayName ?? null,
      },
    });

    res.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName,
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Error syncing user' });
  }
};
