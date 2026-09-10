import fs from 'fs';
import path from 'path';

export interface PersistentData {
  farmers: any[];
  operators: any[];
  admins: any[];
  bookings: any[];
  procurements: any[];
  crops: any[];
  centres: any[];
  auditLogs: any[];
  otps: Record<string, { otp: string; expiresAt: number }>;
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_CROPS = [
  { id: 'CR-PADDY-GRADE-A', name: 'Paddy (Grade A)', nameTe: 'వరి (గ్రేడ్-ఎ)', nameHi: 'धान (ग्रेड-ए)', msp: 2320, marketPrice: 2400, season: 'Kharif 2026', moistureLimit: '≤ 17.0%', lastUpdated: 'Today' },
  { id: 'CR-PADDY-COMMON', name: 'Paddy (Common)', nameTe: 'వరి (సాధారణ)', nameHi: 'धान (सामान्य)', msp: 2300, marketPrice: 2360, season: 'Kharif 2026', moistureLimit: '≤ 17.0%', lastUpdated: 'Today' },
  { id: 'CR-COTTON', name: 'Cotton (Medium Staple)', nameTe: 'పత్తి (మధ్యస్థ ప్రధాన)', nameHi: 'कपास (मध्यम स्टेपल)', msp: 6620, marketPrice: 6750, season: 'Kharif 2026', moistureLimit: '≤ 12.0%', lastUpdated: 'Today' },
  { id: 'CR-WHEAT', name: 'Wheat (Sharbati)', nameTe: 'గోధుమలు', nameHi: 'गेहूं (शरबती)', msp: 2275, marketPrice: 2340, season: 'Rabi 2026', moistureLimit: '≤ 14.0%', lastUpdated: 'Today' },
  { id: 'CR-MAIZE', name: 'Maize (Kharif)', nameTe: 'మొక్కజొన్న', nameHi: 'मक्का (खरीफ)', msp: 2090, marketPrice: 2150, season: 'Kharif 2026', moistureLimit: '≤ 14.5%', lastUpdated: 'Today' }
];

const INITIAL_CENTRES = [
  { centreId: 'PC-AP-SLR-0601', name: 'Salur APMC Agriculture Market Yard #601', district: 'Parvathipuram Manyam / Salur, Andhra Pradesh', lat: 18.5284, lng: 83.2081, dailyQuota: 1800, activeWeighbridges: 3, operators: 4, status: 'Active' },
  { centreId: 'PC-AP-BBL-0602', name: 'Bobbili APMC Grain & Paddy Centre #602', district: 'Bobbili, Parvathipuram Manyam, Andhra Pradesh', lat: 18.5670, lng: 83.3640, dailyQuota: 1500, activeWeighbridges: 3, operators: 3, status: 'Active' },
  { centreId: 'PC-AP-PVP-0603', name: 'Parvathipuram Central APMC Mandi #603', district: 'Parvathipuram Manyam, Andhra Pradesh', lat: 18.7770, lng: 83.4260, dailyQuota: 1600, activeWeighbridges: 3, operators: 4, status: 'Active' },
  { centreId: 'PC-AP-GJP-0604', name: 'Gajapathinagaram APMC Kendra #604', district: 'Vizianagaram, Andhra Pradesh', lat: 18.2830, lng: 83.3330, dailyQuota: 1200, activeWeighbridges: 2, operators: 2, status: 'Active' },
  { centreId: 'PC-AP-VZM-0605', name: 'Vizianagaram Central Market Yard #605', district: 'Vizianagaram, Andhra Pradesh', lat: 18.1124, lng: 83.3970, dailyQuota: 2200, activeWeighbridges: 4, operators: 5, status: 'Active' },
  { centreId: 'PC-AP-SKL-0701', name: 'Srikakulam APMC Rythu Yard #701', district: 'Srikakulam, Andhra Pradesh', lat: 18.2970, lng: 83.8967, dailyQuota: 1400, activeWeighbridges: 2, operators: 3, status: 'Active' },
  { centreId: 'PC-AP-VSKP-0108', name: 'Visakha Kisan Seva Mandi #108', district: 'Visakhapatnam, Andhra Pradesh', lat: 17.6868, lng: 83.2185, dailyQuota: 1000, activeWeighbridges: 2, operators: 2, status: 'Active' },
  { centreId: 'PC-AP-KKD-0402', name: 'Sri Lakshmi APMC Procurement Centre #402', district: 'Kakinada, East Godavari', lat: 16.9891, lng: 82.2475, dailyQuota: 1500, activeWeighbridges: 3, operators: 4, status: 'Active' },
  { centreId: 'PC-AP-RJY-0201', name: 'Godavari Green Mandi Kendra #201', district: 'Rajahmundry, East Godavari', lat: 17.0005, lng: 81.7799, dailyQuota: 1200, activeWeighbridges: 2, operators: 3, status: 'Active' },
  { centreId: 'PC-AP-GNT-0305', name: 'AMC Central APMC Market Yard #305', district: 'Guntur, Andhra Pradesh', lat: 16.3067, lng: 80.4365, dailyQuota: 2000, activeWeighbridges: 4, operators: 5, status: 'Active' },
  { centreId: 'PC-AP-VJA-0504', name: 'Krishna Delta APMC Kendra #504', district: 'Vijayawada, Andhra Pradesh', lat: 16.5062, lng: 80.6480, dailyQuota: 1600, activeWeighbridges: 3, operators: 4, status: 'Active' }
];

const INITIAL_FARMERS = [
  {
    farmerId: 'FR-AP-2026-000124',
    name: 'Prudhvi Pavan',
    mobile: '9125421544',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    landArea: '5.5',
    crops: 'Paddy (Grade A), Cotton',
    bankAccountRef: 'SBI (A/C: ****5512)',
    ifscCode: 'SBIN0001234',
    accountHolderName: 'Prudhvi Pavan',
    verificationStatus: 'VERIFIED'
  },
  {
    farmerId: 'FR-AP-2026-000125',
    name: 'V. Srinivasa Rao',
    mobile: '9848012345',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    landArea: '8.0',
    crops: 'Cotton, Paddy',
    bankAccountRef: 'Andhra Bank (A/C: ****9012)',
    ifscCode: 'ANDB0005432',
    accountHolderName: 'V. Srinivasa Rao',
    verificationStatus: 'VERIFIED'
  }
];

const INITIAL_OPERATORS = [
  { id: 'APMC-54031', name: 'Sai Kumar', email: 'saikumar448470@gmail.com', mobile: '9440188990', centreId: 'CTR-402', centreName: 'AMC Guntur Central (#402)', status: 'Approved' },
  { id: 'APMC-0342', name: 'Pavan Surya', email: 'pavansurya9902@gmail.com', mobile: '9125477889', centreId: 'CTR-108', centreName: 'AMC Tenali Mandi (#108)', status: 'Approved' },
  { id: 'OP-104', name: 'Prudhvi Pavan', email: 'pardhupavan459@gmail.com', mobile: '9125421544', centreId: 'CTR-402', centreName: 'AMC Guntur Central (#402)', status: 'Approved' }
];

class PersistentStoreManager {
  private data: PersistentData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): PersistentData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[PersistentStore] Read error, creating initial store:', err);
    }

    const defaultData: PersistentData = {
      farmers: INITIAL_FARMERS,
      operators: INITIAL_OPERATORS,
      admins: [
        { id: 'ADM-001', name: 'DoCA Central Administrator', email: 'admin@doca.gov.in', role: 'ADMIN' }
      ],
      bookings: [
        {
          bookingId: 'BK-2026-000845',
          tokenId: 'PDC-774321',
          farmerId: 'FR-AP-2026-000124',
          farmerName: 'Prudhvi Pavan',
          centreId: 'CTR-402',
          centreName: 'AMC Guntur Central (#402)',
          cropName: 'Paddy (Grade A)',
          expectedQuantityQuintals: 45,
          bookingDate: 'Today',
          timeWindow: '09:00 AM - 11:00 AM',
          status: 'CONFIRMED',
          currentStage: 'QUALITY',
          farmersAhead: 2,
          estimatedWaitMinutes: 12,
          estimatedPayout: 104400,
          mspRate: 2320,
          paymentStatus: 'PENDING'
        }
      ],
      procurements: [],
      crops: INITIAL_CROPS,
      centres: INITIAL_CENTRES,
      auditLogs: [
        { id: 'AUD-001', action: 'SYSTEM_INITIALIZED', user: 'DoCA Master Engine', details: 'Persistent database initialized for Mandi Network', time: 'Just now' }
      ],
      otps: {}
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave: PersistentData = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[PersistentStore] Failed to write store to disk:', err);
    }
  }

  public getCollection<K extends keyof PersistentData>(name: K): PersistentData[K] {
    return this.data[name];
  }

  public find<K extends keyof PersistentData>(name: K, predicate: (item: any) => boolean): any[] {
    const coll = this.data[name];
    if (Array.isArray(coll)) {
      return coll.filter(predicate);
    }
    return [];
  }

  public findOne<K extends keyof PersistentData>(name: K, predicate: (item: any) => boolean): any | null {
    const coll = this.data[name];
    if (Array.isArray(coll)) {
      return coll.find(predicate) || null;
    }
    return null;
  }

  public insert<K extends keyof PersistentData>(name: K, item: any): any {
    const coll = this.data[name];
    if (Array.isArray(coll)) {
      coll.unshift(item);
      this.saveData();
      return item;
    }
    return null;
  }

  public update<K extends keyof PersistentData>(name: K, predicate: (item: any) => boolean, updater: (item: any) => any): boolean {
    const coll = this.data[name];
    if (Array.isArray(coll)) {
      const idx = coll.findIndex(predicate);
      if (idx !== -1) {
        coll[idx] = updater(coll[idx]);
        this.saveData();
        return true;
      }
    }
    return false;
  }

  public setOtp(mobile: string, otp: string, ttlSeconds: number = 600) {
    this.data.otps[mobile] = {
      otp,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };
    this.saveData();
  }

  public verifyOtp(mobile: string, inputOtp: string): boolean {
    // Universal developer/demo override
    if (inputOtp === '123456') return true;

    const record = this.data.otps[mobile];
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      delete this.data.otps[mobile];
      this.saveData();
      return false;
    }
    if (record.otp === inputOtp) {
      delete this.data.otps[mobile];
      this.saveData();
      return true;
    }
    return false;
  }
}

export const persistentStore = new PersistentStoreManager();
