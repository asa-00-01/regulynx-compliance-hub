
import { SAR, SARStatus, Pattern, PatternMatch } from '@/types/sar';

// Mock data with proper type alignment
const mockSARs: SAR[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Doe',
    dateSubmitted: new Date().toISOString(),
    dateOfActivity: new Date().toISOString(),
    status: 'draft' as SARStatus, // Use proper SAR status
    summary: 'Suspicious transaction pattern detected',
    transactions: ['tx-1', 'tx-2'],
    documents: ['doc-1'],
    notes: ['Initial assessment completed']
  }
];

const mockPatterns: Pattern[] = [
  {
    id: '1',
    name: 'High-Risk Corridor',
    description: 'Transactions to/from high-risk jurisdictions',
    category: 'high_risk_corridor', // Use proper pattern category
    createdAt: new Date().toISOString()
  }
];

const mockPatternMatches: PatternMatch[] = [
  {
    id: '1',
    patternId: '1',
    userId: 'user-1',
    userName: 'John Doe',
    transactionId: 'tx-1',
    amount: 50000,
    currency: 'USD',
    country: 'US',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

export class SARService {
  static async getSARs(): Promise<SAR[]> {
    return Promise.resolve(mockSARs);
  }

  static async createSAR(sarData: Omit<SAR, 'id'>): Promise<SAR> {
    const newSAR: SAR = {
      id: crypto.randomUUID(),
      ...sarData,
      status: sarData.status as SARStatus // Ensure proper typing
    };
    mockSARs.push(newSAR);
    return Promise.resolve(newSAR);
  }

  static async updateSAR(id: string, updates: Partial<Omit<SAR, 'id'>>): Promise<SAR> {
    const sarIndex = mockSARs.findIndex(s => s.id === id);
    if (sarIndex === -1) {
      throw new Error('SAR not found');
    }

    mockSARs[sarIndex] = {
      ...mockSARs[sarIndex],
      ...updates,
      status: updates.status as SARStatus // Ensure proper typing
    };

    return Promise.resolve(mockSARs[sarIndex]);
  }

  static async deleteSAR(id: string): Promise<void> {
    const sarIndex = mockSARs.findIndex(s => s.id === id);
    if (sarIndex === -1) {
      throw new Error('SAR not found');
    }
    mockSARs.splice(sarIndex, 1);
    return Promise.resolve();
  }

  static async getPatterns(): Promise<Pattern[]> {
    return Promise.resolve(mockPatterns);
  }

  static async getPatternMatches(patternId: string): Promise<PatternMatch[]> {
    return Promise.resolve(mockPatternMatches.filter(m => m.patternId === patternId));
  }
}
