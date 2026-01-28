import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  sendWhatsAppMessage, 
  SendWhatsAppMessageRequest, 
  TemplateComponent,
  getWhatsAppTemplates,
  getWhatsAppTemplateDetails,
  WhatsAppTemplate,
  bulkSendWhatsAppMessage,
  BulkSendWhatsAppMessageRequest,
  MessageResult,
} from "@/services/whatsapp-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageSquare, Plus, X, Loader2, Users, User } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useFieldArray, Control } from "react-hook-form";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const sendWhatsAppSchema = z.object({
  phone_number: z.string().optional(),
  phone_numbers: z.string().optional(), // For bulk mode
  message_type: z.enum(["text", "template"]),
  message: z.string().optional(),
  template_name: z.string().optional(),
  language_code: z.string().optional(),
  components: z.array(z.object({
    type: z.enum(["body", "header", "button"]),
    parameters: z.array(z.object({
      type: z.enum(["text", "currency", "date_time", "image", "document", "video"]),
      text: z.string().optional(),
    })).optional(),
  })).optional(),
}).refine((data) => {
  // Validate message type requirements
  if (data.message_type === "text") {
    return data.message && data.message.length > 0;
  } else {
    return data.template_name && data.template_name.length > 0 && 
           data.language_code && data.language_code.length > 0;
  }
}, {
  message: "Message is required for text type, template name and language code are required for template type",
  path: ["message"],
});

type SendWhatsAppSchema = z.infer<typeof sendWhatsAppSchema>;

interface SendWhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendWhatsAppDialog({ open, onOpenChange }: SendWhatsAppDialogProps) {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkResults, setBulkResults] = useState<MessageResult[] | null>(null);

  const methods = useForm<SendWhatsAppSchema>({
    resolver: zodResolver(sendWhatsAppSchema),
    defaultValues: {
      phone_number: "",
      phone_numbers: "",
      message_type: "template",
      message: "",
      template_name: "",
      language_code: "en",
      components: [],
    },
  });

  const messageType = methods.watch("message_type");
  const selectedTemplateName = methods.watch("template_name");
  const selectedLanguageCode = methods.watch("language_code");
  const { fields, append, remove, replace } = useFieldArray({
    control: methods.control,
    name: "components",
  });

  const { toast } = useToast();

  // Fetch available templates
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: () => getWhatsAppTemplates(),
    enabled: open && messageType === "template",
  });

  const templates = templatesData?.data || [];

  // Fetch template details when template name or language changes
  const { data: templateDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["whatsapp-template-details", selectedTemplateName, selectedLanguageCode],
    queryFn: () => getWhatsAppTemplateDetails(selectedTemplateName, selectedLanguageCode),
    enabled: open && messageType === "template" && selectedTemplateName !== "" && selectedLanguageCode !== "",
  });

  // Auto-populate components when template details are loaded
  useEffect(() => {
    if (templateDetails?.data && messageType === "template" && selectedTemplateName) {
      const template = templateDetails.data;
      
      // Convert template components to form components
      const formComponents: Array<{
        type: "body" | "header" | "button";
        parameters: Array<{ type: "text"; text: string }>;
      }> = [];

      template.components?.forEach((comp) => {
        if (comp.type === "BODY" && comp.text) {
          // Count variables in the template text (e.g., {{1}}, {{2}})
          // Meta uses {{1}}, {{2}}, etc. for variables
          const variableMatches = comp.text.match(/\{\{(\d+)\}\}/g) || [];
          const variableCount = variableMatches.length;

          if (variableCount > 0) {
            const parameters: Array<{ type: "text"; text: string }> = [];
            // Initialize parameters based on example if available
            if (comp.example?.body_text && comp.example.body_text.length > 0) {
              // Use the first example set
              const exampleParams = comp.example.body_text[0];
              exampleParams.forEach((example) => {
                parameters.push({ type: "text", text: example || "" });
              });
            } else {
              // Create empty parameters
              for (let i = 0; i < variableCount; i++) {
                parameters.push({ type: "text", text: "" });
              }
            }
            formComponents.push({
              type: "body",
              parameters,
            });
          }
        } else if (comp.type === "HEADER") {
          // Handle header with variables (can be text or media)
          if (comp.text) {
            const variableMatches = comp.text.match(/\{\{(\d+)\}\}/g) || [];
            if (variableMatches.length > 0) {
              const parameters: Array<{ type: "text"; text: string }> = [];
              if (comp.example?.header_text && comp.example.header_text.length > 0) {
                comp.example.header_text.forEach((example) => {
                  parameters.push({ type: "text", text: example || "" });
                });
              } else {
                for (let i = 0; i < variableMatches.length; i++) {
                  parameters.push({ type: "text", text: "" });
                }
              }
              formComponents.push({
                type: "header",
                parameters,
              });
            }
          } else if (comp.example?.header_handle && comp.example.header_handle.length > 0) {
            // Header with media (image/document/video)
            // Media headers require different parameter types (image/document/video)
            // Skipping for now as they need special handling
          }
        }
        // Note: FOOTER and BUTTONS don't typically have parameters
      });

      // Update form with components
      if (formComponents.length > 0) {
        replace(formComponents);
      } else {
        replace([]);
      }
    } else if (messageType === "template" && !selectedTemplateName) {
      // Clear components when no template is selected
      replace([]);
    }
  }, [templateDetails, messageType, selectedTemplateName, replace]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (data: SendWhatsAppMessageRequest) => sendWhatsAppMessage(data),
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "WhatsApp message has been sent successfully",
      });
      methods.reset();
      setBulkResults(null);
      setIsBulkMode(false);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "An error occurred while sending the message",
        variant: "destructive",
      });
    },
  });

  const { mutate: bulkSendMessage, isPending: isBulkPending } = useMutation({
    mutationFn: (data: BulkSendWhatsAppMessageRequest) => bulkSendWhatsAppMessage(data),
    onSuccess: (response) => {
      const results = response.data?.results || [];
      setBulkResults(results);
      const successCount = response.data?.success_count || 0;
      const failureCount = response.data?.failure_count || 0;
      
      toast({
        title: "Bulk send completed",
        description: `${successCount} succeeded, ${failureCount} failed`,
        variant: failureCount > 0 ? "default" : "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send bulk messages",
        description: error.message || "An error occurred while sending messages",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send WhatsApp Message
          </DialogTitle>
          <DialogDescription>
            Send a custom WhatsApp message to any phone number. Template messages are recommended for better delivery.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit((data) => {
              if (isBulkMode) {
                // Parse phone numbers from textarea (support both newline and comma separation)
                const phoneNumbersText = data.phone_numbers || "";
                const phoneNumbers = phoneNumbersText
                  .split(/[,\n]/)
                  .map(num => num.trim())
                  .filter(num => num.length > 0);

                if (phoneNumbers.length === 0) {
                  toast({
                    title: "Invalid input",
                    description: "Please enter at least one phone number",
                    variant: "destructive",
                  });
                  return;
                }

                const bulkRequest: BulkSendWhatsAppMessageRequest = {
                  phone_numbers: phoneNumbers,
                  message_type: data.message_type,
                };

                if (data.message_type === "text") {
                  bulkRequest.message = data.message;
                } else {
                  bulkRequest.template_name = data.template_name;
                  bulkRequest.language_code = data.language_code;
                  if (data.components && data.components.length > 0) {
                    bulkRequest.components = data.components.map(comp => ({
                      type: comp.type,
                      parameters: comp.parameters?.map(param => ({
                        type: param.type,
                        text: param.text,
                      })),
                    })) as TemplateComponent[];
                  }
                }

                bulkSendMessage(bulkRequest);
              } else {
                const request: SendWhatsAppMessageRequest = {
                  phone_number: data.phone_number || "",
                  message_type: data.message_type,
                };

                if (data.message_type === "text") {
                  request.message = data.message;
                } else {
                  request.template_name = data.template_name;
                  request.language_code = data.language_code;
                  if (data.components && data.components.length > 0) {
                    request.components = data.components.map(comp => ({
                      type: comp.type,
                      parameters: comp.parameters?.map(param => ({
                        type: param.type,
                        text: param.text,
                      })),
                    })) as TemplateComponent[];
                  }
                }

                sendMessage(request);
              }
            })}
            className="space-y-4"
          >
            {/* Bulk Mode Toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {isBulkMode ? (
                  <Users className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="bulk-mode" className="cursor-pointer">
                  Send to multiple recipients
                </Label>
              </div>
              <Switch
                id="bulk-mode"
                checked={isBulkMode}
                onCheckedChange={(checked) => {
                  setIsBulkMode(checked);
                  setBulkResults(null);
                  if (checked) {
                    methods.setValue("phone_number", "");
                  } else {
                    methods.setValue("phone_numbers", "");
                  }
                }}
              />
            </div>
            {isBulkMode ? (
              <FormField
                control={methods.control}
                name="phone_numbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Numbers</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter phone numbers, one per line or separated by commas&#10;Example:&#10;+213123456789&#10;+213987654321&#10;2135551234"
                        rows={6}
                        className="resize-none font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter multiple phone numbers, one per line or separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={methods.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+213123456789 or 213123456789"
                        type="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={methods.control}
              name="message_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset form when switching types
                      if (value === "text") {
                        methods.setValue("template_name", "");
                        methods.setValue("language_code", "en");
                        methods.setValue("components", []);
                      } else {
                        methods.setValue("message", "");
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select message type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="template">Template Message</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Template messages are required for most business use cases and arrive faster
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {messageType === "text" ? (
              <FormField
                control={methods.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your message here..."
                        rows={6}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={methods.control}
                  name="template_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Find the selected template and set language code
                          const selectedTemplate = templates.find(t => t.name === value);
                          if (selectedTemplate) {
                            methods.setValue("language_code", selectedTemplate.language);
                          }
                          // Reset components when template changes
                          replace([]);
                        }}
                        disabled={isLoadingTemplates}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a template"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingTemplates ? (
                            <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading templates...
                              </div>
                            </SelectItem>
                          ) : templates.length === 0 ? (
                            <SelectItem value="no-templates" disabled>
                              No templates available
                            </SelectItem>
                          ) : (
                            templates.map((template) => (
                              <SelectItem key={`${template.name}-${template.language}`} value={template.name}>
                                {template.name} ({template.language}) - {template.status}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select an approved template from Meta Business Manager
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="language_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language Code</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedTemplateName}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English (en)</SelectItem>
                          <SelectItem value="ar">Arabic (ar)</SelectItem>
                          <SelectItem value="fr">French (fr)</SelectItem>
                          <SelectItem value="es">Spanish (es)</SelectItem>
                          <SelectItem value="de">German (de)</SelectItem>
                          <SelectItem value="it">Italian (it)</SelectItem>
                          <SelectItem value="pt">Portuguese (pt)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Language code for the template (auto-set from selected template, but can be changed)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  {isLoadingDetails && selectedTemplateName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading template details...
                    </div>
                  )}
                  {templateDetails?.data && (
                    <div className="text-sm text-muted-foreground mb-2">
                      Template: {templateDetails.data.name} ({templateDetails.data.language}) - {templateDetails.data.category}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <FormLabel>Template Parameters</FormLabel>
                    {fields.length === 0 && !isLoadingDetails && (
                      <span className="text-xs text-muted-foreground">
                        Parameters will be auto-loaded from template
                      </span>
                    )}
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Component {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormField
                        control={methods.control}
                        name={`components.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Component Type</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="body">Body</SelectItem>
                                <SelectItem value="header">Header</SelectItem>
                                <SelectItem value="button">Button</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <ComponentParametersField
                        control={methods.control}
                        componentIndex={index}
                      />
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No components added. Templates without parameters don't need components.
                    </p>
                  )}
                </div>
              </>
            )}
            {/* Bulk Results Display */}
            {bulkResults && bulkResults.length > 0 && (
              <div className="space-y-2 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Send Results</h4>
                  <div className="flex gap-2">
                    <Badge variant="default" className="bg-green-500">
                      Success: {bulkResults.filter(r => r.success).length}
                    </Badge>
                    <Badge variant="destructive">
                      Failed: {bulkResults.filter(r => !r.success).length}
                    </Badge>
                  </div>
                </div>
                <ScrollArea className="h-48 w-full">
                  <div className="space-y-1">
                    {bulkResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded text-sm ${
                          result.success ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                        }`}
                      >
                        <span className="font-mono text-xs">{result.phone_number}</span>
                        {result.success ? (
                          <Badge variant="default" className="bg-green-500">Sent</Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">Failed</Badge>
                            <span className="text-xs text-muted-foreground max-w-xs truncate">
                              {result.error}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  methods.reset();
                  setBulkResults(null);
                  setIsBulkMode(false);
                  onOpenChange(false);
                }}
              >
                {bulkResults ? "Close" : "Cancel"}
              </Button>
              {!bulkResults && (
                <Button type="submit" disabled={isPending || isBulkPending}>
                  {isBulkPending || isPending
                    ? isBulkMode
                      ? "Sending to multiple recipients..."
                      : "Sending..."
                    : isBulkMode
                    ? (() => {
                        const phoneNumbersText = methods.watch("phone_numbers") || "";
                        const count = phoneNumbersText.split(/[,\n]/).filter((n: string) => n.trim()).length;
                        return count > 0 ? `Send to ${count} recipients` : "Send to multiple recipients";
                      })()
                    : "Send Message"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// Component for managing template parameters
function ComponentParametersField({
  control,
  componentIndex,
}: {
  control: Control<SendWhatsAppSchema>;
  componentIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `components.${componentIndex}.parameters`,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel className="text-sm">Parameters</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ type: "text", text: "" })}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Parameter
        </Button>
      </div>
      {fields.map((field, paramIndex) => (
        <div key={field.id} className="flex gap-2 items-start">
          <FormField
            control={control}
            name={`components.${componentIndex}.parameters.${paramIndex}.text`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    placeholder={`Parameter ${paramIndex + 1} (replaces {{${paramIndex + 1}}})`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(paramIndex)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No parameters. Click "Add Parameter" to replace template variables (e.g., {"{{1}}"}, {"{{2}}"})
        </p>
      )}
    </div>
  );
}
