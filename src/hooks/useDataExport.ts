
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useDataExport = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const exportAsJson = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const exportData = {
        profile: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          title: user.title,
          department: user.department,
          phone: user.phone,
          location: user.location,
          status: user.status,
          riskScore: user.riskScore,
          createdAt: new Date().toISOString(),
        },
        preferences: user.preferences,
        roles: {
          platformRoles: user.platform_roles,
          customerRoles: user.customer_roles,
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `user_profile_${user.id}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Profile data exported as JSON');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsCsv = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const csvData = [
        ['Field', 'Value'],
        ['ID', user.id],
        ['Email', user.email],
        ['Name', user.name || ''],
        ['Role', user.role],
        ['Title', user.title || ''],
        ['Department', user.department || ''],
        ['Phone', user.phone || ''],
        ['Location', user.location || ''],
        ['Status', user.status],
        ['Risk Score', user.riskScore.toString()],
        ['Platform Roles', user.platform_roles?.join(', ') || ''],
        ['Customer Roles', user.customer_roles?.join(', ') || ''],
      ];

      const csvContent = csvData.map(row => 
        row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
      const exportFileDefaultName = `user_profile_${user.id}_${new Date().toISOString().split('T')[0]}.csv`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Profile data exported as CSV');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPdf = async () => {
    toast.info('PDF export coming soon');
  };

  return {
    exportAsJson,
    exportAsCsv,
    exportAsPdf,
    isExporting
  };
};
