import { AppDispatch } from '@/app/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { calculateReturnCostsAsync, clearCalculatorResult } from '@/features/charges/returns-slice';
import { cn } from '@/lib/utils';
import { ReturnCostCalculationParams } from '@/services/returns-service';
import {
    AlertTriangle,
    Calculator,
    CheckCircle,
    DollarSign,
    Info,
    MinusCircle,
    Package2,
    RefreshCw,
    RotateCcw,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface ReturnsCalculatorProps {
  orderId?: number;
  onCalculationComplete?: (result: any) => void;
  className?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const returnReasons = [
  { value: 'defective', label: 'Defective Product', impact: 'high' },
  { value: 'wrong_item', label: 'Wrong Item Sent', impact: 'medium' },
  { value: 'not_as_described', label: 'Not as Described', impact: 'medium' },
  { value: 'customer_changed_mind', label: 'Customer Changed Mind', impact: 'low' },
  { value: 'damaged_in_shipping', label: 'Damaged in Shipping', impact: 'high' },
  { value: 'late_delivery', label: 'Late Delivery', impact: 'low' },
  { value: 'other', label: 'Other', impact: 'medium' },
];

const returnMethods = [
  { value: 'pickup', label: 'Pickup by Courier', cost: 800 },
  { value: 'drop_off', label: 'Customer Drop-off', cost: 0 },
  { value: 'mail', label: 'Mail Return', cost: 1200 },
  { value: 'in_store', label: 'In-Store Return', cost: 0 },
];

const conditionOptions = [
  { value: 'new', label: 'New/Unopened', refundRate: 1.0, color: 'green' },
  { value: 'like_new', label: 'Like New', refundRate: 0.95, color: 'green' },
  { value: 'good', label: 'Good Condition', refundRate: 0.85, color: 'yellow' },
  { value: 'fair', label: 'Fair Condition', refundRate: 0.70, color: 'orange' },
  { value: 'poor', label: 'Poor Condition', refundRate: 0.50, color: 'red' },
  { value: 'damaged', label: 'Damaged', refundRate: 0.30, color: 'red' },
  { value: 'defective', label: 'Defective', refundRate: 1.0, color: 'red' },
];

export const ReturnsCalculator: React.FC<ReturnsCalculatorProps> = ({
  orderId,
  onCalculationComplete,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Mock selectors - replace with actual selectors
  const calculatorState = {
    params: null,
    result: null,
    loading: false,
    error: null,
  };
  
  const refundEstimation = {
    estimate: null,
    loading: false,
    error: null,
  };

  // Form state for return items
  const [returnItems, setReturnItems] = useState([
    {
      id: 1,
      product_id: 101,
      product_name: 'Sample Product 1',
      quantity: 1,
      original_price: 5000,
      condition: 'good',
    }
  ]);

  // Form state for return details
  const [returnDetails, setReturnDetails] = useState({
    return_reason: '',
    return_method: 'pickup',
    customer_location: '',
    include_shipping_refund: true,
    apply_restocking_fee: false,
    inspection_required: true,
    refurbishment_needed: false,
    vendor_claim_possible: false,
  });

  const [estimatedResult, setEstimatedResult] = useState<any>(null);

  // Add new item
  const addReturnItem = () => {
    const newItem = {
      id: Date.now(),
      product_id: 0,
      product_name: '',
      quantity: 1,
      original_price: 0,
      condition: 'good',
    };
    setReturnItems([...returnItems, newItem]);
  };

  // Remove item
  const removeReturnItem = (id: number) => {
    setReturnItems(returnItems.filter(item => item.id !== id));
  };

  // Update item
  const updateReturnItem = (id: number, field: string, value: any) => {
    setReturnItems(returnItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Calculate estimated costs
  const calculateEstimatedCosts = () => {
    if (returnItems.length === 0 || returnItems.every(item => item.original_price === 0)) {
      setEstimatedResult(null);
      return;
    }

    const selectedMethod = returnMethods.find(m => m.value === returnDetails.return_method);
    const shippingCost = selectedMethod?.cost || 0;
    
    let totalReturnValue = 0;
    let totalRefundAmount = 0;
    let totalProcessingCost = 0;
    
    const itemBreakdown = returnItems.map(item => {
      const condition = conditionOptions.find(c => c.value === item.condition);
      const refundRate = condition?.refundRate || 1.0;
      
      const itemValue = item.original_price * item.quantity;
      const refundPrice = itemValue * refundRate;
      
      // Processing costs based on condition and reason
      let inspectionCost = returnDetails.inspection_required ? 200 : 0;
      let restockingCost = returnDetails.apply_restocking_fee ? itemValue * 0.15 : 0;
      let refurbishmentCost = returnDetails.refurbishment_needed ? 500 : 0;
      let disposalCost = (item.condition === 'damaged' || item.condition === 'defective') ? 300 : 0;
      
      const itemProcessingCost = inspectionCost + restockingCost + refurbishmentCost + disposalCost;
      
      totalReturnValue += itemValue;
      totalRefundAmount += refundPrice;
      totalProcessingCost += itemProcessingCost;
      
      return {
        ...item,
        item_value: itemValue,
        refund_price: refundPrice,
        processing_cost: itemProcessingCost,
        condition_impact: (1 - refundRate) * 100,
      };
    });

    // Additional costs
    const administrativeCost = 150;
    const shippingRefund = returnDetails.include_shipping_refund ? 1000 : 0;
    const restockingFee = returnDetails.apply_restocking_fee ? totalReturnValue * 0.10 : 0;
    const processingFee = 300;
    
    // Calculate net loss to company
    const totalCosts = totalProcessingCost + shippingCost + administrativeCost;
    const totalRefunds = totalRefundAmount + shippingRefund;
    const feesCollected = restockingFee + processingFee;
    const netLoss = totalCosts + totalRefunds - feesCollected;
    
    // Vendor claim potential
    const vendorClaimPotential = returnDetails.vendor_claim_possible ? totalReturnValue * 0.50 : 0;
    
    // Risk assessment
    const riskFactors = [];
    if (returnDetails.return_reason === 'customer_changed_mind') riskFactors.push('Customer reason');
    if (totalReturnValue > 50000) riskFactors.push('High value');
    if (returnItems.some(item => item.condition === 'poor' || item.condition === 'damaged')) {
      riskFactors.push('Poor condition');
    }
    
    const fraudRiskLevel = riskFactors.length > 2 ? 'high' : riskFactors.length > 0 ? 'medium' : 'low';
    
    const result = {
      total_return_value: totalReturnValue,
      refund_amount: totalRefundAmount,
      processing_costs: {
        inspection_cost: totalProcessingCost,
        restocking_cost: 0,
        refurbishment_cost: 0,
        disposal_cost: 0,
        administrative_cost: administrativeCost,
        shipping_cost: shippingCost,
      },
      fees: {
        restocking_fee: restockingFee,
        processing_fee: processingFee,
      },
      refunds: {
        product_refund: totalRefundAmount,
        shipping_refund: shippingRefund,
        tax_refund: 0,
      },
      net_loss: netLoss,
      vendor_claim_potential: vendorClaimPotential,
      item_breakdown: itemBreakdown,
      recommendations: {
        approve_return: fraudRiskLevel !== 'high' && netLoss < 100000,
        suggested_resolution: netLoss > 50000 ? 'partial_refund' : 'full_refund',
        cost_optimization_tips: [
          'Consider negotiating restocking fee',
          'Evaluate vendor claim potential',
          'Review return policy terms',
        ],
        fraud_risk_level: fraudRiskLevel,
      },
    };
    
    setEstimatedResult(result);
    if (onCalculationComplete) {
      onCalculationComplete(result);
    }
  };

  // Handle calculate button
  const handleCalculate = () => {
    if (returnItems.length === 0) return;

    const params: ReturnCostCalculationParams = {
      returned_items: returnItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        original_price: item.original_price,
        condition: item.condition,
      })),
      return_reason: returnDetails.return_reason,
      return_method: returnDetails.return_method,
      customer_location: returnDetails.customer_location,
      include_shipping_refund: returnDetails.include_shipping_refund,
      apply_restocking_fee: returnDetails.apply_restocking_fee,
      inspection_required: returnDetails.inspection_required,
      refurbishment_needed: returnDetails.refurbishment_needed,
      vendor_claim_possible: returnDetails.vendor_claim_possible,
    };

    dispatch(calculateReturnCostsAsync(params));
  };

  // Handle clear
  const handleClear = () => {
    setReturnItems([{
      id: 1,
      product_id: 0,
      product_name: '',
      quantity: 1,
      original_price: 0,
      condition: 'good',
    }]);
    setReturnDetails({
      return_reason: '',
      return_method: 'pickup',
      customer_location: '',
      include_shipping_refund: true,
      apply_restocking_fee: false,
      inspection_required: true,
      refurbishment_needed: false,
      vendor_claim_possible: false,
    });
    setEstimatedResult(null);
    dispatch(clearCalculatorResult());
  };

  // Auto-calculate when form changes
  useEffect(() => {
    calculateEstimatedCosts();
  }, [returnItems, returnDetails]);

  const isFormValid = returnItems.length > 0 && 
                      returnItems.every(item => item.original_price > 0) &&
                      returnDetails.return_reason;

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RotateCcw className="h-5 w-5" />
            <span>Returns Cost Calculator</span>
          </CardTitle>
          <CardDescription>
            Calculate return processing costs and estimated refund amounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Return Reason and Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="return_reason">Return Reason *</Label>
              <Select 
                value={returnDetails.return_reason} 
                onValueChange={(value) => setReturnDetails(prev => ({ ...prev, return_reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select return reason" />
                </SelectTrigger>
                <SelectContent>
                  {returnReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{reason.label}</span>
                        <Badge 
                          variant={reason.impact === 'high' ? 'destructive' : reason.impact === 'medium' ? 'secondary' : 'default'}
                          className="ml-2"
                        >
                          {reason.impact}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="return_method">Return Method</Label>
              <Select 
                value={returnDetails.return_method} 
                onValueChange={(value) => setReturnDetails(prev => ({ ...prev, return_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {returnMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{method.label}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {method.cost > 0 ? formatCurrency(method.cost) : 'Free'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Return Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <Package2 className="h-4 w-4" />
                <span>Return Items</span>
              </h4>
              <Button variant="outline" size="sm" onClick={addReturnItem}>
                <MinusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {returnItems.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        value={item.product_name}
                        onChange={(e) => updateReturnItem(item.id, 'product_name', e.target.value)}
                        placeholder="Product name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateReturnItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Original Price (DZD)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.original_price || ''}
                        onChange={(e) => updateReturnItem(item.id, 'original_price', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select 
                        value={item.condition} 
                        onValueChange={(value) => updateReturnItem(item.id, 'condition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionOptions.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: 
                                    condition.color === 'green' ? '#22c55e' :
                                    condition.color === 'yellow' ? '#eab308' :
                                    condition.color === 'orange' ? '#f97316' :
                                    '#ef4444'
                                  }}
                                />
                                <span>{condition.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({(condition.refundRate * 100).toFixed(0)}%)
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Total Value</Label>
                      <div className="flex items-center h-10">
                        <span className="font-medium">
                          {formatCurrency(item.original_price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end">
                      {returnItems.length > 1 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeReturnItem(item.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Processing Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Processing Options</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include_shipping_refund"
                    checked={returnDetails.include_shipping_refund}
                    onCheckedChange={(checked) => setReturnDetails(prev => ({ ...prev, include_shipping_refund: checked }))}
                  />
                  <Label htmlFor="include_shipping_refund">Include shipping refund</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="apply_restocking_fee"
                    checked={returnDetails.apply_restocking_fee}
                    onCheckedChange={(checked) => setReturnDetails(prev => ({ ...prev, apply_restocking_fee: checked }))}
                  />
                  <Label htmlFor="apply_restocking_fee">Apply restocking fee</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="inspection_required"
                    checked={returnDetails.inspection_required}
                    onCheckedChange={(checked) => setReturnDetails(prev => ({ ...prev, inspection_required: checked }))}
                  />
                  <Label htmlFor="inspection_required">Inspection required</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="refurbishment_needed"
                    checked={returnDetails.refurbishment_needed}
                    onCheckedChange={(checked) => setReturnDetails(prev => ({ ...prev, refurbishment_needed: checked }))}
                  />
                  <Label htmlFor="refurbishment_needed">Refurbishment needed</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="vendor_claim_possible"
                    checked={returnDetails.vendor_claim_possible}
                    onCheckedChange={(checked) => setReturnDetails(prev => ({ ...prev, vendor_claim_possible: checked }))}
                  />
                  <Label htmlFor="vendor_claim_possible">Vendor claim possible</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={calculatorState.loading}
            >
              Clear
            </Button>
            
            <Button 
              onClick={handleCalculate}
              disabled={!isFormValid || calculatorState.loading}
              className="min-w-32"
            >
              {calculatorState.loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {estimatedResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Cost Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Return Value:</span>
                      <span className="font-medium">{formatCurrency(estimatedResult.total_return_value)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Product Refund:</span>
                      <span className="font-medium">{formatCurrency(estimatedResult.refunds.product_refund)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Shipping Refund:</span>
                      <span className="font-medium">{formatCurrency(estimatedResult.refunds.shipping_refund)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Processing Cost:</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(estimatedResult.processing_costs.inspection_cost + 
                                          estimatedResult.processing_costs.administrative_cost + 
                                          estimatedResult.processing_costs.shipping_cost)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Restocking Fee:</span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(estimatedResult.fees.restocking_fee)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Processing Fee:</span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(estimatedResult.fees.processing_fee)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Vendor Claim:</span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(estimatedResult.vendor_claim_potential)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Net Impact:</span>
                    <span className={cn(
                      "text-xl font-bold",
                      estimatedResult.net_loss > 0 ? "text-red-600" : "text-green-600"
                    )}>
                      {estimatedResult.net_loss > 0 ? '-' : '+'}{formatCurrency(Math.abs(estimatedResult.net_loss))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={estimatedResult.recommendations.approve_return ? 'default' : 'destructive'}>
                    {estimatedResult.recommendations.approve_return ? 
                      <CheckCircle className="h-3 w-3 mr-1" /> : 
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    }
                    {estimatedResult.recommendations.approve_return ? 'Approve Return' : 'Review Required'}
                  </Badge>
                  
                  <Badge variant={
                    estimatedResult.recommendations.fraud_risk_level === 'low' ? 'default' :
                    estimatedResult.recommendations.fraud_risk_level === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {estimatedResult.recommendations.fraud_risk_level.toUpperCase()} Risk
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Suggested Resolution:</p>
                  <p className="font-medium capitalize">
                    {estimatedResult.recommendations.suggested_resolution.replace('_', ' ')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Optimization Tips:</p>
                  <ul className="space-y-1">
                    {estimatedResult.recommendations.cost_optimization_tips.map((tip: string, index: number) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <TrendingUp className="h-3 w-3 mt-0.5 text-green-600" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Item Breakdown */}
      {estimatedResult && estimatedResult.item_breakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Item Breakdown</CardTitle>
            <CardDescription>Detailed analysis for each returned item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estimatedResult.item_breakdown.map((item: any, index: number) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.product_name || `Product ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} • Condition: {item.condition}
                      </p>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Original</p>
                          <p className="font-medium">{formatCurrency(item.item_value)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Refund</p>
                          <p className="font-medium">{formatCurrency(item.refund_price)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Processing</p>
                          <p className="font-medium text-red-600">{formatCurrency(item.processing_cost)}</p>
                        </div>
                      </div>
                      
                      {item.condition_impact > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-amber-600">
                          <TrendingDown className="h-3 w-3" />
                          <span>{item.condition_impact.toFixed(1)}% condition discount</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {calculatorState.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{calculatorState.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ReturnsCalculator;