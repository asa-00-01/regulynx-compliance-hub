import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ToggleLeft, 
  CheckCircle, 
  XCircle, 
  Info,
  RefreshCw,
  Settings
} from 'lucide-react';
import { config } from '@/config/environment';
import { useDebugMode } from '@/hooks/useDebugMode';

interface FeatureFlagStatusProps {
  showControls?: boolean;
  onFlagChange?: (flagName: string, value: boolean) => void;
}

const FeatureFlagStatus: React.FC<FeatureFlagStatusProps> = ({ 
  showControls = false, 
  onFlagChange 
}) => {
  const { debugLog } = useDebugMode();

  const getStoredValue = (key: string, defaultValue: any) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const getFlagStatus = (flagName: string) => {
    const defaultValue = config.features[flagName as keyof typeof config.features];
    const storedValue = getStoredValue(`dev_features_${flagName}`, null);
    const currentValue = storedValue !== null ? storedValue : defaultValue;
    const isOverridden = storedValue !== null;
    
    return {
      value: currentValue,
      isOverridden,
      defaultValue,
      source: isOverridden ? 'localStorage' : 'config'
    };
  };

  const handleFlagToggle = (flagName: string, value: boolean) => {
    if (onFlagChange) {
      onFlagChange(flagName, value);
    } else {
      localStorage.setItem(`dev_features_${flagName}`, JSON.stringify(value));
      debugLog(`Feature flag ${flagName} toggled to ${value}`);
    }
  };

  const handleResetFlag = (flagName: string) => {
    localStorage.removeItem(`dev_features_${flagName}`);
    debugLog(`Feature flag ${flagName} reset to default`);
  };

  const handleResetAll = () => {
    Object.keys(config.features).forEach(key => {
      localStorage.removeItem(`dev_features_${key}`);
    });
    debugLog('All feature flags reset to defaults');
  };

  const flagEntries = Object.entries(config.features).map(([key, defaultValue]) => {
    const status = getFlagStatus(key);
    return { key, ...status };
  });

  const enabledFlags = flagEntries.filter(flag => flag.value);
  const disabledFlags = flagEntries.filter(flag => !flag.value);
  const overriddenFlags = flagEntries.filter(flag => flag.isOverridden);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ToggleLeft className="h-5 w-5" />
          Feature Flags Status
          <Badge variant="outline" className="ml-auto">
            {enabledFlags.length}/{flagEntries.length} Enabled
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Enabled: {enabledFlags.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span>Disabled: {disabledFlags.length}</span>
          </div>
          {overriddenFlags.length > 0 && (
            <div className="flex items-center gap-2 col-span-2">
              <Settings className="h-4 w-4 text-orange-600" />
              <span>Overridden: {overriddenFlags.length}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Feature Flags List */}
        <div className="space-y-3">
          {flagEntries.map((flag) => (
            <div 
              key={flag.key} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                flag.isOverridden ? 'bg-orange-50 border-orange-200' : 'bg-background'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {flag.value ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Label className="font-medium">
                    {flag.key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                </div>
                {flag.isOverridden && (
                  <Badge variant="outline" className="text-xs text-orange-700 border-orange-300">
                    Overridden
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {showControls && (
                  <>
                    <Switch
                      checked={flag.value}
                      onCheckedChange={(checked) => handleFlagToggle(flag.key, checked)}
                    />
                    {flag.isOverridden && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetFlag(flag.key)}
                        className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    debugLog(`Feature flag ${flag.key}:`, {
                      current: flag.value,
                      default: flag.defaultValue,
                      overridden: flag.isOverridden,
                      source: flag.source
                    });
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Info className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {showControls && overriddenFlags.length > 0 && (
          <>
            <Separator />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Reset All Overrides
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureFlagStatus;
