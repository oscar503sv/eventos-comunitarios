import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const syncUser = async (req: Request, res: Response) => {
  try {
    const { uid, email, displayName } = req.user!;

    // Buscar o crear usuario en la base de datos
    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        email: email || '',
        displayName,
      },
      create: {
        firebaseUid: uid,
        email: email || '',
        displayName,
      },
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Error syncing user' });
  }
};
