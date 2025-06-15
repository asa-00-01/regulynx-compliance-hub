
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const mockAuditLogs = [
  {
    date: '2025-05-04T10:15:22Z',
    user: 'Johan Berg',
    action: 'User Created',
    details: 'Created user account for Maria Andersson',
  },
  {
    date: '2025-05-03T16:42:51Z',
    user: 'System',
    action: 'Role Changed',
    details: 'Erik Karlsson changed from Support to Compliance Officer',
  },
  {
    date: '2025-05-03T14:20:10Z',
    user: 'Johan Berg',
    action: 'Login',
    details: 'Successful login from 193.45.88.21',
  },
  {
    date: '2025-05-03T09:16:33Z',
    user: 'Alex Nordström',
    action: 'Document Accessed',
    details: 'Accessed customer KYC document #2824',
  },
  {
    date: '2025-05-02T17:05:04Z',
    user: 'Lena Wikström',
    action: 'Report Generated',
    details: 'Generated Monthly Compliance Report',
  },
];

const AuditLog: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>
          Record of user actions and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-4 p-3 bg-muted/50 text-xs font-medium">
            <div>Date & Time</div>
            <div>User</div>
            <div>Action</div>
            <div>Details</div>
          </div>
          <div className="divide-y">
            {mockAuditLogs.map((log, index) => (
              <div key={index} className="grid grid-cols-4 p-3 items-center">
                <div className="text-sm">
                  {new Date(log.date).toLocaleString('en-SE')}
                </div>
                <div className="font-medium">{log.user}</div>
                <div>{log.action}</div>
                <div className="text-sm">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing 5 of 243 entries
          </div>
          <Button variant="outline">View Full Audit Log</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLog;
