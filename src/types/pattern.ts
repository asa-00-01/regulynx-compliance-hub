
import { AMLTransaction } from './aml';

export interface DetectedPattern {
  id: string;
  name: string;
  description: string;
  category: 'structuring' | 'high_risk_corridor' | 'time_pattern' | 'velocity';
  severity: 'low' | 'medium' | 'high';
  matchCount: number;
  lastDetected: string;
  transactions: AMLTransaction[];
}
