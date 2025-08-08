
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, FileWarning, Edit3, Send } from 'lucide-react';
import { SAR } from '@/types/sar';
import { format } from 'date-fns';

interface SARListProps {
  sars: SAR[];
  onViewSAR: (id: string) => void;
  onCreateNewSAR: () => void;
  onEditDraft?: (sar: SAR) => void;
  loading?: boolean;
}

const SARList: React.FC<SARListProps> = ({ 
  sars, 
  onViewSAR, 
  onCreateNewSAR, 
  onEditDraft,
  loading = false 
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading SAR reports...</div>
        </CardContent>
      </Card>
    );
  }

  if (!sars || sars.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-32 space-y-4">
          <FileWarning className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium">No SAR reports found</p>
            <p className="text-muted-foreground">Create your first SAR report to get started.</p>
          </div>
          <Button onClick={onCreateNewSAR}>
            Create New SAR
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'submitted':
        return <Badge variant="default">Submitted</Badge>;
      case 'reviewed':
        return <Badge variant="outline">Reviewed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SAR Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SAR ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date of Activity</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sars.map((sar) => (
              <TableRow key={sar.id}>
                <TableCell className="font-mono text-sm">{sar.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{sar.userName}</div>
                    <div className="text-sm text-muted-foreground">{sar.userId.slice(0, 8)}...</div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(sar.dateOfActivity), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(sar.dateSubmitted), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{getStatusBadge(sar.status)}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={sar.summary}>
                    {sar.summary}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSAR(sar.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {sar.status === 'draft' && onEditDraft && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditDraft(sar)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit Draft
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SARList;
