# Missing Routes Specification for Charges Module

## Overview
This document identifies the missing API routes by comparing the frontend implementation calls with the documented API routes. The API documentation shows available routes, and this analysis reveals what's missing.

## Analysis Summary
The API documentation shows these **available routes**:
- ✅ Core CRUD: `/api/charges` (POST, GET, PUT, DELETE)
- ✅ Approval: `/api/charges/{id}/approve`, `/api/charges/{id}/reject`, `/api/charges/{id}/mark-paid`
- ✅ Totals: `/api/charges/totals`
- ✅ Specialized: `/api/charges/exchange-rate`, `/api/charges/employee-salary`, `/api/charges/boxing`, `/api/charges/shipping`

However, the frontend is calling many additional routes that are **NOT documented** in the API specification.

## Missing Routes (Frontend calls these but they're not documented)

### 1. Exchange Rate Extended Routes

#### 1.1 Get Current Exchange Rates
**GET** `/charges/exchange-rates/current`

**Query Parameters:**
- `currency_pairs` (string[]) - Array of currency pairs
- `source` (string) - Rate source (official, bank, market)

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "EUR/DZD": 150.25,
    "USD/DZD": 135.80,
    "last_updated": "2025-01-15T10:00:00Z"
  }
}
```

#### 1.2 Get Exchange Rate from Source
**GET** `/charges/exchange-rates/rate`

**Query Parameters:**
- `source_currency` (string) - Source currency code
- `target_currency` (string) - Target currency code
- `source` (string) - Rate source

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "rate": 150.25,
    "source": "official",
    "timestamp": "2025-01-15T10:00:00Z",
    "reliability_score": 0.95
  }
}
```

#### 1.3 Get Exchange Rate Sources
**GET** `/charges/exchange-rates/sources`

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Official Bank Rate",
      "type": "official",
      "url": "https://api.bank.dz/rates",
      "last_updated": "2025-01-15T10:00:00Z",
      "reliability_score": 0.95
    }
  ]
}
```

#### 1.4 Create Exchange Rate Source
**POST** `/charges/exchange-rates/sources`

**Request Body:**
```json
{
  "name": "New Rate Source",
  "type": "bank",
  "url": "https://api.example.com/rates",
  "api_key": "optional_api_key"
}
```

#### 1.5 Update Exchange Rate Source
**PUT** `/charges/exchange-rates/sources/{id}`

#### 1.6 Delete Exchange Rate Source
**DELETE** `/charges/exchange-rates/sources/{id}`

#### 1.7 Get Exchange Rate History
**GET** `/charges/exchange-rates/history`

**Query Parameters:**
- `source_currency` (string)
- `target_currency` (string)
- `source` (string)
- `date_from` (string)
- `date_to` (string)
- `limit` (number)

#### 1.8 Record Exchange Rate History
**POST** `/charges/exchange-rates/history`

#### 1.9 Get Exchange Rate Alerts
**GET** `/charges/exchange-rates/alerts`

#### 1.10 Create Exchange Rate Alert
**POST** `/charges/exchange-rates/alerts`

#### 1.11 Update Exchange Rate Alert
**PUT** `/charges/exchange-rates/alerts/{id}`

#### 1.12 Delete Exchange Rate Alert
**DELETE** `/charges/exchange-rates/alerts/{id}`

#### 1.13 Get Exchange Rate Analytics
**GET** `/charges/exchange-rates/analytics`

#### 1.14 Compare Exchange Rates
**GET** `/charges/exchange-rates/compare`

#### 1.15 Get Exchange Rate Forecast
**GET** `/charges/exchange-rates/forecast`

#### 1.16 Quick Convert
**GET** `/charges/exchange-rates/convert`

### 2. Returns Charges Routes

#### 2.1 Get Returns Charges
**GET** `/returns-charges`

**Query Parameters:**
- `limit` (number)
- `offset` (number)
- `order_id` (number)
- `return_reason` (string)
- `current_status` (string)
- `company_id` (number)

#### 2.2 Get Returns Charge
**GET** `/returns-charges/{id}`

#### 2.3 Create Returns Charge
**POST** `/returns-charges`

#### 2.4 Update Returns Charge
**PUT** `/returns-charges/{id}`

#### 2.5 Delete Returns Charge
**DELETE** `/returns-charges/{id}`

#### 2.6 Calculate Return Costs
**POST** `/returns-charges/calculate-costs`

#### 2.7 Get Refund Estimate
**GET** `/returns-charges/refund-estimate`

#### 2.8 Update Return Status
**PUT** `/returns-charges/{id}/status`

#### 2.9 Complete Inspection
**POST** `/returns-charges/{id}/inspection`

#### 2.10 Process Refund
**POST** `/returns-charges/{id}/refund`

#### 2.11 Sync with Yalidine
**GET** `/returns-charges/sync-yalidine/{yalidineReturnId}`

#### 2.12 Create Yalidine Return
**POST** `/returns-charges/create-yalidine-return`

#### 2.13 Get Returns Dashboard
**GET** `/returns-charges/dashboard`

#### 2.14 Export Returns Charges
**GET** `/returns-charges/export`

#### 2.15 Import Returns Charges
**POST** `/returns-charges/import`

#### 2.16 Bulk Approve Returns
**POST** `/returns-charges/bulk-approve`

#### 2.17 Bulk Process Refunds
**POST** `/returns-charges/bulk-refund`

#### 2.18 Submit Vendor Claim
**POST** `/returns-charges/{returnId}/vendor-claim`

### 3. Shipping Charges Routes

#### 3.1 Get Shipping Charges
**GET** `/shipping-charges`

#### 3.2 Get Shipping Charge
**GET** `/shipping-charges/{id}`

#### 3.3 Create Shipping Charge
**POST** `/shipping-charges`

#### 3.4 Update Shipping Charge
**PUT** `/shipping-charges/{id}`

#### 3.5 Delete Shipping Charge
**DELETE** `/shipping-charges/{id}`

#### 3.6 Calculate Shipping Costs
**POST** `/shipping-charges/calculate-costs`

#### 3.7 Update Shipment Status
**PUT** `/shipping-charges/{id}/status`

#### 3.8 Get Tracking Updates
**GET** `/shipping-charges/tracking/{trackingNumber}`

#### 3.9 Sync with Provider
**POST** `/shipping-charges/sync/{trackingNumber}`

#### 3.10 Get Fuel Surcharges
**GET** `/fuel-surcharges`

#### 3.11 Create Fuel Surcharge
**POST** `/fuel-surcharges`

#### 3.12 Get Shipping Dashboard
**GET** `/shipping-charges/dashboard`

#### 3.13 Export Shipping Charges
**GET** `/shipping-charges/export`

#### 3.14 Import Shipping Charges
**POST** `/shipping-charges/import`

#### 3.15 Bulk Update Shipment Status
**POST** `/shipping-charges/bulk-update-status`

#### 3.16 Bulk Calculate Shipping Costs
**POST** `/shipping-charges/bulk-calculate`

#### 3.17 Sync All Shipments with Provider
**POST** `/shipping-charges/sync-provider/{providerId}`

### 4. Rent/Utility Charges Routes

#### 4.1 Get Rent/Utility Charges
**GET** `/rent-utility-charges`

#### 4.2 Get Rent/Utility Charge
**GET** `/rent-utility-charges/{id}`

### 5. Additional Generic Charge Routes

#### 5.1 Get Charge Categories
**GET** `/charges/categories`

#### 5.2 Create Charge Category
**POST** `/charges/categories`

#### 5.3 Update Charge Category
**PUT** `/charges/categories/{id}`

#### 5.4 Delete Charge Category
**DELETE** `/charges/categories/{id}`

#### 5.5 Get Charge Comments
**GET** `/charges/{chargeId}/comments`

#### 5.6 Create Charge Comment
**POST** `/charges/{chargeId}/comments`

#### 5.7 Get Charge Attachments
**GET** `/charges/{chargeId}/attachments`

#### 5.8 Upload Charge Attachment
**POST** `/charges/{chargeId}/attachments`

#### 5.9 Delete Charge Attachment
**DELETE** `/charges/{chargeId}/attachments/{attachmentId}`

#### 5.10 Bulk Create Charges
**POST** `/charges/bulk`

#### 5.11 Bulk Update Charges
**PUT** `/charges/bulk`

#### 5.12 Bulk Delete Charges
**DELETE** `/charges/bulk`

#### 5.13 Bulk Approve Charges
**POST** `/charges/bulk/approve`

#### 5.14 Bulk Reject Charges
**POST** `/charges/bulk/reject`

#### 5.15 Export Charges
**GET** `/charges/export`

#### 5.16 Import Charges
**POST** `/charges/import`

#### 5.17 Get Charge Configuration
**GET** `/charges/configuration`

#### 5.18 Check Duplicate Charges
**POST** `/charges/check-duplicates`

#### 5.19 Validate Charge
**POST** `/charges/validate`

## Summary

### Missing Routes by Category:

1. **Exchange Rate Extended Routes (16 routes)**
   - Current rates, sources, history, alerts, analytics, forecast, convert

2. **Returns Charges Routes (18 routes)**
   - Full CRUD, calculations, refunds, Yalidine integration, bulk operations

3. **Shipping Charges Routes (17 routes)**
   - Full CRUD, calculations, tracking, fuel surcharges, bulk operations

4. **Rent/Utility Charges Routes (2 routes)**
   - Basic CRUD operations

5. **Additional Generic Routes (19 routes)**
   - Categories, comments, attachments, bulk operations, export/import, validation

**Total Missing Routes: 72 routes**

These routes are being called by the frontend but are not documented in the API specification. They need to be implemented on the backend to support the full functionality of the charges module. 