import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Publicly discoverable centre availability
router.get('/eligible-centres', BookingController.getEligibleCentres);
router.get('/centres/:centreId/availability', BookingController.getCentreAvailability);

// Authenticated booking mutations
router.post('/', authenticate, BookingController.createBooking);
router.post('/:bookingId/cancel', authenticate, BookingController.cancelBooking);
router.post('/:bookingId/reschedule', authenticate, BookingController.rescheduleBooking);

export default router;

