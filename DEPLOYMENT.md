# RentChain Deployment Guide

This guide walks you through deploying RentChain to Solana Devnet/Mainnet and Vercel.

---

## Prerequisites

- Solana CLI configured
- Anchor CLI installed
- Solana wallet with SOL for deployment
- Vercel account (for frontend)
- USDC devnet tokens for testing

---

## Part 1: Deploy Smart Contracts to Solana Devnet

### Step 1: Configure Solana CLI

```bash
# Set to devnet
solana config set --url devnet

# Create/check wallet
solana-keygen new --outfile ~/.config/solana/id.json
# OR use existing wallet
solana config set --keypair ~/.config/solana/id.json

# Check wallet address
solana address

# Request airdrop for deployment
solana airdrop 2
```

### Step 2: Update Program IDs

After first build, you'll get program IDs. Update them in:

1. **Anchor.toml**
```toml
[programs.devnet]
property_registry = "YOUR_PROPERTY_PROGRAM_ID"
rental_agreement = "YOUR_RENTAL_PROGRAM_ID"
escrow = "YOUR_ESCROW_PROGRAM_ID"
```

2. **programs/*/src/lib.rs**
```rust
// Update each program's declare_id!()
declare_id!("YOUR_PROGRAM_ID_HERE");
```

### Step 3: Build and Deploy

```bash
# Build all programs
anchor build

# Get program IDs
anchor keys list

# Update the IDs as mentioned in Step 2, then rebuild
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show YOUR_PROGRAM_ID
```

### Step 4: Test Programs

```bash
# Run tests on devnet
anchor test --provider.cluster devnet

# Or run local validator for testing
solana-test-validator

# In another terminal
anchor test
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Environment Variables

Create `.env.local` in `cypherpunk/` directory:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROPERTY_PROGRAM_ID=YOUR_PROPERTY_PROGRAM_ID
NEXT_PUBLIC_RENTAL_PROGRAM_ID=YOUR_RENTAL_PROGRAM_ID
NEXT_PUBLIC_ESCROW_PROGRAM_ID=YOUR_ESCROW_PROGRAM_ID
```

### Step 2: Update Frontend Code

Update program IDs in your frontend integration files (when you add them):

```typescript
// lib/programIds.ts
export const PROPERTY_PROGRAM_ID = new PublicKey("YOUR_PROPERTY_PROGRAM_ID");
export const RENTAL_PROGRAM_ID = new PublicKey("YOUR_RENTAL_PROGRAM_ID");
export const ESCROW_PROGRAM_ID = new PublicKey("YOUR_ESCROW_PROGRAM_ID");
```

### Step 3: Deploy to Vercel

```bash
cd cypherpunk

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: rentchain
# - Directory: ./
# - Override settings: No

# Deploy to production
vercel --prod
```

### Step 4: Configure Vercel Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy to apply changes

---

## Part 3: Get USDC Devnet Tokens

### For Testing

```bash
# Install SPL Token CLI
cargo install spl-token-cli

# Get USDC devnet mint address
# Devnet USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Create USDC token account
spl-token create-account EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Request airdrop from faucet
# Visit: https://spl-token-faucet.com/?token-name=USDC-Dev
```

---

## Part 4: Mainnet Deployment (Production)

### Important Security Steps

1. **Audit Smart Contracts**
   - Get professional audit
   - Review all security checks
   - Test extensively on devnet

2. **Update to Mainnet**
```bash
# Set to mainnet
solana config set --url mainnet-beta

# Use production wallet (secure!)
solana config set --keypair ~/.config/solana/mainnet-wallet.json

# Deploy (costs SOL!)
anchor deploy --provider.cluster mainnet

# Update frontend env to mainnet
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

3. **Configure RPC**
   - Use paid RPC (Helius, QuickNode, Alchemy)
   - Update in frontend config

---

## Troubleshooting

### Build Errors

```bash
# Clear build cache
rm -rf target/ .anchor/

# Rebuild
anchor build
```

### Deployment Fails

```bash
# Check SOL balance
solana balance

# Check program account size
anchor build --verifiable
```

### Frontend Issues

```bash
# Clear Next.js cache
rm -rf cypherpunk/.next/

# Reinstall dependencies
cd cypherpunk
rm -rf node_modules package-lock.json
npm install
```

### Wallet Connection Issues

- Make sure Phantom/Solflare is installed
- Check network matches (devnet/mainnet)
- Clear browser cache

---

## Monitoring

### Smart Contract Events

```bash
# Watch program logs
solana logs YOUR_PROGRAM_ID

# Parse events from transactions
anchor events --program YOUR_PROGRAM_ID
```

### Frontend Analytics

- Add Vercel Analytics
- Add Web3 analytics (Dune, Flipside)
- Monitor transaction success rates

---

## Costs Estimate

### Devnet (FREE)
- Smart contract deployment: 0 SOL (airdrop)
- Transactions: 0 SOL (airdrop)
- Frontend: Free (Vercel Hobby)

### Mainnet
- Smart contract deployment: ~5-10 SOL
- Rent exemption: ~2-3 SOL per account
- Transactions: ~0.000005 SOL per tx
- Frontend: Free (Vercel Hobby) or $20/month (Pro)
- RPC: $0-$50/month depending on usage

---

## Post-Deployment Checklist

- [ ] Smart contracts deployed and verified
- [ ] Program IDs updated everywhere
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Wallets connected successfully
- [ ] Test transactions on devnet
- [ ] Documentation updated
- [ ] Team has access to deployment accounts
- [ ] Monitoring set up
- [ ] Backup deployment keys securely

---

## Support

For deployment issues:
- Solana Discord: https://discord.gg/solana
- Anchor Discord: https://discord.gg/anchor
- Vercel Support: https://vercel.com/support

---

**Good luck with your deployment! 🚀**
