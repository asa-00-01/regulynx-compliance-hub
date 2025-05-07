
import { useState } from 'react';
import { SAR, Pattern, PatternMatch } from '@/types/sar';
import { mockSARs, mockPatterns, mockPatternMatches } from '@/components/sar/mockSARData';
import { useToast } from '@/hooks/use-toast';

export function useSARData() {
  const [sars, setSARs] = useState<SAR[]>(mockSARs);
  const [patterns, setPatterns] = useState<Pattern[]>(mockPatterns);
  const [patternMatches, setPatternMatches] = useState<Record<string, PatternMatch[]>>(mockPatternMatches);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Create a new SAR
  const createSAR = (sar: Omit<SAR, 'id'>) => {
    setLoading(true);
    
    // Generate mock SAR ID
    const newId = `SAR-${new Date().getFullYear()}-${(sars.length + 1).toString().padStart(3, '0')}`;
    
    setTimeout(() => {
      const newSAR: SAR = {
        ...sar,
        id: newId
      };
      
      setSARs(prevSARs => [newSAR, ...prevSARs]);
      setLoading(false);
      
      toast({
        title: `SAR ${sar.status === 'draft' ? 'Draft Saved' : 'Submitted'}`,
        description: `SAR ${newId} has been ${sar.status === 'draft' ? 'saved as draft' : 'submitted successfully'}`,
      });
    }, 800);
    
    return newId;
  };

  // Update an existing SAR
  const updateSAR = (id: string, updates: Partial<SAR>) => {
    setLoading(true);
    
    setTimeout(() => {
      setSARs(prevSARs => 
        prevSARs.map(sar => 
          sar.id === id ? { ...sar, ...updates } : sar
        )
      );
      
      setLoading(false);
      
      toast({
        title: `SAR ${updates.status === 'draft' ? 'Draft Updated' : 'Updated'}`,
        description: `SAR ${id} has been updated successfully`,
      });
    }, 800);
  };

  // Get pattern matches
  const getPatternMatches = (patternId: string) => {
    return patternMatches[patternId] || [];
  };

  // Create an alert from a pattern match
  const createAlertFromMatch = (matchId: string) => {
    // Find the match in pattern matches
    let foundMatch: PatternMatch | undefined;
    let foundPattern: Pattern | undefined;
    
    for (const [patternId, matches] of Object.entries(patternMatches)) {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        foundMatch = match;
        foundPattern = patterns.find(p => p.id === patternId);
        break;
      }
    }
    
    if (!foundMatch || !foundPattern) return;
    
    toast({
      title: "Alert Created",
      description: `New alert created for transaction ${foundMatch.transactionId} matching pattern "${foundPattern.name}"`,
    });
  };

  // Create SAR from pattern match
  const createSARFromMatch = (matchId: string) => {
    // Find the match in pattern matches
    let foundMatch: PatternMatch | undefined;
    let foundPattern: Pattern | undefined;
    
    for (const [patternId, matches] of Object.entries(patternMatches)) {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        foundMatch = match;
        foundPattern = patterns.find(p => p.id === patternId);
        break;
      }
    }
    
    if (!foundMatch || !foundPattern) return null;
    
    // Create a new SAR draft
    const newSar: Omit<SAR, 'id'> = {
      userId: foundMatch.userId,
      userName: foundMatch.userName,
      dateSubmitted: new Date().toISOString(),
      dateOfActivity: foundMatch.timestamp,
      status: 'draft',
      summary: `Suspicious activity based on pattern: ${foundPattern.name}`,
      transactions: [foundMatch.transactionId],
    };
    
    const sarId = createSAR(newSar);
    
    toast({
      title: "SAR Draft Created",
      description: `New SAR draft created from pattern match "${foundPattern.name}"`,
    });
    
    return sarId;
  };

  return {
    sars,
    patterns,
    patternMatches,
    loading,
    createSAR,
    updateSAR,
    getPatternMatches,
    createAlertFromMatch,
    createSARFromMatch
  };
}
