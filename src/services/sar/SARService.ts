
import { supabase } from '@/integrations/supabase/client';
import { SAR, Pattern, PatternMatch } from '@/types/sar';

interface PatternRow {
  id: string;
  name: string;
  description: string;
  category: 'structuring' | 'velocity' | 'geography' | 'amount';
  created_at: string;
}

export type SARStatus = 'draft' | 'submitted' | 'reviewed' | 'filed';

export const SARService = {
  // Map database status to SARStatus
  mapDbStatusToSAR: (dbStatus: 'draft' | 'submitted' | 'filed' | 'rejected'): SARStatus => {
    switch (dbStatus) {
      case 'rejected': return 'reviewed'; // Map rejected to reviewed for compatibility
      default: return dbStatus as SARStatus;
    }
  },

  // Map SAR status to database status  
  mapSARStatusToDb: (sarStatus: SARStatus): 'draft' | 'submitted' | 'filed' | 'rejected' => {
    switch (sarStatus) {
      case 'reviewed': return 'filed'; // Map reviewed to filed for database
      default: return sarStatus as 'draft' | 'submitted' | 'filed' | 'rejected';
    }
  },

  // Map database pattern category to Pattern category
  mapDbCategoryToPattern: (dbCategory: 'structuring' | 'velocity' | 'geography' | 'amount'): Pattern['category'] => {
    switch (dbCategory) {
      case 'velocity': return 'time_pattern';
      case 'geography': return 'high_risk_corridor';
      default: return dbCategory;
    }
  },

  async getSARs(): Promise<SAR[]> {
    return this.getAllSARs();
  },

  async getAllSARs(): Promise<SAR[]> {
    try {
      const { data, error } = await supabase
        .from('sars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SARs:', error);
        throw error;
      }

      return data?.map(sar => ({
        id: sar.id,
        userId: sar.user_id || '',
        userName: sar.user_name || '',
        dateSubmitted: sar.date_submitted || sar.created_at,
        dateOfActivity: sar.date_of_activity || sar.created_at,
        status: SARService.mapDbStatusToSAR(sar.status),
        summary: sar.summary || '',
        transactions: sar.transactions || [],
        documents: sar.documents || [],
        notes: sar.notes || []
      })) || [];
    } catch (error) {
      console.error('Error in getAllSARs:', error);
      return [];
    }
  },

  async getPatterns(): Promise<Pattern[]> {
    try {
      const { data, error } = await supabase
        .from('patterns')
        .select(`
          *,
          pattern_matches(count)
        `);

      if (error) {
        console.error('Error fetching patterns:', error);
        return [];
      }

      return data?.map(pattern => ({
        id: pattern.id,
        name: pattern.name,
        description: pattern.description,
        matchCount: Array.isArray(pattern.pattern_matches) ? pattern.pattern_matches.length : 0,
        category: SARService.mapDbCategoryToPattern(pattern.category)
      })) || [];
    } catch (error) {
      console.error('Error in getPatterns:', error);
      return [];
    }
  },

  async getPatternMatches(patternId: string): Promise<PatternMatch[]> {
    try {
      const { data, error } = await supabase
        .from('pattern_matches')
        .select('*')
        .eq('pattern_id', patternId);

      if (error) {
        console.error('Error fetching pattern matches:', error);
        return [];
      }

      return data?.map(match => ({
        id: match.id,
        patternId: match.pattern_id,
        userId: match.user_id,
        userName: match.user_name,
        transactionId: match.transaction_id,
        country: match.country,
        amount: Number(match.amount),
        currency: match.currency,
        timestamp: match.timestamp,
      })) || [];
    } catch (error) {
      console.error('Error in getPatternMatches:', error);
      return [];
    }
  },

  async createSAR(sarData: Partial<SAR>): Promise<SAR | null> {
    try {
      const { data, error } = await supabase
        .from('sars')
        .insert({
          user_id: sarData.userId,
          user_name: sarData.userName,
          date_submitted: sarData.dateSubmitted || new Date().toISOString(),
          date_of_activity: sarData.dateOfActivity,
          status: SARService.mapSARStatusToDb(sarData.status || 'draft'),
          summary: sarData.summary,
          transactions: sarData.transactions,
          documents: sarData.documents,
          notes: sarData.notes
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id || '',
        userName: data.user_name || '',
        dateSubmitted: data.date_submitted || data.created_at,
        dateOfActivity: data.date_of_activity || data.created_at,
        status: SARService.mapDbStatusToSAR(data.status),
        summary: data.summary || '',
        transactions: data.transactions || [],
        documents: data.documents || [],
        notes: data.notes || []
      };
    } catch (error) {
      console.error('Error creating SAR:', error);
      return null;
    }
  },

  async updateSAR(id: string, updates: Partial<SAR>): Promise<SAR | null> {
    try {
      const updateData: any = {};
      
      if (updates.status) {
        updateData.status = SARService.mapSARStatusToDb(updates.status);
      }
      if (updates.summary !== undefined) updateData.summary = updates.summary;
      if (updates.transactions !== undefined) updateData.transactions = updates.transactions;
      if (updates.documents !== undefined) updateData.documents = updates.documents;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('sars')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id || '',
        userName: data.user_name || '',
        dateSubmitted: data.date_submitted || data.created_at,
        dateOfActivity: data.date_of_activity || data.created_at,
        status: SARService.mapDbStatusToSAR(data.status),
        summary: data.summary || '',
        transactions: data.transactions || [],
        documents: data.documents || [],
        notes: data.notes || []
      };
    } catch (error) {
      console.error('Error updating SAR:', error);
      return null;
    }
  },

  async deleteSAR(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sars')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting SAR:', error);
      return false;
    }
  }
};
