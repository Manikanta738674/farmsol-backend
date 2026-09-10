import { Router } from 'express';
import { FarmerController } from '../controllers/farmer.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', FarmerController.getProfile);
router.patch('/language', FarmerController.updateLanguage);
router.get('/dashboard', FarmerController.getDashboard);
router.get('/bookings', FarmerController.getBookings);
router.get('/procurements', FarmerController.getProcurementHistory);
router.get('/notifications', FarmerController.getNotifications);
router.post('/grievances', FarmerController.createGrievance);
router.patch('/bank-details', FarmerController.updateBankDetails);

export default router;

