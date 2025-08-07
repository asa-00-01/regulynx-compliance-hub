
import { supabase } from '@/integrations/supabase/client';
import { SAR, Pattern, PatternMatch } from '@/types/sar';
import { Database } from '@/integrations/supabase/types';

type SarInsert = Database['public']['Tables']['sars']['Insert'];
type SarUpdate = Database['public']['Tables']['sars']['Update'];
type SarRow = Database['public']['Tables']['sars']['Row'];

type PatternRow = Database['public']['Tables']['patterns']['Row'];
type PatternMatchRow = Database['public']['Tables']['pattern_matches']['Row'];

const mapSarToApp = (sar: SarRow): SAR => ({
  id: sar.id,
  userId: sar.user_id,
  userName: sar.user_name,
  dateSubmitted: sar.date_submitted,
  dateOfActivity: sar.date_of_activity,
  status: sar.status,
  summary: sar.summary,
  transactions: sar.transactions,
  documents: sar.documents || undefined,
  notes: sar.notes || undefined,
});

const mapPatternToApp = (pattern: PatternRow & { pattern_matches: { count: number }[] }): Pattern => ({
    id: pattern.id,
    name: pattern.name,
    description: pattern.description,
    category: pattern.category,
    matchCount: pattern.pattern_matches[0]?.count || 0,
});

const mapPatternMatchToApp = (match: PatternMatchRow): PatternMatch => ({
  id: match.id,
  patternId: match.pattern_id,
  userId: match.user_id,
  userName: match.user_name,
  transactionId: match.transaction_id,
  country: match.country,
  amount: Number(match.amount),
  currency: match.currency,
  timestamp: match.timestamp,
});

export const SARService = {
  async getSARs(): Promise<SAR[]> {
    const { data, error } = await supabase.from('sars').select('*').order('date_submitted', { ascending: false });
    if (error) throw error;
    return data.map(mapSarToApp);
  },

  async getPatterns(): Promise<Pattern[]> {
    const { data, error } = await supabase
      .from('patterns')
      .select('*, pattern_matches(count)');
      
    if (error) throw error;
    // @ts-ignore
    return data.map(mapPatternToApp);
  },

  async getPatternMatches(patternId: string): Promise<PatternMatch[]> {
    const { data, error } = await supabase
      .from('pattern_matches')
      .select('*')
      .eq('pattern_id', patternId);
    if (error) throw error;
    return data.map(mapPatternMatchToApp);
  },

  async createSAR(sarData: Omit<SAR, 'id'>): Promise<SAR> {
    const sarToInsert: SarInsert = {
      user_id: sarData.userId,
      user_name: sarData.userName,
      date_submitted: sarData.dateSubmitted,
      date_of_activity: sarData.dateOfActivity,
      status: sarData.status,
      summary: sarData.summary,
      transactions: sarData.transactions,
      documents: sarData.documents,
      notes: sarData.notes,
    };
    const { data, error } = await supabase.from('sars').insert(sarToInsert).select().single();
    if (error) throw error;
    return mapSarToApp(data);
  },

  async updateSAR(id: string, updates: Partial<Omit<SAR, 'id'>>): Promise<SAR> {
    const sarToUpdate: SarUpdate = {};
    if (updates.userId) sarToUpdate.user_id = updates.userId;
    if (updates.userName) sarToUpdate.user_name = updates.userName;
    if (updates.dateSubmitted) sarToUpdate.date_submitted = updates.dateSubmitted;
    if (updates.dateOfActivity) sarToUpdate.date_of_activity = updates.dateOfActivity;
    if (updates.status) sarToUpdate.status = updates.status;
    if (updates.summary) sarToUpdate.summary = updates.summary;
    if (updates.transactions) sarToUpdate.transactions = updates.transactions;
    if (updates.documents) sarToUpdate.documents = updates.documents;
    if (updates.notes) sarToUpdate.notes = updates.notes;
    
    const { data, error } = await supabase.from('sars').update(sarToUpdate).eq('id', id).select().single();
    if (error) throw error;
    return mapSarToApp(data);
  },

  async deleteSAR(id: string): Promise<void> {
    const { error } = await supabase.from('sars').delete().eq('id', id);
    if (error) throw error;
  },
};
