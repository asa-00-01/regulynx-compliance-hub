
import { SAR, SARStatus, Pattern, PatternMatch } from '@/types/sar';
import { supabase } from '@/integrations/supabase/client';

// Mock data for patterns and pattern matches (these can stay as mock for now)
const mockPatterns: Pattern[] = [
  {
    id: '1',
    name: 'High-Risk Corridor',
    description: 'Transactions to/from high-risk jurisdictions',
    category: 'high_risk_corridor',
    matchCount: 3,
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
    try {
      const { data, error } = await supabase
        .from('sars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SARs:', error);
        throw error;
      }

      // Transform database data to SAR format
      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        dateSubmitted: row.date_submitted,
        dateOfActivity: row.date_of_activity,
        status: row.status as SARStatus,
        summary: row.summary,
        transactions: row.transactions || [],
        documents: row.documents || [],
        notes: row.notes || []
      }));
    } catch (error) {
      console.error('Failed to fetch SARs:', error);
      return [];
    }
  }

  static async createSAR(sarData: Omit<SAR, 'id'>): Promise<SAR> {
    try {
      const { data, error } = await supabase
        .from('sars')
        .insert({
          user_id: sarData.userId,
          user_name: sarData.userName,
          date_submitted: sarData.dateSubmitted,
          date_of_activity: sarData.dateOfActivity,
          status: sarData.status,
          summary: sarData.summary,
          transactions: sarData.transactions || [],
          documents: sarData.documents || [],
          notes: sarData.notes || []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating SAR:', error);
        throw error;
      }

      // Transform database result back to SAR format
      return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        dateSubmitted: data.date_submitted,
        dateOfActivity: data.date_of_activity,
        status: data.status as SARStatus,
        summary: data.summary,
        transactions: data.transactions || [],
        documents: data.documents || [],
        notes: data.notes || []
      };
    } catch (error) {
      console.error('Failed to create SAR:', error);
      throw error;
    }
  }

  static async updateSAR(id: string, updates: Partial<Omit<SAR, 'id'>>): Promise<SAR> {
    try {
      // Transform updates to database format
      const dbUpdates: any = {};
      if (updates.userId) dbUpdates.user_id = updates.userId;
      if (updates.userName) dbUpdates.user_name = updates.userName;
      if (updates.dateSubmitted) dbUpdates.date_submitted = updates.dateSubmitted;
      if (updates.dateOfActivity) dbUpdates.date_of_activity = updates.dateOfActivity;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.summary) dbUpdates.summary = updates.summary;
      if (updates.transactions) dbUpdates.transactions = updates.transactions;
      if (updates.documents) dbUpdates.documents = updates.documents;
      if (updates.notes) dbUpdates.notes = updates.notes;

      const { data, error } = await supabase
        .from('sars')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating SAR:', error);
        throw error;
      }

      // Transform database result back to SAR format
      return {
        id: data.id,
        userId: data.user_id,
        userName: data.user_name,
        dateSubmitted: data.date_submitted,
        dateOfActivity: data.date_of_activity,
        status: data.status as SARStatus,
        summary: data.summary,
        transactions: data.transactions || [],
        documents: data.documents || [],
        notes: data.notes || []
      };
    } catch (error) {
      console.error('Failed to update SAR:', error);
      throw error;
    }
  }

  static async deleteSAR(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sars')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting SAR:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete SAR:', error);
      throw error;
    }
  }

  static async getPatterns(): Promise<Pattern[]> {
    return Promise.resolve(mockPatterns);
  }

  static async getPatternMatches(patternId: string): Promise<PatternMatch[]> {
    return Promise.resolve(mockPatternMatches.filter(m => m.patternId === patternId));
  }
}
