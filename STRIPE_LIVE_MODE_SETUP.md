# Stripe Live Mode Setup Guide

## Overview
This application supports both Stripe **Test Mode** and **Live Mode** via an environment switch. The mode is controlled by the `STRIPE_MODE` environment variable in Supabase.

## Current Configuration

### Secrets (already configured in Supabase)
- `STRIPE_SECRET_KEY` - Test mode secret key
- `STRIPE_WEBHOOK_SECRET` - Test mode webhook secret
- `STRIPE_SECRET_KEY_LIVE` - Live mode secret key
- `STRIPE_WEBHOOK_SECRET_LIVE` - Live mode webhook secret
- `STRIPE_MODE` - Environment mode (`test` or `live`, defaults to `test`)

## Switching to Live Mode

### 1. Update Supabase Secret
In your Supabase project dashboard:
1. Go to **Settings** > **Edge Functions** > **Secrets**
2. Find `STRIPE_MODE`
3. Change the value from `test` to `live`
4. Save changes

### 2. Configure Stripe Live Webhook
You must create a webhook endpoint in your Stripe Live Dashboard:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) (Live Mode)
2. Navigate to **Developers** > **Webhooks**
3. Click **Add endpoint**
4. Use this URL: `https://jqrlegdulnnrpiixiecf.supabase.co/functions/v1/stripe-webhook`
5. Select the following events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
6. Click **Add endpoint**
7. **Important**: The signing secret shown should match `STRIPE_WEBHOOK_SECRET_LIVE`

### 3. Verify the Switch
After switching to live mode:
- Log in to the admin panel as a super user
- Check the **Stripe Environment** card - it should display "🟢 LIVE MODE"
- All Stripe operations will now use live credentials
- Real payments will be processed

## Switching Back to Test Mode

To return to test mode:
1. Go to Supabase **Settings** > **Edge Functions** > **Secrets**
2. Change `STRIPE_MODE` from `live` to `test`
3. The admin panel will show "🔵 TEST MODE"

## Security Notes

⚠️ **Important Security Considerations:**
- Live and test credentials are completely isolated
- The webhook secret validates that events come from Stripe
- Never commit secrets to version control
- Regularly rotate your API keys
- Monitor Stripe webhooks for failed deliveries

## Affected Edge Functions

The following functions automatically switch credentials based on `STRIPE_MODE`:
1. `stripe-webhook` - Webhook event handler
2. `create-checkout` - Checkout session creation
3. `check-subscription` - Subscription status verification
4. `customer-portal` - Customer portal access
5. `reconcile-payments` - Payment reconciliation

All functions log the active mode on each request for debugging.

## Testing Checklist

### Before Going Live
- [ ] Test mode: Complete a test purchase with card `4242 4242 4242 4242`
- [ ] Verify credits are assigned correctly in test mode
- [ ] Switch to live mode via Supabase secrets
- [ ] Verify admin panel shows "🟢 LIVE MODE"
- [ ] Configure live webhook in Stripe Dashboard
- [ ] Test a small live transaction (if applicable)
- [ ] Monitor Stripe Dashboard for successful webhook delivery
- [ ] Verify user profile and credits update correctly

### Monitoring
- Check Edge Function logs: `https://supabase.com/dashboard/project/jqrlegdulnnrpiixiecf/functions/stripe-webhook/logs`
- Check Stripe webhook logs: Stripe Dashboard > Developers > Webhooks
- Look for `mode: live` or `mode: test` in function logs

## Troubleshooting

**Problem**: Payments not processing in live mode
- **Solution**: Verify `STRIPE_MODE=live` in Supabase secrets
- Check that live webhook is configured correctly in Stripe

**Problem**: Webhook signature verification fails
- **Solution**: Ensure `STRIPE_WEBHOOK_SECRET_LIVE` matches the signing secret in Stripe Dashboard

**Problem**: Admin panel shows wrong mode
- **Solution**: Clear browser cache and refresh, or check `get-stripe-mode` function logs

## Support

For issues with Stripe integration:
1. Check Edge Function logs in Supabase
2. Check webhook delivery logs in Stripe Dashboard
3. Verify all secrets are correctly configured
4. Ensure RLS policies allow database operations
