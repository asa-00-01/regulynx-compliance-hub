
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import config from '@/config/environment';
import { Settings, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDraggable } from '@/hooks/useDraggable';
import { cn } from '@/lib/utils';

interface DeveloperPanelProps {
  embedded?: boolean;
}

const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ embedded = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const devPanelButtonRef = useRef<HTMLButtonElement>(null);
  const { style, onMouseDown, hasInitialized } = useDraggable(devPanelButtonRef);
  
  const [apiConfig, setApiConfig] = useState({ baseUrl: config.api.baseUrl });
  const [appConfig, setAppConfig] = useState({ 
    name: config.app.name, 
    domain: config.app.domain, 
    supportEmail: config.app.supportEmail 
  });
  const [featureFlags, setFeatureFlags] = useState(config.features);

  const handleFeatureFlagChange = (flagName: keyof typeof config.features, value: boolean) => {
    setFeatureFlags((prev) => ({ ...prev, [flagName]: value }));
  };

  const formatFlagName = (name: string) => {
    const result = name.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const handleSave = () => {
    // API
    localStorage.setItem('dev_api_baseUrl', JSON.stringify(apiConfig.baseUrl));
    // App
    localStorage.setItem('dev_app_name', JSON.stringify(appConfig.name));
    localStorage.setItem('dev_app_domain', JSON.stringify(appConfig.domain));
    localStorage.setItem('dev_app_supportEmail', JSON.stringify(appConfig.supportEmail));
    // Features
    Object.entries(featureFlags).forEach(([key, value]) => {
      localStorage.setItem(`dev_features_${key}`, JSON.stringify(value));
    });

    toast.info('Settings saved. Reloading page to apply changes...');
    setTimeout(() => window.location.reload(), 2000);
  };

  const handleReset = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('dev_')) {
        localStorage.removeItem(key);
      }
    });
    toast.info('All overrides reset. Reloading page...');
    setTimeout(() => window.location.reload(), 2000);
  };

  // If embedded, show the content directly
  if (embedded) {
    return (
      <div className="w-full max-w-2xl">
        <div className="space-y-6">
          <Accordion type="multiple" defaultValue={['app-api', 'features']} className="w-full">
            <AccordionItem value="app-api">
              <AccordionTrigger>App & API Configuration</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="appName">App Name</Label>
                  <Input id="appName" value={appConfig.name} onChange={(e) => setAppConfig(p => ({...p, name: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appDomain">App Domain</Label>
                  <Input id="appDomain" value={appConfig.domain} onChange={(e) => setAppConfig(p => ({...p, domain: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input id="supportEmail" value={appConfig.supportEmail} onChange={(e) => setAppConfig(p => ({...p, supportEmail: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiUrl">API Base URL</Label>
                  <Input id="apiUrl" value={apiConfig.baseUrl} onChange={(e) => setApiConfig({ baseUrl: e.target.value })} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="features">
              <AccordionTrigger>Feature Flags</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {Object.entries(featureFlags).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <Label htmlFor={key} className="text-base">{formatFlagName(key)}</Label>
                    </div>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => handleFeatureFlagChange(key as keyof typeof config.features, checked)}
                    />
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={handleReset} className="text-destructive hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Reset All Overrides
            </Button>
            <Button onClick={handleSave}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Save and Reload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Don't show floating version anymore
  return null;
};

export default DeveloperPanel;
