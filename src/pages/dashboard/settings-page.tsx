import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useApiEnvironment } from "@/hooks/use-api-environment";
import { ApiEnvironment } from "@/lib/api-environment";
import { CheckCircle2, Globe, RefreshCw, Server, Settings } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { 
    currentEnvironment, 
    currentConfig, 
    availableEnvironments, 
    setApiEnvironment 
  } = useApiEnvironment();
  
  const [selectedEnvironment, setSelectedEnvironment] = useState<ApiEnvironment>(currentEnvironment);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyChanges = () => {
    setIsApplying(true);
    
    // Save the new environment
    setApiEnvironment(selectedEnvironment);
    
    // Show success message
    toast({
      title: "API Environment Updated",
      description: `Switched to ${selectedEnvironment}. The page will reload to apply changes.`,
    });

    // Reload the page after a short delay to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const hasChanges = selectedEnvironment !== currentEnvironment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
          </div>
          <p className="text-gray-600">
            Configure your application preferences and API environment.
          </p>
        </div>

        {/* Current Environment Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-xl">Current Environment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{currentConfig.name}</p>
                <p className="text-sm text-gray-600">{currentConfig.description}</p>
                <p className="text-xs text-gray-500 mt-2 font-mono">{currentConfig.url}</p>
              </div>
              <Globe className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* API Environment Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-gray-700" />
              <CardTitle>API Environment</CardTitle>
            </div>
            <CardDescription>
              Select which API server environment to connect to. GCP is the default production environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup 
              value={selectedEnvironment} 
              onValueChange={(value) => setSelectedEnvironment(value as ApiEnvironment)}
            >
              {availableEnvironments.map((env) => (
                <div 
                  key={env.name}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                    selectedEnvironment === env.name 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={env.name} id={env.name} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={env.name} className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{env.name}</span>
                        {env.name === 'GCP' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                        {currentEnvironment === env.name && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{env.description}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono break-all">{env.url}</p>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Separator />

            {/* Warning Message */}
            {hasChanges && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <RefreshCw className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Page Reload Required</p>
                    <p className="text-sm text-amber-700">
                      Changing the API environment will reload the page to apply the changes. 
                      Any unsaved work will be lost.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleApplyChanges}
                disabled={!hasChanges || isApplying}
                className="flex items-center gap-2"
              >
                {isApplying && <RefreshCw className="h-4 w-4 animate-spin" />}
                Apply Changes
              </Button>
              {hasChanges && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedEnvironment(currentEnvironment)}
                  disabled={isApplying}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">About API Environments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>GCP (Google Cloud Platform):</strong> Production environment with the highest reliability 
              and performance. This is the default and recommended option.
            </p>
            <p>
              <strong>RAILWAY:</strong> Staging environment for testing new features before they go to production.
            </p>
            <p>
              <strong>KOYEB:</strong> Development environment for experimental features and testing.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Note: Environment URLs can be customized using environment variables (VITE_GCP_API_URL, 
              VITE_RAILWAY_API_URL, VITE_KOYEB_API_URL).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

