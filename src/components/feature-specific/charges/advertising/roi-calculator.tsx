import { AppDispatch, RootState } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAdvertisingROIDataAsync } from '@/features/charges/advertising-slice';
import { AdvertisingCharge } from '@/models/data/charges/advertising.model';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, BarChart, Cell, Legend, Line, LineChart, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as z from 'zod';

const roiFormSchema = z.object({
  ad_spend: z.number().min(0, 'Ad spend must be positive'),
  revenue: z.number().min(0, 'Revenue must be positive'),
  cost_of_goods: z.number().min(0, 'Cost of goods must be positive'),
  other_costs: z.number().min(0, 'Other costs must be positive'),
  attribution_window: z.enum(['1_day', '7_day', '28_day', 'custom']),
  custom_attribution_days: z.number().optional(),
});

type ROIFormData = z.infer<typeof roiFormSchema>;

export interface ROICalculatorProps {
  campaign?: AdvertisingCharge;
  onROIUpdate?: (roiData: any) => void;
}

const ROICalculator: React.FC<ROICalculatorProps> = ({ campaign, onROIUpdate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { roiData, loading, error } = useSelector((state: RootState) => state.advertising);
  
  const [activeTab, setActiveTab] = useState('calculator');
  const [calculatedROI, setCalculatedROI] = useState<any>(null);

  const form = useForm<ROIFormData>({
    resolver: zodResolver(roiFormSchema),
    defaultValues: {
      ad_spend: campaign?.amount_spent || 0,
      revenue: campaign?.attributed_revenue || 0,
      cost_of_goods: 0,
      other_costs: 0,
      attribution_window: '7_day',
      custom_attribution_days: 7,
    }
  });

  useEffect(() => {
    if (campaign) {
      dispatch(fetchAdvertisingROIDataAsync({ campaign_id: campaign.id }));
    }
  }, [dispatch, campaign]);

  const calculateROI = (data: ROIFormData) => {
    const {
      ad_spend,
      revenue,
      cost_of_goods,
      other_costs,
    } = data;

    const total_costs = ad_spend + cost_of_goods + other_costs;
    const gross_profit = revenue - cost_of_goods;
    const net_profit = revenue - total_costs;
    
    const roi_percentage = ad_spend > 0 ? ((revenue - ad_spend) / ad_spend) * 100 : 0;
    const roas = ad_spend > 0 ? revenue / ad_spend : 0;
    const profit_margin = revenue > 0 ? (net_profit / revenue) * 100 : 0;
    const break_even_point = ad_spend + cost_of_goods + other_costs;

    const result = {
      ad_spend,
      revenue,
      cost_of_goods,
      other_costs,
      total_costs,
      gross_profit,
      net_profit,
      roi_percentage,
      roas,
      profit_margin,
      break_even_point,
      is_profitable: net_profit > 0,
      efficiency_score: calculateEfficiencyScore(roi_percentage, roas, profit_margin),
    };

    setCalculatedROI(result);
    onROIUpdate?.(result);
    return result;
  };

  const calculateEfficiencyScore = (roi: number, roas: number, margin: number) => {
    // Calculate efficiency score based on multiple metrics
    const roiScore = Math.min(roi / 100, 1) * 40; // Max 40 points for ROI
    const roasScore = Math.min(roas / 4, 1) * 30; // Max 30 points for ROAS (4x is excellent)
    const marginScore = Math.min(margin / 20, 1) * 30; // Max 30 points for margin (20% is good)
    
    return Math.round(roiScore + roasScore + marginScore);
  };

  const handleCalculate = form.handleSubmit(calculateROI);

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Poor';
  };

  // Chart data for ROI trends
  const roiTrendData = [
    { month: 'Jan', roi: 120, roas: 2.2, spend: 5000 },
    { month: 'Feb', roi: 150, roas: 2.5, spend: 6000 },
    { month: 'Mar', roi: 180, roas: 2.8, spend: 7000 },
    { month: 'Apr', roi: 200, roas: 3.0, spend: 8000 },
    { month: 'May', roi: 220, roas: 3.2, spend: 9000 },
    { month: 'Jun', roi: 250, roas: 3.5, spend: 10000 },
  ];

  const costBreakdownData = [
    { name: 'Ad Spend', value: calculatedROI?.ad_spend || 0, color: '#3b82f6' },
    { name: 'Cost of Goods', value: calculatedROI?.cost_of_goods || 0, color: '#ef4444' },
    { name: 'Other Costs', value: calculatedROI?.other_costs || 0, color: '#f59e0b' },
  ];

  const profitBreakdownData = [
    { name: 'Net Profit', value: calculatedROI?.net_profit || 0, color: '#10b981' },
    { name: 'Total Costs', value: calculatedROI?.total_costs || 0, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6" />
        <h2 className="text-2xl font-bold">ROI Calculator</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>ROI Inputs</CardTitle>
                <CardDescription>
                  Enter your advertising and revenue data to calculate ROI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ad_spend">Ad Spend (DZD)</Label>
                      <Input
                        id="ad_spend"
                        type="number"
                        step="0.01"
                        {...form.register('ad_spend', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {form.formState.errors.ad_spend && (
                        <p className="text-sm text-red-500">{form.formState.errors.ad_spend.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="revenue">Revenue (DZD)</Label>
                      <Input
                        id="revenue"
                        type="number"
                        step="0.01"
                        {...form.register('revenue', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {form.formState.errors.revenue && (
                        <p className="text-sm text-red-500">{form.formState.errors.revenue.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cost_of_goods">Cost of Goods (DZD)</Label>
                      <Input
                        id="cost_of_goods"
                        type="number"
                        step="0.01"
                        {...form.register('cost_of_goods', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {form.formState.errors.cost_of_goods && (
                        <p className="text-sm text-red-500">{form.formState.errors.cost_of_goods.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="other_costs">Other Costs (DZD)</Label>
                      <Input
                        id="other_costs"
                        type="number"
                        step="0.01"
                        {...form.register('other_costs', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {form.formState.errors.other_costs && (
                        <p className="text-sm text-red-500">{form.formState.errors.other_costs.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="attribution_window">Attribution Window</Label>
                    <Select onValueChange={(value) => form.setValue('attribution_window', value as any)} defaultValue={form.getValues('attribution_window')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select attribution window" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_day">1 Day</SelectItem>
                        <SelectItem value="7_day">7 Days</SelectItem>
                        <SelectItem value="28_day">28 Days</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate ROI
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            {calculatedROI && (
              <Card>
                <CardHeader>
                  <CardTitle>ROI Results</CardTitle>
                  <CardDescription>
                    Your advertising performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculatedROI.roi_percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-blue-600">ROI</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {calculatedROI.roas.toFixed(2)}x
                      </div>
                      <div className="text-sm text-green-600">ROAS</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Net Profit:</span>
                      <span className={`font-medium ${calculatedROI.is_profitable ? 'text-green-600' : 'text-red-600'}`}>
                        {calculatedROI.net_profit.toLocaleString()} DZD
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit Margin:</span>
                      <span className="font-medium">{calculatedROI.profit_margin.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Break-even Point:</span>
                      <span className="font-medium">{calculatedROI.break_even_point.toLocaleString()} DZD</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>Efficiency Score:</span>
                      <Badge className={getEfficiencyColor(calculatedROI.efficiency_score)}>
                        {calculatedROI.efficiency_score}/100 - {getEfficiencyLabel(calculatedROI.efficiency_score)}
                      </Badge>
                    </div>
                  </div>

                  {calculatedROI.is_profitable ? (
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        Your advertising campaign is profitable! Consider scaling up.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <TrendingDown className="h-4 w-4" />
                      <AlertDescription>
                        Your campaign is not profitable. Consider optimizing or pausing.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {calculatedROI && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                  <CardDescription>Distribution of your advertising costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={costBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {costBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Profit Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Profit Analysis</CardTitle>
                  <CardDescription>Revenue vs costs breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={profitBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {profitBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI Trends */}
            <Card>
              <CardHeader>
                <CardTitle>ROI Trends</CardTitle>
                <CardDescription>Monthly ROI performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={roiTrendData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ROAS Trends */}
            <Card>
              <CardHeader>
                <CardTitle>ROAS Trends</CardTitle>
                <CardDescription>Monthly ROAS performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roiTrendData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}x`} />
                    <Legend />
                    <Bar dataKey="roas" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ROICalculator; 