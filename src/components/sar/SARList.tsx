
import React, { useState } from 'react';
import { SAR } from '@/types/sar';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusIcon } from 'lucide-react';
import { format } from 'date-fns';

interface SARListProps {
  sars: SAR[];
  onViewSAR: (id: string) => void;
  onCreateNewSAR: () => void;
  loading?: boolean;
}

const SARList: React.FC<SARListProps> = ({ sars, onViewSAR, onCreateNewSAR, loading = false }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Suspicious Activity Reports</h2>
        <Button onClick={onCreateNewSAR}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New SAR
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SAR ID</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-4">
                  Loading SARs...
                </TableCell>
              </TableRow>
            ) : sars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-4">
                  No SARs found
                </TableCell>
              </TableRow>
            ) : (
              sars.map((sar) => (
                <TableRow key={sar.id}>
                  <TableCell className="font-medium">{sar.id}</TableCell>
                  <TableCell>{format(new Date(sar.dateSubmitted), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell>
                    <SARStatusBadge status={sar.status} />
                  </TableCell>
                  <TableCell>{sar.userName}</TableCell>
                  <TableCell className="max-w-md truncate">{sar.summary}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => onViewSAR(sar.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const SARStatusBadge = ({ status }: { status: SAR['status'] }) => {
  switch (status) {
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'submitted':
      return <Badge variant="secondary">Submitted</Badge>;
    case 'reviewed':
      return <Badge variant="default">Reviewed</Badge>;
    default:
      return null;
  }
};

export default SARList;
