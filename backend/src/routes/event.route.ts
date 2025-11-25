import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.middleware.js';
import {
  createEvent,
  getEvents,
  getEventById,
  attendEvent,
  cancelAttendance,
  getUserEvents,
} from '../controllers/event.controller.js';

const eventRouter = Router();

// Rutas públicas (requieren auth pero no rol específico)
eventRouter.get('/', verifyFirebaseToken, getEvents);
eventRouter.get('/my-events', verifyFirebaseToken, getUserEvents);
eventRouter.get('/:id', verifyFirebaseToken, getEventById);

// Crear evento
eventRouter.post('/', verifyFirebaseToken, createEvent);

// RSVP
eventRouter.post('/:id/attend', verifyFirebaseToken, attendEvent);
eventRouter.post('/:id/cancel', verifyFirebaseToken, cancelAttendance);

export default eventRouter;
