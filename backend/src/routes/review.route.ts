import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.middleware.js';
import { createReview, getEventReviews } from '../controllers/review.controller.js';

const reviewRouter = Router();

// Obtener reviews de un evento
reviewRouter.get('/:eventId', verifyFirebaseToken, getEventReviews);

// Crear/actualizar review
reviewRouter.post('/:eventId', verifyFirebaseToken, createReview);

export default reviewRouter;
