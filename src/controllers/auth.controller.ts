import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment';
import { FarmerModel } from '../models/Farmer.model';
import { OperatorModel } from '../models/Operator.model';
import { IdGenerator, UserRole, SupportedLanguage } from '@smartfarmer/shared';
import { AuditService } from '../services/audit.service';

export class AuthController {
  /**
   * Farmer Mobile OTP Login / Registration
   */
  public static async farmerSendOtp(req: Request, res: Response) {
    const { mobile } = req.body;
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required' });
    }

    // In prototype, mock OTP 123456
    console.log(`[Mock OTP Service] Sent OTP 123456 to mobile ${mobile}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to registered mobile',
      mockOtp: '123456'
    });
  }

  public static async farmerVerifyOtp(req: Request, res: Response) {
    const { mobile, otp, name, state, district, village, language } = req.body;

    if (!mobile || otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Use demo OTP 123456.' });
    }

    let farmer = await FarmerModel.findOne({ mobile });

    if (!farmer) {
      // Auto-register new farmer with unique Farmer ID
      const stateCode = state ? state.substring(0, 2).toUpperCase() : 'AP';
      const farmerId = IdGenerator.generateFarmerId(stateCode);

      farmer = await FarmerModel.create({
        farmerId,
        mobile,
        name: name || 'Demo Farmer',
        language: (language as SupportedLanguage) || 'te',
        state: state || 'Andhra Pradesh',
        district: district || 'Vizianagaram',
        village: village || 'Garividi',
        landHoldingAcres: 3.5,
        verificationStatus: 'VERIFIED',
        bankAccountRef: 'XXXX-XXXX-' + Math.floor(1000 + Math.random() * 9000),
        ifscCode: 'SBIN0001234'
      });

      await AuditService.recordLog({
        actorId: farmer.farmerId,
        actorName: farmer.name,
        role: UserRole.FARMER,
        action: 'FARMER_REGISTERED',
        entity: 'Farmer',
        entityId: farmer.farmerId
      });
    }

    const payload = {
      userId: farmer.farmerId,
      role: UserRole.FARMER,
      phone: farmer.mobile,
      name: farmer.name
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      token,
      user: {
        farmerId: farmer.farmerId,
        name: farmer.name,
        mobile: farmer.mobile,
        language: farmer.language,
        district: farmer.district,
        state: farmer.state,
        verificationStatus: farmer.verificationStatus,
        role: UserRole.FARMER
      }
    });
  }

  /**
   * Operator Login
   */
  public static async operatorLogin(req: Request, res: Response) {
    const { mobile, password } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const operator = await OperatorModel.findOne({ mobile });
    if (!operator) {
      return res.status(404).json({ success: false, message: 'Operator account not found' });
    }

    if (operator.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Operator account has been suspended by Administrator' });
    }

    const payload = {
      userId: operator.operatorId,
      role: operator.role as UserRole,
      phone: operator.mobile,
      name: operator.name,
      centreIds: operator.centreIds
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      token,
      user: {
        operatorId: operator.operatorId,
        name: operator.name,
        role: operator.role,
        centreIds: operator.centreIds,
        status: operator.status
      }
    });
  }

  /**
   * Admin Login
   */
  public static async adminLogin(req: Request, res: Response) {
    const { username, password } = req.body;

    // Standard demo admin check
    if (username === 'admin' && (password === 'admin123' || !password)) {
      const payload = {
        userId: 'ADMIN-001',
        role: UserRole.ADMIN,
        phone: '9999999999',
        name: 'Ministry Administrator'
      };

      const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({
        success: true,
        token,
        user: {
          adminId: 'ADMIN-001',
          name: 'Ministry of Consumer Affairs (DoCA) Admin',
          role: UserRole.ADMIN
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
}
