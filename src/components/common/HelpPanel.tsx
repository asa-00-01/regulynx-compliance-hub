
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, BookOpen, AlertTriangle, Users, FileText, Activity, Shield } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface HelpItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  tips: string[];
  category: 'risk' | 'compliance' | 'documents' | 'users';
}

const helpItems: HelpItem[] = [
  {
    icon: <Shield className="h-4 w-4" />,
    title: "Risk Assessment",
    description: "Understanding and managing user risk scores",
    category: 'risk',
    tips: [
      "Risk scores range from 0-100, with 75+ being high risk",
      "Multiple factors contribute: PEP status, sanctions, transaction patterns",
      "Regular assessment updates help maintain accuracy",
      "High-risk users require enhanced due diligence"
    ]
  },
  {
    icon: <Users className="h-4 w-4" />,
    title: "User Management",
    description: "Managing customer profiles and KYC verification",
    category: 'users',
    tips: [
      "Use filters to quickly find specific user groups",
      "PEP users require special attention and monitoring",
      "Sanctioned users must be immediately blocked",
      "Unverified emails indicate incomplete onboarding"
    ]
  },
  {
    icon: <FileText className="h-4 w-4" />,
    title: "Document Verification",
    description: "Processing and verifying customer documents",
    category: 'documents',
    tips: [
      "Review extracted data carefully for accuracy",
      "Check document expiration dates",
      "Verify document authenticity and quality",
      "Rejected documents require case creation"
    ]
  },
  {
    icon: <Activity className="h-4 w-4" />,
    title: "Compliance Monitoring",
    description: "Ongoing monitoring and case management",
    category: 'compliance',
    tips: [
      "Monitor alerts for suspicious activities",
      "Create cases for investigation when needed",
      "Document all compliance actions taken",
      "Regular review of high-risk accounts"
    ]
  }
];

interface HelpPanelProps {
  category?: 'risk' | 'compliance' | 'documents' | 'users' | 'all';
  compact?: boolean;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ category = 'all', compact = false }) => {
  const filteredItems = category === 'all' ? helpItems : helpItems.filter(item => item.category === category);
  
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Quick Help
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredItems.slice(0, 2).map((item) => (
            <div key={item.title} className="text-sm">
              <div className="font-medium flex items-center gap-2">
                {item.icon}
                {item.title}
              </div>
              <p className="text-muted-foreground mt-1">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Help & Guidance
          {category !== 'all' && (
            <Badge variant="outline" className="ml-2">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredItems.map((item) => (
          <Collapsible key={item.title}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-0 h-auto"
                onClick={() => toggleItem(item.title)}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-11 mt-2">
              <div className="space-y-2">
                {item.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};

export default HelpPanel;
