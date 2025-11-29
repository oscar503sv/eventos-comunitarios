import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const syncUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    if (!user || !user.uid) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { uid, email, displayName } = user;

    // Primero buscar si existe un usuario con este firebaseUid
    let dbUser = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (dbUser) {
      // Si existe, actualizar sus datos
      dbUser = await prisma.user.update({
        where: { firebaseUid: uid },
        data: {
          email: email || dbUser.email,
          displayName: displayName ?? dbUser.displayName,
        },
      });
    } else {
      // Si no existe, verificar si hay un usuario con ese email
      const existingByEmail = await prisma.user.findUnique({
        where: { email: email || '' },
      });

      if (existingByEmail) {
        // Actualizar el firebaseUid del usuario existente
        dbUser = await prisma.user.update({
          where: { email: email || '' },
          data: {
            firebaseUid: uid,
            displayName: displayName ?? existingByEmail.displayName,
          },
        });
      } else {
        // Crear nuevo usuario
        dbUser = await prisma.user.create({
          data: {
            firebaseUid: uid,
            email: email || '',
            displayName: displayName ?? null,
          },
        });
      }
    }

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
