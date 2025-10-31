# RentChain - Quick Start Guide

Get RentChain up and running in 5 minutes!

---

## ⚡ Quick Setup

### 1. Start the Frontend (Immediate Demo)

```bash
cd cypherpunk
npm run dev
```

Open http://localhost:3000 in your browser!

**What you can do:**
- ✅ View landing page with features
- ✅ Browse property listings
- ✅ Connect Phantom/Solflare wallet
- ✅ Explore landlord/tenant dashboards
- ⚠️ Transactions are mock (no blockchain yet)

---

## 🔧 Full Development Setup

### Prerequisites Check

```bash
# Check all required tools
node --version    # Should be v18+
npm --version     # Should be v8+
rustc --version   # Should be 1.70+
solana --version  # Should be 1.14+
anchor --version  # Should be 0.29+
```

### Step 1: Configure Solana

```bash
# Set to devnet for testing
solana config set --url devnet

# Check/create wallet
solana address

# Get test SOL
solana airdrop 2
```

### Step 2: Build Smart Contracts

```bash
# From project root
anchor build

# This will compile all 3 programs:
# - property-registry
# - rental-agreement
# - escrow
```

### Step 3: Run Tests

```bash
# Start local validator (optional)
solana-test-validator

# In another terminal, run tests
anchor test
```

### Step 4: Deploy to Devnet

```bash
# Deploy all programs
anchor deploy --provider.cluster devnet

# Note the program IDs from output
```

### Step 5: Update Frontend

1. Copy program IDs from deployment
2. Update `Anchor.toml` with new IDs
3. Restart frontend: `cd cypherpunk && npm run dev`

---

## 🎮 Demo Walkthrough

### As a Landlord:

1. **Connect Wallet**
   - Click "Connect Wallet" in navbar
   - Select Phantom/Solflare
   - Approve connection

2. **List a Property**
   - Go to `/landlord`
   - Click "List New Property"
   - Fill in property details
   - Submit (mock transaction)

3. **View Your Listings**
   - See your properties in "My Properties"
   - Check active leases

### As a Tenant:

1. **Browse Properties**
   - Go to `/properties`
   - Filter by location/availability
   - Click on a property

2. **Apply for Rental**
   - View property details
   - Click "Apply for Rental"
   - Pay deposit (mock transaction)

3. **Manage Rental**
   - Go to `/tenant`
   - View current lease
   - Check payment history
   - Pay rent (mock transaction)

---

## 📁 Project Structure Overview

```
rentchain/
├── programs/                    # Solana smart contracts
│   ├── property-registry/       # Property listings
│   ├── rental-agreement/        # Rental contracts
│   └── escrow/                  # Security deposits
│
├── cypherpunk/                  # Next.js frontend
│   ├── app/                     # Pages
│   │   ├── page.tsx            # Landing
│   │   ├── properties/         # Listings
│   │   ├── landlord/           # Landlord dashboard
│   │   └── tenant/             # Tenant dashboard
│   └── components/             # React components
│
├── tests/                       # Smart contract tests
├── Anchor.toml                 # Anchor configuration
├── README.md                   # Main documentation
├── RENTCHAIN.md               # Technical specs
└── DEPLOYMENT.md              # Deployment guide
```

---

## 🐛 Common Issues & Solutions

### Issue: "anchor: command not found"

```bash
# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked --force
```

### Issue: "Insufficient funds"

```bash
# Get more SOL on devnet
solana airdrop 2

# Check balance
solana balance
```

### Issue: Frontend won't connect to wallet

- Make sure Phantom/Solflare is installed
- Check you're on devnet in wallet settings
- Clear browser cache and retry

### Issue: Build fails

```bash
# Clear cache
rm -rf target/ .anchor/

# Rebuild
anchor build
```

### Issue: Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
cd cypherpunk
PORT=3001 npm run dev
```

---

## 🚀 Next Steps

1. **Add Real Blockchain Integration**
   - Connect frontend to deployed programs
   - Implement actual transactions
   - Add IDL generation

2. **Enhance Features**
   - Add IPFS for property images
   - Implement search/filters
   - Add payment notifications

3. **Testing**
   - Write comprehensive tests
   - Test with real USDC devnet tokens
   - Test wallet interactions

4. **Deploy to Production**
   - Deploy to Vercel
   - Get security audit
   - Deploy to mainnet

---

## 📚 Learn More

- [Solana Docs](https://docs.solana.com)
- [Anchor Book](https://book.anchor-lang.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

---

## 💬 Need Help?

- Check [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide
- Review [RENTCHAIN.md](RENTCHAIN.md) for technical details

---

**Happy Building! 🎉**
