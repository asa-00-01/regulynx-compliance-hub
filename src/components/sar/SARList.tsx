
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileWarning, Eye, Edit, Plus } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { SAR } from '@/types/sar';

interface SARListProps {
  sars: SAR[];
  onViewSAR: (id: string) => void;
  onCreateNewSAR: () => void;
  onEditDraft: (sar: SAR) => void;
  loading?: boolean;
}

const SARList: React.FC<SARListProps> = ({
  sars,
  onViewSAR,
  onCreateNewSAR,
  onEditDraft,
  loading = false
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMM dd, yyyy');
      }
      return 'Invalid date';
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'default';
      case 'reviewed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!sars || sars.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileWarning className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No SAR Reports Found</h3>
          <p className="text-muted-foreground text-center mb-4">
            Get started by creating your first Suspicious Activity Report.
          </p>
          <Button onClick={onCreateNewSAR}>
            <Plus className="h-4 w-4 mr-2" />
            Create New SAR
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sars.map((sar) => (
        <Card key={sar.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5" />
                SAR-{sar.id.slice(-6)}
              </CardTitle>
              <Badge variant={getStatusColor(sar.status)}>
                {sar.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium">{sar.userName}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Summary</p>
                <p className="text-sm">{sar.summary}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date of Activity</p>
                  <p>{formatDate(sar.dateOfActivity)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date Submitted</p>
                  <p>{formatDate(sar.dateSubmitted)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Related Transactions</p>
                <p className="text-sm">{sar.transactions?.length || 0} transactions</p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewSAR(sar.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                
                {sar.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditDraft(sar)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Draft
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SARList;
