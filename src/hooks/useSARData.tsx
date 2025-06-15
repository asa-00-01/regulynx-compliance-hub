
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SARService } from '@/services/sar/SARService';
import { SAR, Pattern, PatternMatch } from '@/types/sar';
import { useToast } from '@/hooks/use-toast';

export function useSARData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sars = [], isLoading: sarsLoading } = useQuery({
    queryKey: ['sars'],
    queryFn: SARService.getSARs,
  });

  const { data: patterns = [], isLoading: patternsLoading } = useQuery({
    queryKey: ['patterns'],
    queryFn: SARService.getPatterns,
  });

  const createSarMutation = useMutation({
    mutationFn: SARService.createSAR,
    onSuccess: (newSar) => {
      queryClient.invalidateQueries({ queryKey: ['sars'] });
      toast({
        title: `SAR ${newSar.status === 'draft' ? 'Draft Saved' : 'Submitted'}`,
        description: `SAR ${newSar.id} has been ${newSar.status === 'draft' ? 'saved as draft' : 'submitted successfully'}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating SAR',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateSarMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<SAR, 'id'>> }) => SARService.updateSAR(id, updates),
    onSuccess: (updatedSar) => {
      queryClient.invalidateQueries({ queryKey: ['sars'] });
      toast({
        title: `SAR ${updatedSar.status === 'draft' ? 'Draft Updated' : 'Updated'}`,
        description: `SAR ${updatedSar.id} has been updated successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating SAR',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getPatternMatches = async (patternId: string): Promise<PatternMatch[]> => {
    if (!patternId) return [];
    try {
      return await SARService.getPatternMatches(patternId);
    } catch (error) {
      toast({
        title: 'Error fetching pattern matches',
        description: (error as Error).message,
        variant: 'destructive',
      });
      return [];
    }
  };

  const createAlertFromMatch = (match: PatternMatch) => {
    const pattern = patterns.find(p => p.id === match.patternId);
    toast({
      title: "Alert Created",
      description: `New alert created for transaction ${match.transactionId} matching pattern "${pattern?.name}"`,
    });
  };

  const createSARFromMatch = (match: PatternMatch) => {
    if (!match) return;

    const pattern = patterns.find(p => p.id === match.patternId);

    const newSar: Omit<SAR, 'id'> = {
      userId: match.userId,
      userName: match.userName,
      dateSubmitted: new Date().toISOString(),
      dateOfActivity: match.timestamp,
      status: 'draft',
      summary: `Suspicious activity based on pattern: ${pattern?.name || 'Unknown'}`,
      transactions: [match.transactionId],
    };

    createSarMutation.mutate(newSar);
  };

  return {
    sars,
    patterns,
    loading: sarsLoading || patternsLoading || createSarMutation.isPending || updateSarMutation.isPending,
    createSAR: createSarMutation.mutate,
    updateSAR: updateSarMutation.mutate,
    getPatternMatches,
    createAlertFromMatch,
    createSARFromMatch,
  };
}
