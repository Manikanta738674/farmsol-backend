import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/farmer/send-otp', AuthController.farmerSendOtp);
router.post('/farmer/verify-otp', AuthController.farmerVerifyOtp);
router.put('/farmer/profile', AuthController.updateFarmerProfile);
router.post('/farmer/profile', AuthController.updateFarmerProfile);
router.post('/operator/login', AuthController.operatorLogin);
router.post('/operator/register', AuthController.operatorRegister);
router.post('/admin/login', AuthController.adminLogin);
router.post('/admin/register', AuthController.adminRegister);

export default router;
