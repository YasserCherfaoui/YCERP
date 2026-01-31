import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
    getWhatsAppAvailablePaths,
    getWhatsAppSettings,
    getWhatsAppTemplateDetails,
    getWhatsAppTemplates,
    updateWhatsAppSettings,
    type AvailablePath,
    type ParameterMapping,
    type WhatsAppSettings,
    type WhatsAppTemplate,
} from "@/services/whatsapp-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ACTIONS = [
  {
    value: "client_status_created",
    label: "Client Status Created",
    description: "Template to send when a client status is created",
  },
  {
    value: "supplier_bill_created",
    label: "Supplier Bill Created",
    description: "Template to send when a supplier bill is created",
  },
];

interface TemplateParamInfo {
  componentType: "header" | "body";
  paramIndex: number;
}

function extractTemplateParams(template: WhatsAppTemplate): TemplateParamInfo[] {
  const params: TemplateParamInfo[] = [];
  
  // Check HEADER component
  const header = template.components?.find((c) => c.type === "HEADER");
  if (header?.text) {
    const matches = header.text.match(/\{\{(\d+)\}\}/g) || [];
    matches.forEach((m) => {
      const idx = parseInt(m.replace(/\{\{|\}\}/g, ""), 10);
      params.push({ componentType: "header", paramIndex: idx });
    });
  }
  
  // Check BODY component
  const body = template.components?.find((c) => c.type === "BODY");
  if (body?.text) {
    const matches = body.text.match(/\{\{(\d+)\}\}/g) || [];
    matches.forEach((m) => {
      const idx = parseInt(m.replace(/\{\{|\}\}/g, ""), 10);
      params.push({ componentType: "body", paramIndex: idx });
    });
  }
  
  return params;
}

export default function WhatsAppSettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const company = useSelector((state: RootState) => state.company.company);

  if (!company) return null;

  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["whatsapp-settings", company.ID],
    queryFn: () => getWhatsAppSettings(company.ID),
    enabled: !!company,
  });

  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: () => getWhatsAppTemplates(),
  });

  const templates = templatesData?.data || [];
  const settings = settingsData?.data || [];

  const settingsMap = useMemo(() => {
    const m = new Map<string, WhatsAppSettings>();
    settings.forEach((s) => m.set(s.action, s));
    return m;
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      action: string;
      template_name: string;
      language_code: string;
      enabled: boolean;
      parameter_mappings?: ParameterMapping[];
      phone_numbers?: string[];
      message_type?: "text" | "template";
    }) => updateWhatsAppSettings(company.ID, data),
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "WhatsApp settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-settings", company.ID] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const handleUpdate = (
    action: string,
    templateName: string,
    languageCode: string,
    enabled: boolean,
    parameterMappings?: ParameterMapping[],
    phoneNumbers?: string[],
    messageType?: "text" | "template"
  ) => {
    updateMutation.mutate({
      action,
      template_name: templateName,
      language_code: languageCode,
      enabled,
      parameter_mappings: parameterMappings,
      phone_numbers: phoneNumbers,
      message_type: messageType,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          <div>
            <h1 className="text-3xl font-bold">WhatsApp Settings</h1>
            <p className="text-muted-foreground">
              Configure templates and parameter mappings for automated notifications
            </p>
          </div>
        </div>
      </div>

      {isLoadingSettings || isLoadingTemplates ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading settings...</span>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ACTIONS.map((action) => (
            <ActionCard
              key={action.value}
              action={action}
              setting={settingsMap.get(action.value)}
              templates={templates}
              onUpdate={handleUpdate}
              isUpdating={updateMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ... imports
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

// ... existing code ...

function ActionCard({
  action,
  setting,
  templates,
  onUpdate,
  isUpdating,
}: {
  action: (typeof ACTIONS)[0];
  setting: WhatsAppSettings | undefined;
  templates: WhatsAppTemplate[];
  onUpdate: (
    action: string,
    templateName: string,
    languageCode: string,
    enabled: boolean,
    parameterMappings?: ParameterMapping[],
    phoneNumbers?: string[],
    messageType?: "text" | "template"
  ) => void;
  isUpdating: boolean;
}) {
  const selectedTemplate = setting?.template_name || "";
  const selectedLanguage = setting?.language_code || "en";
  const isEnabled = setting?.enabled ?? false;
  const initialPhoneNumbers = setting?.phone_numbers || [];
  const messageType = setting?.message_type || "template";
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(initialPhoneNumbers);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");

  const { data: templateDetails } = useQuery({
    queryKey: ["whatsapp-template-details", selectedTemplate, selectedLanguage],
    queryFn: () => getWhatsAppTemplateDetails(selectedTemplate, selectedLanguage),
    enabled: !!selectedTemplate && !!selectedLanguage && messageType === "template",
  });

  const { data: pathsData } = useQuery({
    queryKey: ["whatsapp-available-paths", action.value],
    queryFn: () => getWhatsAppAvailablePaths(action.value),
    enabled: !!selectedTemplate,
  });

  const templateParams = templateDetails?.data ? extractTemplateParams(templateDetails.data) : [];
  const headerParams = templateParams.filter((p) => p.componentType === "header");
  const bodyParams = templateParams.filter((p) => p.componentType === "body");
  const availablePaths: AvailablePath[] = pathsData?.data || [];

  const mappingByKey = useMemo(() => {
    const m: Record<string, string> = {}; // key: "header:1" or "body:1"
    (setting?.parameter_mappings ?? []).forEach((pm) => {
      const compType = pm.component_type || "body";
      const key = `${compType}:${pm.parameter_index}`;
      m[key] = pm.path;
    });
    return m;
  }, [setting?.parameter_mappings]);

  const getMappingsArray = (currentMappingByKey: Record<string, string>) => {
    return Object.entries(currentMappingByKey)
      .filter(([, p]) => p)
      .map(([k, p]) => {
        const [comp, idx] = k.split(":");
        return {
          parameter_index: parseInt(idx, 10),
          path: p,
          component_type: comp as "header" | "body",
        };
      })
      .sort((a, b) => {
        if (a.component_type !== b.component_type) {
          return a.component_type === "header" ? -1 : 1;
        }
        return a.parameter_index - b.parameter_index;
      });
  };

  const handleUtilityUpdate = (
    newEnabled: boolean,
    newTemplate: string,
    newLang: string,
    newMappings: ParameterMapping[],
    newPhoneNumbers: string[],
    newMessageType: "text" | "template"
  ) => {
    onUpdate(action.value, newTemplate, newLang, newEnabled, newMappings, newPhoneNumbers, newMessageType);
  };

  const handleMappingChange = (componentType: "header" | "body", paramIndex: number, path: string) => {
    const next = { ...mappingByKey };
    const key = `${componentType}:${paramIndex}`;
    if (path && path !== "__none__") {
      next[key] = path;
    } else {
      delete next[key];
    }
    const arr = getMappingsArray(next);
    handleUtilityUpdate(isEnabled, selectedTemplate, selectedLanguage, arr, phoneNumbers, messageType);
  };

  const handleAddPhoneNumber = () => {
    if (newPhoneNumber && !phoneNumbers.includes(newPhoneNumber)) {
      const updatedNumbers = [...phoneNumbers, newPhoneNumber];
      setPhoneNumbers(updatedNumbers);
      setNewPhoneNumber("");
      handleUtilityUpdate(isEnabled, selectedTemplate, selectedLanguage, getMappingsArray(mappingByKey), updatedNumbers, messageType);
    }
  };

  const handleRemovePhoneNumber = (phone: string) => {
    const updatedNumbers = phoneNumbers.filter((p) => p !== phone);
    setPhoneNumbers(updatedNumbers);
    handleUtilityUpdate(isEnabled, selectedTemplate, selectedLanguage, getMappingsArray(mappingByKey), updatedNumbers, messageType);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{action.label}</CardTitle>
        <CardDescription>{action.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor={`enabled-${action.value}`}>Enable notifications</Label>
          <Switch
            id={`enabled-${action.value}`}
            checked={isEnabled}
            disabled={(messageType === "template" && !selectedTemplate) || isUpdating}
            onCheckedChange={(checked) => {
              if (messageType === "template" && !selectedTemplate) return;
              handleUtilityUpdate(checked, selectedTemplate, selectedLanguage, getMappingsArray(mappingByKey), phoneNumbers, messageType);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Message Type</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`type-template-${action.value}`}
                name={`message-type-${action.value}`}
                value="template"
                checked={messageType === "template"}
                onChange={() => handleUtilityUpdate(isEnabled, selectedTemplate, selectedLanguage, getMappingsArray(mappingByKey), phoneNumbers, "template")}
                disabled={isUpdating}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor={`type-template-${action.value}`}>Template Message</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`type-text-${action.value}`}
                name={`message-type-${action.value}`}
                value="text"
                checked={messageType === "text"}
                onChange={() => handleUtilityUpdate(isEnabled, selectedTemplate, selectedLanguage, getMappingsArray(mappingByKey), phoneNumbers, "text")}
                disabled={isUpdating}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor={`type-text-${action.value}`}>Text Message</Label>
            </div>
          </div>
        </div>

        {/* Phone Numbers Section - For supplier_bill_created */}
        {action.value === "supplier_bill_created" && (
          <div className="space-y-2 rounded-lg border p-3">
            <Label className="text-sm font-semibold">Notification Recipients</Label>
            <p className="text-xs text-muted-foreground">
              Add phone numbers to receive the bill notification. If empty, no notifications will be sent.
            </p>
            
            <div className="flex gap-2">
              <Input
                placeholder="e.g. +1234567890"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                className="max-w-[200px]"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddPhoneNumber}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1">
              {phoneNumbers.map((phone) => (
                <div key={phone} className="flex items-center justify-between rounded bg-muted p-2 px-3 text-sm">
                  <span>{phone}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => handleRemovePhoneNumber(phone)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {phoneNumbers.length === 0 && (
                <div className="text-sm text-muted-foreground italic">No recipients configured</div>
              )}
            </div>
          </div>
        )}

        {messageType === "text" && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                <p className="font-medium">Text Message Mode</p>
                <p>The system will send a standard WhatsApp text message containing the full details of the supplier bill (items, prices, total).</p>
            </div>
        )}

        {messageType === "template" && (
            <>
                <div className="space-y-2">
                  <Label htmlFor={`template-${action.value}`}>Template</Label>
                  <Select
                    value={selectedTemplate}
                    disabled={isUpdating}
                    onValueChange={(value) => {
                      const t = templates.find((x) => x.name === value);
                      const lang = t?.language || "en";
                      // Reset mappings when template changes, keep phone numbers
                      handleUtilityUpdate(isEnabled, value, lang, [], phoneNumbers, messageType);
                    }}
                  >
                    <SelectTrigger id={`template-${action.value}`}>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.length === 0 ? (
                        <SelectItem value="no-templates" disabled>
                          No templates available
                        </SelectItem>
                      ) : (
                        templates.map((t) => (
                          <SelectItem key={`${t.name}-${t.language}`} value={t.name}>
                            {t.name} ({t.language}) - {t.status}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && templateParams.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Parameter mappings</Label>
                      <p className="text-sm text-muted-foreground">
                        Map each template parameter to a context path (e.g. woo_order.billing_name).
                      </p>
                    </div>
                    
                    {headerParams.length > 0 && (
                      <div className="space-y-2 rounded-lg border p-3">
                        <Label className="text-sm font-semibold">Header Parameters</Label>
                        <div className="grid gap-2">
                          {headerParams.map((param) => {
                            const key = `header:${param.paramIndex}`;
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <span className="w-32 shrink-0 text-sm">Header {param.paramIndex}</span>
                                <Select
                                  value={mappingByKey[key] || "__none__"}
                                  onValueChange={(path) => handleMappingChange("header", param.paramIndex, path)}
                                  disabled={isUpdating}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select path" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none__">— None —</SelectItem>
                                    {availablePaths.map((p) => (
                                      <SelectItem key={p.path} value={p.path}>
                                        {p.label} ({p.path})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {bodyParams.length > 0 && (
                      <div className="space-y-2 rounded-lg border p-3">
                        <Label className="text-sm font-semibold">Body Parameters</Label>
                        <div className="grid gap-2">
                          {bodyParams.map((param) => {
                            const key = `body:${param.paramIndex}`;
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <span className="w-32 shrink-0 text-sm">Body {param.paramIndex}</span>
                                <Select
                                  value={mappingByKey[key] || "__none__"}
                                  onValueChange={(path) => handleMappingChange("body", param.paramIndex, path)}
                                  disabled={isUpdating}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select path" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__none__">— None —</SelectItem>
                                    {availablePaths.map((p) => (
                                      <SelectItem key={p.path} value={p.path}>
                                        {p.label} ({p.path})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </>
        )}

        {selectedTemplate && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="font-medium">Current configuration</div>
            <div className="mt-1 text-muted-foreground">
              Type: <span className="font-mono">{messageType === "text" ? "Text Message" : "Template"}</span>
            </div>
            {messageType === "template" && (
                <>
                <div className="mt-1 text-muted-foreground">
                  Template: <span className="font-mono">{selectedTemplate}</span>
                </div>
                <div className="text-muted-foreground">
                  Language: <span className="font-mono">{selectedLanguage}</span>
                </div>
                </>
            )}
            {action.value === "supplier_bill_created" && (
                <div className="text-muted-foreground">
                  Recipients: <span className="font-mono">{phoneNumbers.length} configured</span>
                </div>
            )}
            <div className="text-muted-foreground">
              Status:{" "}
              {isEnabled ? (
                <span className="text-green-600">Enabled</span>
              ) : (
                <span className="text-gray-500">Disabled</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
