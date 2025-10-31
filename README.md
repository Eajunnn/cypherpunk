# RENTCHAIN 🏠⛓️

**Blockchain-Powered Rental Platform on Solana**

RENTCHAIN is a decentralized rental platform that leverages Solana blockchain technology to transform how rental agreements work. By using smart contracts, automated escrow, and stablecoin payments, RENTCHAIN creates a trustless, transparent, and efficient rental ecosystem.

[![Solana](https://img.shields.io/badge/Solana-Blockchain-9945FF?style=flat&logo=solana)](https://solana.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 The Problem

Traditional rental markets face three critical challenges:

1. **Lack of Transparency** - Hidden fees and unclear lease terms disadvantage tenants
2. **Trust Barriers** - Security deposits are locked up, frequently disputed, and can take months to return
3. **Inefficiency** - Intermediaries, paperwork, and slow cross-border payment settlements create friction

---

## 💡 The Solution

RENTCHAIN leverages **Solana's high-speed, low-cost blockchain** to create a trustless rental platform:

### Core Features

- **🤝 Smart Contract Agreements** - Every lease term is transparent, immutable, and automatically enforced on-chain
- **🔐 Automated Escrow Protection** - Security deposits held in program-controlled accounts, released automatically based on agreed conditions
- **💸 Instant Stablecoin Payments** - Borderless rent payments in USDC with minimal fees
- **✅ Complete Verifiability** - All transactions are publicly verifiable on-chain

---

## 🏗️ Architecture

### Smart Contracts (Rust/Anchor)

RENTCHAIN consists of three Solana programs deployed on devnet:

1. **Property Management Program** - Creates and manages property listings
2. **Rental Agreement Program** - Handles lease creation and enforcement
3. **Escrow Program** - Manages security deposit escrow accounts

### Frontend (React)

Full-featured web interface with:
- Landlord dashboard for property management
- Tenant portal for browsing and renting
- Real-time transaction tracking
- Wallet integration (Phantom, Solflare)

---

## 🚀 Quick Start

### Prerequisites

- Node.js v16+ and npm/yarn
- Rust 1.70+
- Solana CLI 1.16+
- Anchor Framework 0.28+

### Installation

```bash
# Clone the repository
git clone https://github.com/Eajunnn/cypherpunk.git

# Install dependencies
npm install

# Install Anchor dependencies
cd programs
anchor build
```

### Deploy to Devnet

```bash
# Configure Solana CLI for devnet
solana config set --url devnet

# Deploy programs
anchor deploy

# Update program IDs in your frontend
```

### Run the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📖 How It Works

### For Landlords

1. **Create Property Listing** - Connect wallet and create on-chain property account with rental terms
2. **Set Transparent Terms** - Define monthly rent (USDC), security deposit, and lease duration
3. **Receive Instant Payments** - Get rent payments directly to your wallet in seconds
4. **Automated Escrow** - Security deposits are automatically managed by smart contracts

### For Tenants

1. **Browse Properties** - View all available properties with transparent terms
2. **Execute Rental Agreement** - One-click transaction creates lease and transfers deposit to escrow
3. **Pay Rent** - Send USDC payments instantly with on-chain verification
4. **Protected Deposits** - Deposits automatically returned at lease end (if no disputes)

### Transaction Flow

```
1. Landlord creates property listing → On-chain property account
2. Tenant rents property → Rental agreement + escrow account created atomically
3. Tenant pays monthly rent → USDC transferred directly to landlord
4. Lease ends → Smart contract automatically releases deposit to tenant
```

---

## 🛠️ Tech Stack

### Blockchain
- **Solana** - High-speed, low-cost Layer 1 blockchain
- **Anchor Framework** - Rust framework for Solana programs
- **SPL Token** - USDC stablecoin for payments

### Frontend
- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **@solana/web3.js** - Solana JavaScript SDK
- **@project-serum/anchor** - Anchor client library
- **@solana/wallet-adapter** - Wallet connection

### Development Tools
- **Anchor** - Solana development framework
- **Solana CLI** - Command-line tools
- **Mocha** - Testing framework

---

## 🌟 Why Solana?

RENTCHAIN chose Solana for three critical reasons:

| Feature | Benefit |
|---------|---------|
| **Speed** | Sub-second transaction finality means rent payments settle instantly |
| **Cost** | Transaction fees < $0.01 make frequent interactions economically viable |
| **Scale** | Thousands of TPS ready for real-world adoption at scale |

Other blockchains would make this use case prohibitively expensive or too slow for practical use.

---

## 📁 Project Structure

```
rentchain/
├── programs/              # Solana programs (Rust/Anchor)
│   ├── property/         # Property management program
│   ├── rental/           # Rental agreement program
│   └── escrow/           # Escrow management program
├── app/                  # Frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # Wallet and connection contexts
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Helper functions
│   └── public/
├── tests/                # Integration tests
└── migrations/           # Deployment scripts
```

---

## 🧪 Testing

```bash
# Run program tests
anchor test

# Run frontend tests
cd frontend
npm test

# Run integration tests
npm run test:integration
```

---

## 🎨 Demo

### Landlord Dashboard
- Create property listings with transparent terms
- View active rentals and payment history
- Manage escrow accounts

### Tenant Portal
- Browse available properties
- Execute rental agreements with one transaction
- Track rent payments and deposit status

---

## 🌍 Use Cases

### Real Estate Agencies
- Automate rent collection and reduce operational overhead
- Provide transparent, verifiable transaction records
- Eliminate security deposit disputes

### Property Managers
- Manage multiple properties with on-chain efficiency
- Instant payment settlements
- Reduced intermediary costs

### International Rentals
- Borderless payments with stablecoins
- No currency conversion fees
- Instant cross-border transactions

---

## 🔒 Security

- **Audited Smart Contracts** - Programs follow Anchor security best practices
- **Escrow Protection** - Deposits held in program-controlled PDAs (Program Derived Addresses)
- **Atomic Transactions** - All operations succeed or fail together
- **On-Chain Verification** - Every action is publicly auditable

---

## 🚧 Roadmap

- [x] Deploy programs to Solana devnet
- [x] Build full-featured React interface
- [x] Implement end-to-end rental workflows
- [ ] Security audit by third-party firm
- [ ] Deploy to Solana mainnet
- [ ] Mobile app (iOS/Android)
- [ ] Multi-signature support for property co-ownership
- [ ] Tokenized rental income streams (RWA)
- [ ] Dispute resolution mechanism
- [ ] Integration with property verification oracles

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Junot** - Inspiration from France and Belgium's leading luxury real estate agency
- **Solana Foundation** - For building an incredible blockchain platform
- **Anchor Framework** - For making Solana development accessible

---

## 💎 Built for the Future

Real estate is one of the largest asset classes in the world, yet it's one of the least digitized. RENTCHAIN demonstrates how blockchain—specifically Solana—can bring transparency, efficiency, and trust to an industry that desperately needs it.

**The question isn't *if* blockchain will transform real estate—it's *who* will lead that transformation.**

---

Made with ❤️ by the RENTCHAIN Team
