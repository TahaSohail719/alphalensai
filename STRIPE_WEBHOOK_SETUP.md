# Configuration du Webhook Stripe - Guide Complet

## ⚠️ IMPORTANT
Sans cette configuration, les paiements Stripe ne mettront PAS à jour les crédits ni le plan des utilisateurs!

## Étape 1: Configurer le Webhook dans Stripe Dashboard

1. **Ouvrir le Stripe Dashboard**
   - Allez sur https://dashboard.stripe.com/test/webhooks (pour le mode test)
   - OU https://dashboard.stripe.com/webhooks (pour le mode production)

2. **Créer un nouveau endpoint**
   - Cliquez sur "Add endpoint" ou "+ Ajouter un point de terminaison"
   - Endpoint URL: `https://jqrlegdulnnrpiixiecf.supabase.co/functions/v1/stripe-webhook`

3. **Sélectionner les événements à surveiller**
   Cochez les événements suivants:
   - ✅ `checkout.session.completed` - Initialisation du plan + crédits après achat
   - ✅ `customer.subscription.updated` - Mise à jour lors d'upgrade/downgrade
   - ✅ `invoice.payment_succeeded` - Renouvellement mensuel des crédits
   - ✅ `customer.subscription.deleted` - Downgrade vers plan gratuit

4. **Copier le Signing Secret**
   - Après avoir créé l'endpoint, Stripe affiche un "Signing secret"
   - Il ressemble à: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Copiez-le immédiatement!**

## Étape 2: Ajouter le Secret dans Supabase

1. **Ouvrir Supabase Dashboard**
   - URL directe: https://supabase.com/dashboard/project/jqrlegdulnnrpiixiecf/settings/functions

2. **Ajouter le secret**
   - Nom du secret: `STRIPE_WEBHOOK_SECRET`
   - Valeur: Collez le signing secret copié depuis Stripe (commence par `whsec_`)

3. **Sauvegarder**
   - Cliquez sur "Add secret" ou "Save"

## Étape 3: Vérifier que tout fonctionne

### Test Rapide
1. Allez sur `/test-webhook` dans votre application
2. Effectuez un paiement test sur `/pricing`
3. Vérifiez les logs du webhook: https://supabase.com/dashboard/project/jqrlegdulnnrpiixiecf/functions/stripe-webhook/logs
4. Vous devriez voir:
   ```
   [STRIPE-WEBHOOK] Webhook received
   [STRIPE-WEBHOOK] Webhook signature verified
   [STRIPE-WEBHOOK] Processing event - checkout.session.completed
   [STRIPE-WEBHOOK] User credits initialized
   [STRIPE-WEBHOOK] Profile plan updated
   ```

### Test Complet E2E
1. **Créer un compte de test** ou utilisez un compte existant
2. **Aller sur `/pricing`**
3. **Cliquer sur "Upgrade" pour un plan** (Basic, Standard ou Premium)
4. **Compléter le checkout Stripe** avec la carte de test: `4242 4242 4242 4242`
5. **Vérifier la redirection** vers `/payment-success`
6. **Vérifier dans Supabase:**
   ```sql
   -- Vérifier que le plan a été mis à jour
   SELECT user_id, user_plan, broker_name 
   FROM profiles 
   WHERE user_id = 'VOTRE_USER_ID';
   
   -- Vérifier que les crédits ont été initialisés
   SELECT user_id, plan_type, 
          credits_queries_remaining, 
          credits_ideas_remaining, 
          credits_reports_remaining,
          last_reset_date
   FROM user_credits 
   WHERE user_id = 'VOTRE_USER_ID';
   ```
7. **Vérifier sur `/credits`** - Doit afficher le nouveau plan et les nouveaux crédits

## Étape 4: Configuration Stripe Production

Quand vous passez en production:

1. **Créer un webhook en mode production** (même URL)
2. **Obtenir le nouveau signing secret production** (différent du test!)
3. **Mettre à jour `STRIPE_WEBHOOK_SECRET`** dans Supabase avec la valeur production
4. **Tester avec une vraie carte** (ou mode test production)

## Flux Complet du Webhook

```
Utilisateur achète un plan
         ↓
Stripe Checkout Session créée (mode: "subscription")
         ↓
Paiement réussi
         ↓
Stripe envoie webhook → stripe-webhook Edge Function
         ↓
Vérification signature (STRIPE_WEBHOOK_SECRET)
         ↓
Traitement événement checkout.session.completed:
  1. Récupérer email client
  2. Trouver ou créer utilisateur Supabase
  3. Déterminer plan_type (metadata ou price_id)
  4. Appeler initialize_user_credits(user_id, plan_type)
  5. Mettre à jour profiles.user_plan
         ↓
Utilisateur voit son nouveau plan et crédits sur /credits et /pricing
```

## Dépannage

### Problème: Pas de logs dans stripe-webhook
**Cause:** Webhook non configuré dans Stripe ou URL incorrecte  
**Solution:** Vérifier l'URL du webhook dans Stripe Dashboard

### Problème: Erreur "Invalid signature"
**Cause:** STRIPE_WEBHOOK_SECRET incorrect ou manquant  
**Solution:** Revérifier le secret dans Supabase Settings → Functions

### Problème: Plan et crédits non mis à jour
**Cause:** Événement non traité ou erreur dans le webhook  
**Solution:** 
1. Vérifier les logs: https://supabase.com/dashboard/project/jqrlegdulnnrpiixiecf/functions/stripe-webhook/logs
2. Chercher des erreurs dans les logs
3. Vérifier que `plan_parameters` contient bien les `stripe_price_id`

### Problème: "Could not determine plan_type"
**Cause:** `metadata.plan_type` manquant ET `price_id` non trouvé dans `plan_parameters`  
**Solution:** 
```sql
-- Vérifier que les price_id sont corrects
SELECT plan_type, stripe_price_id 
FROM plan_parameters 
WHERE stripe_price_id IS NOT NULL;

-- Doit retourner:
-- basic    | price_1SC398Bbyt0kGZ1fmyLGVmWa
-- standard | price_1SC39lBbyt0kGZ1fUhOBloBb
-- premium  | price_1SC39zBbyt0kGZ1fvhRYyA0x
```

## Liens Utiles

- **Logs Webhook:** https://supabase.com/dashboard/project/jqrlegdulnnrpiixiecf/functions/stripe-webhook/logs
- **Secrets Supabase:** https://supabase.com/dashboard/project/jqrlegdulnnrpiixiecf/settings/functions
- **Webhooks Stripe (Test):** https://dashboard.stripe.com/test/webhooks
- **Webhooks Stripe (Prod):** https://dashboard.stripe.com/webhooks
- **Page de test:** https://votre-domaine.com/test-webhook

## Cartes de Test Stripe

- **Succès:** `4242 4242 4242 4242`
- **Décliné:** `4000 0000 0000 0002`
- **Authentification requise:** `4000 0027 6000 3184`

Date d'expiration: N'importe quelle date future  
CVC: N'importe quel 3 chiffres  
Code postal: N'importe quel code
