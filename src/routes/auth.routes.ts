import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/farmer/send-otp', AuthController.farmerSendOtp);
router.post('/farmer/verify-otp', AuthController.farmerVerifyOtp);
router.post('/operator/login', AuthController.operatorLogin);
router.post('/admin/login', AuthController.adminLogin);

export default router;
