
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

const GoAMLReporting = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>goAML Reporting</CardTitle>
        <CardDescription>
          Generate and manage reports for the Swedish Financial Police's goAML system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          This section will allow you to generate XML files for various report types (STR, SAR, etc.) that are compliant with the goAML standard.
          You can select reports, validate them, and download the XML file for submission.
        </p>
        <div className="flex justify-start">
          <Button disabled>
            <FileDown className="mr-2 h-4 w-4" />
            Generate goAML Report (coming soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoAMLReporting;
