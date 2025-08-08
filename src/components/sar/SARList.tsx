
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, FileWarning, Calendar, User } from 'lucide-react';
import { SAR } from '@/types/sar';
import { useCompliance } from '@/context/ComplianceContext';

interface SARListProps {
  sars: SAR[];
  onViewSAR: (id: string) => void;
  onCreateNewSAR: () => void;
  loading?: boolean;
}

const SARList: React.FC<SARListProps> = ({ sars, onViewSAR, onCreateNewSAR, loading }) => {
  const { getUserById } = useCompliance();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'default';
      case 'reviewed':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <FileWarning className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading SAR reports...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sars.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48">
          <FileWarning className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No SAR Reports</h3>
          <p className="text-muted-foreground text-center mb-4">
            No suspicious activity reports have been created yet.
          </p>
          <Button onClick={onCreateNewSAR}>
            Create First SAR Report
          </Button>
        </CardContent>
      </Card>
    );
  }

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
              <TableHead>Subject User</TableHead>
              <TableHead>Date of Activity</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sars.map((sar) => {
              const user = getUserById(sar.userId);
              return (
                <TableRow key={sar.id}>
                  <TableCell className="font-medium">{sar.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{user?.fullName || sar.userName}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(sar.dateOfActivity)}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(sar.dateSubmitted)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(sar.status)}>
                      {sar.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate" title={sar.summary}>
                      {sar.summary}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSAR(sar.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {sar.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewSAR(sar.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SARList;
