import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SAR } from '@/types/sar';
import { useToast } from '@/hooks/use-toast';
import { GoAMLService } from '@/services/goaml/GoAMLService';

interface GoAMLReportingProps {
  sars: SAR[];
}

const GoAMLReporting: React.FC<GoAMLReportingProps> = ({ sars = [] }) => {
  const [selectedSarId, setSelectedSarId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownloadXml = (xmlString: string, filename: string) => {
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    if (!selectedSarId) {
      toast({
        title: 'No report selected',
        description: 'Please select a SAR to generate a report.',
        variant: 'destructive',
      });
      return;
    }

    const selectedSar = sars.find(sar => sar.id === selectedSarId);

    if (!selectedSar) {
      toast({
        title: 'Error',
        description: 'Selected SAR not found.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Generating Report...',
      description: `Generating goAML XML report for SAR ID: ${selectedSarId}`,
    });

    try {
      const xmlString = GoAMLService.generateGoAMLXml(selectedSar);
      handleDownloadXml(xmlString, `${selectedSar.id}_goaml_report.xml`);

      toast({
        title: 'Report Generated Successfully',
        description: `The goAML report for ${selectedSar.id} has been downloaded.`,
      });

    } catch (error) {
      console.error('Error generating goAML report:', error);
      toast({
        title: 'Generation Failed',
        description: 'An error occurred while generating the report. Check console for details.',
        variant: 'destructive',
      });
    }
  };

  const reportableSars = (sars || []).filter(sar => sar.status !== 'draft');

  return (
    <Card>
      <CardHeader>
        <CardTitle>goAML Reporting</CardTitle>
        <CardDescription>
          Generate and manage reports for the Swedish Financial Police's goAML system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-md font-medium mb-2">Select a Report</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Select a submitted SAR to generate a goAML-compliant XML file for submission. Reports in 'draft' status are not available here.
          </p>
          <div className="w-full max-w-md">
            <Select onValueChange={setSelectedSarId} value={selectedSarId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select a SAR to report" />
              </SelectTrigger>
              <SelectContent>
                {reportableSars.length > 0 ? (
                  reportableSars.map((sar) => (
                    <SelectItem key={sar.id} value={sar.id}>
                      {sar.id} - {sar.summary.substring(0, 50)}{sar.summary.length > 50 ? '...' : ''}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-sars" disabled>No submitted SARs available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-start">
          <Button onClick={handleGenerateReport} disabled={!selectedSarId}>
            <FileDown className="mr-2 h-4 w-4" />
            Generate goAML Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoAMLReporting;
