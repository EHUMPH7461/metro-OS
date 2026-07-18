# eBay Integration Guide

## Overview

Metro OS will integrate with eBay APIs to:
1. Publish listings
2. Import active listings
3. Track orders
4. Sync inventory

**Status:** Placeholder implementation (Sprint 5)

## eBay OAuth 2.0 Setup

### Prerequisites
1. eBay Developer Account: https://developer.ebay.com/
2. Application Registration (Sandbox first)
3. Client ID and Client Secret

### App Credentials

**Sandbox Environment** (testing)
```
Client ID: [your-sandbox-client-id]
Client Secret: [your-sandbox-secret]
RU Name: [your-ru-name]
```

**Production Environment** (live)
```
Client ID: [your-production-client-id]
Client Secret: [your-production-secret]
RU Name: [your-ru-name]
```

### OAuth Flow

1. User clicks "Connect eBay Account"
2. App opens eBay authorization URL
3. User grants permissions
4. eBay redirects to callback URL with auth code
5. App exchanges code for refresh token
6. Token stored securely in database

### Scopes Required
```
https://api.ebay.com/oauth/api_scope
https://api.ebay.com/oauth/api_scope/sell.inventory
https://api.ebay.com/oauth/api_scope/sell.account
https://api.ebay.com/oauth/api_scope/sell.trading
```

## API Endpoints Used

### Inventory Management
- `POST /sell/inventory/v1/inventory_item` - Create inventory
- `PUT /sell/inventory/v1/inventory_item/{sku}` - Update inventory
- `GET /sell/inventory/v1/inventory_item/{sku}` - Get inventory
- `DELETE /sell/inventory/v1/inventory_item/{sku}` - Delete inventory

### Listing Management
- `POST /sell/listing/v1/create_listing` - Publish listing
- `PUT /sell/listing/v1/update_listing` - Revise listing
- `GET /sell/listing/v1/get_listings` - Get active listings
- `DELETE /sell/listing/v1/end_listing` - End listing

### Order Management
- `GET /sell/fulfillment/v1/order` - Get orders
- `GET /sell/fulfillment/v1/order/{order_id}` - Get order details
- `GET /sell/fulfillment/v1/order/{order_id}/shipping_fulfillment` - Get shipment

## Implementation Plan (Sprint 5)

### Phase 1: Authentication
1. Create OAuth flow component
2. Store refresh tokens securely
3. Implement token refresh logic
4. Add "Connect eBay" button to settings

### Phase 2: Listing Sync
1. Import active listings from eBay
2. Match with local inventory
3. Display sync status
4. Handle conflicts and updates

### Phase 3: Order Import
1. Fetch recent orders
2. Create order records in database
3. Calculate profit and costs
4. Update inventory status

### Phase 4: Publishing
1. Publish draft listings to eBay
2. Update inventory status
3. Store eBay item IDs
4. Handle publishing errors

## Environment Variables

```bash
# .env
EBAY_CLIENT_ID=your-client-id
EBAY_CLIENT_SECRET=your-secret
EBAY_RU_NAME=your-redirect-uri-name
EBAY_ENVIRONMENT=sandbox  # or 'production'
EBAY_SCOPES=https://api.ebay.com/oauth/api_scope,...
```

## Error Handling

Common eBay API errors:

| Error Code | Meaning | Solution |
|-----------|---------|----------
| 21919 | Invalid auth | Refresh token or re-authenticate |
| 1 | Missing/invalid parameter | Validate input before API call |
| 925 | Item not found | Check SKU/item ID |
| 21916 | Access denied | Check OAuth scopes |

## Rate Limiting

eBay API has rate limits:
- 5000 calls per hour per auth token
- Implement exponential backoff for retries
- Cache responses where possible

## Testing

Use eBay Sandbox environment for testing:
1. All API calls go to `https://api.sandbox.ebay.com/`
2. No real listings or transactions
3. Test with sandbox seller account

## Security Considerations

1. **Never commit API keys** - Use environment variables
2. **Encrypt tokens** - Use SQLCipher for database
3. **Validate all inputs** - Prevent injection attacks
4. **Log API calls** - For debugging and audit trails
5. **Implement CSRF tokens** - For web-based OAuth callback

## Resources

- [eBay API Documentation](https://developer.ebay.com/docs)
- [OAuth 2.0 Guide](https://developer.ebay.com/docs/en/auth)
- [Inventory API](https://developer.ebay.com/docs/sell/inventory/)
- [Listing API](https://developer.ebay.com/docs/sell/listing/)
- [Order API](https://developer.ebay.com/docs/sell/fulfillment/)
