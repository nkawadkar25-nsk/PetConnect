export type Species = 'Dog' | 'Cat' | 'Other';

export interface PetProfile {
  id: string;
  name: string;
  species: Species;
  breed: string;
  ageYears: number;
  weightKg: number;
  gender: 'Male' | 'Female';
  avatarUrl: string;
  collarSerial: string;
  microchipId: string;
  allergies: string[];
  medicalNotes: string;
  emergencyVet: {
    name: string;
    phone: string;
    clinic: string;
  };
}

export type MotionState = 'Resting' | 'Normal Walking' | 'Running / Active' | 'Pacing' | 'Shivering / Trembling' | 'Scratching / Shaking';
export type VocalPattern = 'None / Silent' | 'Happy Bark' | 'Alert / Territorial Bark' | 'Whimpering / Whining' | 'Panting Heavily' | 'Low Growl';
export type LateralBias = 'Right-biased (Positive / Approach)' | 'Left-biased (Anxious / Withdrawal)' | 'Symmetrical (High Arousal)' | 'Neutral / Relaxed';

export interface CollarTelemetry {
  connected: boolean;
  deviceName: string;
  batteryLevel: number; // 0-100%
  isCharging: boolean;
  signalStrength: number; // dBm e.g. -62
  isBatterySaver: boolean;
  buzzerActive: boolean;
  aloneAtHome: boolean;
  temperature: number; // in Celsius e.g. 38.6
  heartRate: number; // in BPM e.g. 78
  motionState: MotionState;
  acceleration: number; // g-force e.g. 1.15
  soundLevel: number; // dB e.g. 35
  vocalPattern: VocalPattern;
  tailFrequency: number; // Hz e.g. 2.4
  tailAngle: number; // degrees -90 (tucked) to +90 (high erect)
  tailLateralBias: LateralBias;
  tailPattern: string; // e.g. 'Broad relaxed sweep', 'Stiff high vibration', 'Tucked low wag', 'Circular helicopter wag'
  gpsLat: number;
  gpsLng: number;
  inSafeZone: boolean;
  lastSyncTime: string;
}

export interface AIAnalysisResult {
  mood: string;
  moodTag: 'happy' | 'relaxed' | 'anxious' | 'scared' | 'alert' | 'discomfort' | 'aggressive';
  confidence: number;
  stressLevel: 'low' | 'moderate' | 'high' | 'critical';
  tailPatternInterpretation: string;
  biometricAssessment: string;
  actionableTips: string[];
  veterinaryRecommendation: string;
  urgentAlert: boolean;
  urgentAlertMessage?: string;
  analyzedAt: string;
  source?: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  date: string;
  title: string;
  category: 'Wellness Exam' | 'Diagnostics' | 'Vaccination' | 'Surgery / Procedure' | 'Dental' | 'Emergency' | 'Prescription';
  vetClinic: string;
  vetDoctor: string;
  notes: string;
  prescription?: string;
  weightAtTime?: number;
  temperatureAtTime?: number;
  attachments?: string[];
}

export type VaccineStatus = 'Up to Date' | 'Due Soon' | 'Overdue' | 'Scheduled';

export interface Vaccination {
  id: string;
  petId: string;
  name: string;
  category: 'Core' | 'Non-Core' | 'Travel / Special';
  status: VaccineStatus;
  dateAdministered?: string;
  nextDueDate: string;
  batchNumber?: string;
  clinic?: string;
  notes?: string;
}

export interface MealReminder {
  id: string;
  petId: string;
  time: string; // "07:30"
  label: 'Breakfast' | 'Lunch' | 'Dinner' | 'Evening Snack' | 'Supplements';
  portionGrams: number;
  portionDesc: string;
  foodType: 'Dry Kibble' | 'Wet Food' | 'Raw Food' | 'Prescription Diet' | 'Joint Supplement';
  fedToday: boolean;
  lastFedTimestamp?: string;
  reminderEnabled: boolean;
}

export type AlertLevel = 'info' | 'warning' | 'urgent';

export interface AppAlert {
  id: string;
  petId: string;
  timestamp: string;
  level: AlertLevel;
  title: string;
  message: string;
  category: 'vitals' | 'tail' | 'meal' | 'vaccine' | 'collar' | 'alone';
  read: boolean;
}
