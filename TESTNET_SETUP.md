# RentChain - Testnet (Devnet) Setup Guide

Generating a new keypair

For added security, enter a BIP39 passphrase

NOTE! This passphrase improves security of the recovery seed phrase NOT the
keypair file itself, which is stored as insecure plain text

BIP39 Passphrase (empty for none): 

Wrote new keypair to /root/.config/solana/id.json
======================================================================
pubkey: BdM5cC9ZDv5dtTWFf1Lqc5t9Cn4q1H6jaMiJ5vuujyTU
======================================================================
Save this seed phrase and your BIP39 passphrase to recover your new keypair:
path kitten index alpha blood chest swing chunk cute fossil floor real
======================================================================

Get your RentChain app working with **real blockchain transactions** on Solana Devnet using **free test funds**!

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Get Devnet SOL (Free!)

```bash
# Configure Solana CLI for devnet
solana config set --url devnet

# Check your wallet address
solana address

# Get 2 SOL for free (repeat if needed)
solana airdrop 2

# Check balance
solana balance
```

**Alternative:** Use web faucet
- Visit: https://faucet.solana.com/
- Paste your wallet address
- Click "Airdrop 2 SOL"

---

### Step 2: Get Devnet USDC (Free!)

**Option A: SPL Token Faucet**
```bash
# Install SPL Token CLI
cargo install spl-token-cli

# Devnet USDC Mint Address
# 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Create USDC token account
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Get 1000 USDC devnet tokens
spl-token mint 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU 1000

# Check balance
spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

**Option B: Web Faucet**
- Visit: https://spl-token-faucet.com/?token-name=USDC-Dev
- Connect wallet (Phantom/Solflare)
- Click "Airdrop USDC"

---

### Step 3: Deploy Smart Contracts to Devnet

```bash
# From project root
cd /root/Blockchain/Junot

# Make sure you're on devnet
solana config set --url devnet

# Build programs
anchor build

# Get program IDs
anchor keys list

# Deploy to devnet (FREE with airdrop SOL!)
anchor deploy --provider.cluster devnet
```

**You'll see output like:**
```
Program Id: HqzYoNbSZC1mXWf3dXmeKzVqpGwLT7PVfGXCLBvr8C3Z (property-registry)
Program Id: 8zRZ1SbPzKnzXg7QvJj8rnR6vC3N8xCYmPqH5K9uTeWx (rental-agreement)
Program Id: 9wQvGxY4rN2jKtL5pXH8sVmE7T6fBzC4nUyMd3WqJ1Ax (escrow)
```

---

### Step 4: Update Frontend with Program IDs

Create `.env.local` in `cypherpunk/`:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com

# Replace with YOUR deployed program IDs
NEXT_PUBLIC_PROPERTY_PROGRAM_ID=HqzYoNbSZC1mXWf3dXmeKzVqpGwLT7PVfGXCLBvr8C3Z
NEXT_PUBLIC_RENTAL_PROGRAM_ID=8zRZ1SbPzKnzXg7QvJj8rnR6vC3N8xCYmPqH5K9uTeWx
NEXT_PUBLIC_ESCROW_PROGRAM_ID=9wQvGxY4rN2jKtL5pXH8sVmE7T6fBzC4nUyMd3WqJ1Ax

# Devnet USDC mint
NEXT_PUBLIC_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

---

### Step 5: Configure Wallet for Devnet

**Phantom Wallet:**
1. Click Settings (gear icon)
2. Scroll to "Developer Settings"
3. Change Network to **Devnet**
4. Done!

**Solflare Wallet:**
1. Click Settings
2. Network → Select **Devnet**
3. Done!

---

### Step 6: Run Frontend

```bash
cd cypherpunk
npm run dev
```

Open http://localhost:3000

**Now you can make REAL transactions on devnet! 🎉**

---

## 🎮 Testing Real Transactions

### Test as Landlord:

1. **Connect Wallet** (make sure it's on devnet!)
2. **Go to `/landlord`**
3. **List a Property**
   - Fill in details
   - Click "Create Property Listing"
   - **Sign transaction** in wallet
   - ✅ **Real on-chain transaction!**
4. **Check on Solana Explorer:**
   - https://explorer.solana.com/?cluster=devnet
   - Paste your wallet address
   - See your transaction!

### Test as Tenant:

1. **Browse Properties** at `/properties`
2. **View Property Details**
3. **Apply for Rental**
   - Click "Apply for Rental"
   - **Sign transaction** (deposit + first rent)
   - ✅ **Real USDC transfer on-chain!**
4. **Pay Rent** at `/tenant`
   - Click "Pay Rent"
   - **Sign transaction**
   - ✅ **Automated rent payment!**

---

## 💰 Cost Breakdown (All FREE!)

| Action | Devnet Cost | Mainnet Cost |
|--------|-------------|--------------|
| Deploy Programs | 0 SOL (free airdrop) | ~10 SOL (~$2000) |
| Create Property | ~0.00001 SOL | ~0.00001 SOL |
| Rent Payment | ~0.000005 SOL | ~0.000005 SOL |
| Escrow Deposit | ~0.00001 SOL | ~0.00001 SOL |
| **Total Demo** | **FREE** | **$2000+** |

---

## 🔍 Verify Transactions

### On Solana Explorer:
```
https://explorer.solana.com/?cluster=devnet
```

### Check Your Transactions:
1. Go to explorer
2. Paste your wallet address
3. See all your RentChain transactions!

### Check Program Accounts:
```bash
# View property listings
solana program show YOUR_PROPERTY_PROGRAM_ID --url devnet

# View account data
solana account YOUR_PROPERTY_ACCOUNT --url devnet
```

---

## 📊 Demo Script with Real Transactions

### For Hackathon Demo (5 min):

**1. Show Wallet on Devnet (30s)**
- "We're on Solana devnet with test funds"
- Show balance in Phantom

**2. Create Property Listing (1m)**
- Fill form on `/landlord`
- Click create
- **Sign real transaction**
- Show transaction on Solana Explorer

**3. Apply as Tenant (1m)**
- Switch wallet or use second device
- Browse properties
- Apply for rental
- **Sign real deposit transaction**
- Show on Explorer

**4. Pay Rent (1m)**
- Go to tenant dashboard
- Click "Pay Rent"
- **Sign real rent payment**
- Show on Explorer

**5. Check Escrow (1m)**
- Show deposit in escrow account
- Explain trustless custody
- Show smart contract holding funds

**Total: Real blockchain demo with actual transactions! 🚀**

---

## 🐛 Troubleshooting

### "Transaction failed: insufficient funds"
```bash
# Get more devnet SOL
solana airdrop 2
```

### "Wallet not connected"
- Make sure wallet is set to **devnet**
- Refresh page
- Reconnect wallet

### "Program not deployed"
```bash
# Check deployment
solana program show YOUR_PROGRAM_ID --url devnet

# Redeploy if needed
anchor deploy --provider.cluster devnet
```

### "USDC token account doesn't exist"
```bash
# Create USDC account
spl-token create-account 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Get USDC
spl-token mint 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU 1000
```

---

## 🎯 Next Steps

**Now that you have real transactions working:**

1. ✅ Deploy to devnet
2. ✅ Test all flows with real transactions
3. ✅ Record demo video showing actual blockchain activity
4. ✅ Submit to hackathon with live devnet demo
5. 🚀 Later: Audit + Deploy to mainnet for production

---

## 🔗 Useful Links

- **Devnet Faucet**: https://faucet.solana.com/
- **USDC Faucet**: https://spl-token-faucet.com/?token-name=USDC-Dev
- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet
- **Solana Devnet RPC**: https://api.devnet.solana.com

---

## 📝 Important Notes

✅ **Devnet is perfect for:**
- Hackathon demos
- Development & testing
- Showing real blockchain functionality
- Getting feedback before mainnet

❌ **Devnet is NOT for:**
- Production apps
- Real money/value
- Long-term storage (resets periodically)

---

**You now have a fully functional blockchain app with REAL transactions! 🎉**

All transactions are on-chain, verified, and work exactly like mainnet - just with free test tokens!
