# RentChain - Stablecoin Rental Platform

## 🎯 Project Overview
A decentralized rental platform on Solana enabling transparent, automated rental agreements with stablecoin payments, smart contract escrows, and trustless security deposits.

---

## 🏗️ Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER ROLES                               │
│  👤 Landlord          👤 Tenant          👤 Admin           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │  │  Properties  │  │  Dashboards  │     │
│  │     Page     │  │   Listings   │  │  (L/T/Admin) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Technology: Next.js 14 + TypeScript + TailwindCSS          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  WEB3 INTEGRATION                            │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Wallet Adapter (Phantom/Solflare/Backpack)     │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │  @solana/web3.js + @coral-xyz/anchor             │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SOLANA PROGRAMS (ANCHOR)                    │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │  1. PROPERTY REGISTRY PROGRAM                  │        │
│  │  • Create property listings                    │        │
│  │  • Store metadata (rent, deposit, terms)       │        │
│  │  • Update/deactivate listings                  │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │  2. RENTAL AGREEMENT PROGRAM                   │        │
│  │  • Create rental contracts                     │        │
│  │  • Tenant applies + pays deposit               │        │
│  │  • Auto-schedule monthly payments              │        │
│  │  • Lease termination logic                     │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │  3. ESCROW PROGRAM                             │        │
│  │  • Hold security deposits in PDA               │        │
│  │  • Auto-release after lease end                │        │
│  │  • Dispute flagging mechanism                  │        │
│  │  • Partial deduction support                   │        │
│  └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Property    │  │   Rental     │  │    USDC      │     │
│  │    NFTs      │  │  Agreements  │  │   Payments   │     │
│  │  (Metadata)  │  │   (State)    │  │  (SPL Token) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Network: Solana Devnet → Mainnet                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   STORAGE LAYER                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  IPFS/Arweave: Property images, documents        │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Supabase (Optional): Off-chain search index     │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flow Diagram

### **Landlord Flow**
```
1. Connect Wallet
   ↓
2. Create Property Listing
   • Upload property details
   • Set rent amount (USDC)
   • Set security deposit
   • Set lease terms
   ↓
3. Property → On-Chain
   • Call property_registry.create_listing()
   • Mint property NFT
   ↓
4. Receive Applications
   ↓
5. Accept Tenant
   • Call rental_agreement.create_lease()
   ↓
6. Receive Monthly Rent
   • Auto-transferred from escrow
   ↓
7. End Lease
   • Release/deduct security deposit
```

### **Tenant Flow**
```
1. Connect Wallet
   ↓
2. Browse Properties
   • Filter by location, price
   • View property details
   ↓
3. Apply for Property
   • Pay security deposit (USDC)
   • Sign lease terms
   ↓
4. Lease Approved
   • rental_agreement.accept_tenant()
   ↓
5. Move In
   • Escrow holds deposit
   ↓
6. Monthly Auto-Payment
   • USDC deducted automatically
   • No manual transactions
   ↓
7. Lease End
   • Receive deposit back (if no issues)
```

### **Payment Flow**
```
Tenant Wallet
   ↓ [Initial: Deposit + First Month]
Escrow PDA
   ↓ [Monthly: Auto-release]
Landlord Wallet
   ↓ [End: Deposit return/deduction]
Tenant Wallet
```

---

## 🛠️ Technology Stack

### **Blockchain**
| Component | Technology | Purpose |
|-----------|------------|---------|
| Blockchain | Solana | Fast, low-cost transactions |
| Framework | Anchor 0.29+ | Smart contract framework |
| Token | USDC (SPL) | Stablecoin payments |
| NFTs | Metaplex | Property ownership proof |

### **Frontend**
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Next.js 14 | React with App Router |
| Language | TypeScript | Type safety |
| Styling | TailwindCSS | Utility-first CSS |
| Components | shadcn/ui | Pre-built UI components |
| State | Zustand/Context | Global state management |

### **Web3 Integration**
| Component | Technology | Purpose |
|-----------|------------|---------|
| Wallet | @solana/wallet-adapter-react | Multi-wallet support |
| Web3 | @solana/web3.js | Blockchain interactions |
| Anchor Client | @coral-xyz/anchor | Program communication |
| SPL Tokens | @solana/spl-token | Token operations |

### **Backend (Optional for MVP)**
| Component | Technology | Purpose |
|-----------|------------|---------|
| API | Next.js API Routes | Serverless endpoints |
| Database | Supabase/PostgreSQL | Off-chain metadata |
| Cache | Upstash Redis | Performance optimization |
| Storage | IPFS/Arweave | Decentralized file storage |

### **DevOps & Tools**
| Component | Technology | Purpose |
|-----------|------------|---------|
| Deployment | Vercel | Frontend hosting |
| Testing | Anchor Test | Smart contract tests |
| Network | Solana Devnet | Testing environment |
| Version Control | Git + GitHub | Code management |

---

## 📦 Smart Contract Structure

### **1. Property Registry Program**
```rust
pub struct Property {
    pub landlord: Pubkey,          // Owner address
    pub property_id: u64,          // Unique ID
    pub rent_amount: u64,          // Monthly rent in USDC
    pub deposit_amount: u64,       // Security deposit
    pub lease_duration: i64,       // In seconds
    pub is_available: bool,        // Listing status
    pub metadata_uri: String,      // IPFS link
    pub bump: u8,                  // PDA bump
}

Instructions:
- create_listing()
- update_listing()
- deactivate_listing()
```

### **2. Rental Agreement Program**
```rust
pub struct RentalAgreement {
    pub property: Pubkey,          // Property account
    pub landlord: Pubkey,          // Landlord address
    pub tenant: Pubkey,            // Tenant address
    pub start_date: i64,           // Unix timestamp
    pub end_date: i64,             // Unix timestamp
    pub rent_amount: u64,          // Monthly rent
    pub deposit_amount: u64,       // Security deposit
    pub payment_count: u8,         // Payments made
    pub is_active: bool,           // Lease status
    pub bump: u8,
}

Instructions:
- create_lease()
- pay_rent()
- end_lease()
- dispute_lease()
```

### **3. Escrow Program**
```rust
pub struct Escrow {
    pub rental_agreement: Pubkey,  // Associated lease
    pub tenant: Pubkey,            // Depositor
    pub landlord: Pubkey,          // Beneficiary
    pub amount: u64,               // Deposit amount
    pub is_released: bool,         // Release status
    pub bump: u8,
}

Instructions:
- deposit_to_escrow()
- release_to_tenant()
- release_to_landlord()
- partial_deduct()
```

---

## 🎨 Frontend Pages

### **Public Pages**
1. **Landing Page** (`/`)
   - Hero section
   - Features showcase
   - How it works
   - CTA buttons

2. **Properties Listing** (`/properties`)
   - Grid/list view
   - Search & filters
   - Property cards

3. **Property Detail** (`/properties/[id]`)
   - Images gallery
   - Details & terms
   - "Rent Now" button
   - Landlord info

### **Landlord Dashboard** (`/landlord`)
1. **My Properties**
   - Active listings
   - Create new listing

2. **Active Leases**
   - Tenant info
   - Payment history

3. **Revenue Analytics**
   - Total income
   - Payment schedule

### **Tenant Dashboard** (`/tenant`)
1. **My Rentals**
   - Current lease
   - Lease end date

2. **Payment History**
   - Past payments
   - Upcoming payments

3. **Deposit Status**
   - Escrow balance
   - Refund tracking

---

## 🔐 Security Features

1. **Smart Contract Security**
   - PDA-based account ownership
   - Signer verification on all mutations
   - Amount overflow checks
   - Reentrancy protection

2. **Frontend Security**
   - Wallet signature verification
   - Transaction simulation before send
   - Rate limiting on API routes
   - Input sanitization

3. **Escrow Protection**
   - Time-locked releases
   - Multi-sig for disputes
   - Transparent audit trail

---

## 📊 Data Models

### **On-Chain (Solana Accounts)**
- Property accounts
- Rental agreement accounts
- Escrow PDAs
- Transaction history

### **Off-Chain (Supabase - Optional)**
```sql
properties (
  id, address, city, country,
  bedrooms, bathrooms, sqft,
  images[], description,
  created_at
)

users (
  wallet_address, role,
  email, phone, kyc_status
)

search_index (
  property_id, searchable_text
)
```

---

## 🚀 MVP Features (Day 1)

### **Must Have**
- ✅ Connect wallet (Phantom/Solflare)
- ✅ List property (landlord)
- ✅ Browse properties (tenant)
- ✅ Create rental agreement
- ✅ Pay deposit in USDC
- ✅ Auto-monthly rent payment
- ✅ End lease + release deposit
- ✅ Basic dashboards

### **Nice to Have (If Time)**
- ⭐ Property image upload to IPFS
- ⭐ Email notifications
- ⭐ Payment reminders
- ⭐ Dispute resolution UI

### **Future Enhancements**
- 🔮 Fractional property ownership
- 🔮 Credit scoring based on rental history
- 🔮 DeFi yield on deposits
- 🔮 Cross-border multi-currency
- 🔮 DAO governance for disputes
- 🔮 Insurance integration

---

## 📈 Success Metrics

1. **Technical**
   - All transactions < 1 second
   - Smart contracts fully tested
   - Zero security vulnerabilities

2. **User Experience**
   - Intuitive wallet connection
   - Clear transaction feedback
   - Mobile responsive

3. **Hackathon Criteria**
   - ✅ Practical application to real estate
   - ✅ Leverages Solana's speed/cost
   - ✅ Scalable and adoptable
   - ✅ Innovative RWA solution

---

## 🎯 Pitch Points

1. **Problem**: Traditional rentals have high friction, delayed payments, deposit disputes
2. **Solution**: Automated, transparent, trustless rental agreements on Solana
3. **Innovation**: First stablecoin-native rental platform with programmatic escrows
4. **Market**: €8.5T European rental market, ready for Web3 disruption
5. **Traction**: Live demo with real transactions on Solana devnet

---

## 🏗️ Project Structure

```
rentchain/
├── programs/                   # Anchor Solana programs
│   ├── property-registry/
│   │   └── src/
│   │       └── lib.rs
│   ├── rental-agreement/
│   │   └── src/
│   │       └── lib.rs
│   └── escrow/
│       └── src/
│           └── lib.rs
├── app/                        # Next.js frontend
│   ├── app/
│   │   ├── page.tsx           # Landing
│   │   ├── properties/
│   │   ├── landlord/
│   │   └── tenant/
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── wallet/
│   │   └── property/
│   └── lib/
│       ├── anchor/            # Program clients
│       └── utils/
├── tests/                      # Anchor tests
├── Anchor.toml
└── package.json
```

---

**Built for Solana Colosseum Hackathon 2025 🚀**
**Track: Real Estate & RWA Innovation with Junot**
