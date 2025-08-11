import { AppDispatch, RootState } from '@/app/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createAdvertisingCampaignAsync, fetchAdvertisingCampaignsAsync, updateAdvertisingCampaignAsync } from '@/features/charges/advertising-slice';
import { AdvertisingCharge } from '@/models/data/charges/advertising.model';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Eye, Plus, Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import * as z from 'zod';

const campaignFormSchema = z.object({
  campaign_name: z.string().min(1, 'Campaign name is required'),
  campaign_objective: z.enum(['brand_awareness', 'lead_generation', 'sales', 'traffic', 'engagement', 'app_installs', 'video_views']),
  platform: z.enum(['facebook', 'instagram', 'google', 'tiktok', 'youtube', 'linkedin', 'twitter', 'other']),
  budget_type: z.enum(['daily', 'lifetime', 'campaign_total']),
  budget_amount: z.number().min(0, 'Budget must be positive'),
  bid_strategy: z.enum(['automatic', 'manual', 'target_cost', 'target_roas']),
  campaign_start_date: z.string(),
  campaign_end_date: z.string().optional(),
  target_audience: z.object({
    name: z.string().min(1, 'Audience name is required'),
    age_ranges: z.array(z.object({
      min: z.number().min(13),
      max: z.number().max(65)
    })),
    countries: z.array(z.string()).min(1, 'At least one country is required'),
    interests: z.array(z.string()),
    devices: z.array(z.string())
  })
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

export interface CampaignManagementProps {
  onCampaignSelect?: (campaign: AdvertisingCharge) => void;
}

const CampaignManagement: React.FC<CampaignManagementProps> = ({ onCampaignSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { campaigns, templates, accounts, loading, error } = useSelector((state: RootState) => state.advertising);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<AdvertisingCharge | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      campaign_name: '',
      campaign_objective: 'traffic',
      platform: 'facebook',
      budget_type: 'daily',
      budget_amount: 0,
      bid_strategy: 'automatic',
      campaign_start_date: new Date().toISOString().split('T')[0],
      target_audience: {
        name: '',
        age_ranges: [{ min: 18, max: 65 }],
        countries: ['Algeria'],
        interests: [],
        devices: ['mobile', 'desktop']
      }
    }
  });

  useEffect(() => {
    dispatch(fetchAdvertisingCampaignsAsync());
  }, [dispatch]);

  const handleCreateCampaign = async (data: CampaignFormData) => {
    try {
      await dispatch(createAdvertisingCampaignAsync({
        ...data,
        campaign_status: 'draft',
        amount_spent: 0,
        remaining_budget: data.budget_amount,
        budget_utilization_percentage: 0,
        impressions: 0,
        reach: 0,
        clicks: 0,
        click_through_rate: 0,
        cost_per_click: 0,
        cost_per_thousand_impressions: 0,
        conversions: 0,
        conversion_rate: 0,
        cost_per_conversion: 0,
        ad_creative_ids: [],
        ad_formats: [],
        creative_testing: false,
        promoted_products: [],
        delivery_status: 'pending_review',
        optimization_goal: 'clicks',
        learning_phase: true,
        performance_grade: 'average',
        spend_currency: 'DZD'
      }));
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleUpdateCampaign = async (data: CampaignFormData) => {
    if (!selectedCampaign) return;
    
    try {
      await dispatch(updateAdvertisingCampaignAsync({
        id: selectedCampaign.id,
        ...data
      }));
      setIsEditDialogOpen(false);
      setSelectedCampaign(null);
      form.reset();
    } catch (error) {
      console.error('Failed to update campaign:', error);
    }
  };

  const handleEditCampaign = (campaign: AdvertisingCharge) => {
    setSelectedCampaign(campaign);
    form.reset({
      campaign_name: campaign.campaign_name,
      campaign_objective: campaign.campaign_objective,
      platform: campaign.platform,
      budget_type: campaign.budget_type,
      budget_amount: campaign.budget_amount,
      bid_strategy: campaign.bid_strategy,
      campaign_start_date: new Date(campaign.campaign_start_date).toISOString().split('T')[0],
      campaign_end_date: campaign.campaign_end_date ? new Date(campaign.campaign_end_date).toISOString().split('T')[0] : undefined,
      target_audience: campaign.target_audience
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getPerformanceGrade = (grade: string) => {
    switch (grade) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (activeTab === 'active') return campaign.campaign_status === 'active';
    if (activeTab === 'paused') return campaign.campaign_status === 'paused';
    if (activeTab === 'draft') return campaign.campaign_status === 'draft';
    if (activeTab === 'completed') return campaign.campaign_status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Campaign Management</h2>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaign Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Set up a new advertising campaign with targeting and budget settings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateCampaign)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign_name">Campaign Name</Label>
                  <Input
                    id="campaign_name"
                    {...form.register('campaign_name')}
                    placeholder="Enter campaign name"
                  />
                  {form.formState.errors.campaign_name && (
                    <p className="text-sm text-red-500">{form.formState.errors.campaign_name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select onValueChange={(value) => form.setValue('platform', value as any)} defaultValue={form.getValues('platform')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign_objective">Objective</Label>
                  <Select onValueChange={(value) => form.setValue('campaign_objective', value as any)} defaultValue={form.getValues('campaign_objective')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                      <SelectItem value="lead_generation">Lead Generation</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="app_installs">App Installs</SelectItem>
                      <SelectItem value="video_views">Video Views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget_type">Budget Type</Label>
                  <Select onValueChange={(value) => form.setValue('budget_type', value as any)} defaultValue={form.getValues('budget_type')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Budget</SelectItem>
                      <SelectItem value="lifetime">Lifetime Budget</SelectItem>
                      <SelectItem value="campaign_total">Campaign Total</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_amount">Budget Amount (DZD)</Label>
                  <Input
                    id="budget_amount"
                    type="number"
                    {...form.register('budget_amount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.budget_amount && (
                    <p className="text-sm text-red-500">{form.formState.errors.budget_amount.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bid_strategy">Bid Strategy</Label>
                  <Select onValueChange={(value) => form.setValue('bid_strategy', value as any)} defaultValue={form.getValues('bid_strategy')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bid strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="target_cost">Target Cost</SelectItem>
                      <SelectItem value="target_roas">Target ROAS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign_start_date">Start Date</Label>
                  <Input
                    id="campaign_start_date"
                    type="date"
                    {...form.register('campaign_start_date')}
                  />
                </div>
                <div>
                  <Label htmlFor="campaign_end_date">End Date (Optional)</Label>
                  <Input
                    id="campaign_end_date"
                    type="date"
                    {...form.register('campaign_end_date')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="target_audience_name">Target Audience Name</Label>
                <Input
                  id="target_audience_name"
                  {...form.register('target_audience.name')}
                  placeholder="Enter audience name"
                />
                {form.formState.errors.target_audience?.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.target_audience.name.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Campaign</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Target className="h-4 w-4" />
                        {campaign.platform}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(campaign.campaign_status)}>
                      {campaign.campaign_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Budget:</span>
                    <span className="font-medium">{campaign.budget_amount.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Spent:</span>
                    <span className="font-medium">{campaign.amount_spent.toLocaleString()} DZD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Performance:</span>
                    <span className={`font-medium ${getPerformanceGrade(campaign.performance_grade)}`}>
                      {campaign.performance_grade}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <div className="font-medium">{campaign.impressions.toLocaleString()}</div>
                      <div>Impressions</div>
                    </div>
                    <div>
                      <div className="font-medium">{campaign.clicks.toLocaleString()}</div>
                      <div>Clicks</div>
                    </div>
                    <div>
                      <div className="font-medium">{campaign.conversions.toLocaleString()}</div>
                      <div>Conversions</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCampaign(campaign)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCampaignSelect?.(campaign)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Campaign Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              Update campaign settings and targeting.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleUpdateCampaign)} className="space-y-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_campaign_name">Campaign Name</Label>
                <Input
                  id="edit_campaign_name"
                  {...form.register('campaign_name')}
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <Label htmlFor="edit_platform">Platform</Label>
                <Select onValueChange={(value) => form.setValue('platform', value as any)} value={form.getValues('platform')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="google">Google Ads</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_budget_amount">Budget Amount (DZD)</Label>
                <Input
                  id="edit_budget_amount"
                  type="number"
                  {...form.register('budget_amount', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit_bid_strategy">Bid Strategy</Label>
                <Select onValueChange={(value) => form.setValue('bid_strategy', value as any)} value={form.getValues('bid_strategy')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bid strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="target_cost">Target Cost</SelectItem>
                    <SelectItem value="target_roas">Target ROAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Campaign</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignManagement; 