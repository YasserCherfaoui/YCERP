import { PasskeySettingsCard } from "@/components/feature-specific/auth/passkey-settings-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useApiEnvironment } from "@/hooks/use-api-environment";
import { ApiEnvironment } from "@/lib/api-environment";
import { cn } from "@/lib/utils";
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
    <div className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="mb-2">
          <div className="mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8 text-muted-foreground" />
            <h1 className="text-3xl font-bold tracking-tight">Application Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure your application preferences and API environment.
          </p>
        </div>

        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Current Environment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-2xl font-bold">{currentConfig.name}</p>
                <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
                <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{currentConfig.url}</p>
              </div>
              <Globe className="h-12 w-12 shrink-0 text-primary/25" />
            </div>
          </CardContent>
        </Card>

        {/* API Environment Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-muted-foreground" />
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
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                    selectedEnvironment === env.name
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-accent/50"
                  )}
                >
                  <RadioGroupItem value={env.name} id={env.name} className="mt-1" />
                  <div className="min-w-0 flex-1">
                    <Label htmlFor={env.name} className="cursor-pointer">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold">{env.name}</span>
                        {env.name === "GCP" && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        {currentEnvironment === env.name && (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{env.description}</p>
                      <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{env.url}</p>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <Separator />

            {/* Warning Message */}
            {hasChanges && (
              <Alert className="border-amber-500/40 bg-amber-500/10">
                <RefreshCw className="text-amber-700 dark:text-amber-300" />
                <AlertTitle>Page reload required</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  Changing the API environment will reload the page to apply the changes.
                  Any unsaved work will be lost.
                </AlertDescription>
              </Alert>
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

        <PasskeySettingsCard />

        {/* Additional Info */}
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle className="text-lg">About API Environments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">GCP (Google Cloud Platform):</strong> Production environment with the highest reliability
              and performance. This is the default and recommended option.
            </p>
            <p>
              <strong className="text-foreground">RAILWAY:</strong> Staging environment for testing new features before they go to production.
            </p>
            <p>
              <strong className="text-foreground">KOYEB:</strong> Development environment for experimental features and testing.
            </p>
            <p className="mt-4 text-xs">
              Note: Environment URLs can be customized using environment variables (VITE_GCP_API_URL,
              VITE_RAILWAY_API_URL, VITE_KOYEB_API_URL).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}







