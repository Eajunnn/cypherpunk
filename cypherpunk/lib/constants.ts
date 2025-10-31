import { PublicKey } from '@solana/web3.js';

// Program IDs (DEPLOYED ON DEVNET - will be updated after redeployment)
export const PROPERTY_PROGRAM_ID = new PublicKey('5d3VC6f3bRHUZcos7GdA6fmj8Xtuhf2oSCDD988kmDWs');
export const RENTAL_PROGRAM_ID = new PublicKey('FD4wJxjtivZBoujfYACCUNo1D7ygsbn9Gx26cU1UqPXV');
export const ESCROW_PROGRAM_ID = new PublicKey('7aa5fKvc4ejGWZdbxn8DmH5RVhofgwURXibcp3RtstAg');

// Decimals
export const SOL_DECIMALS = 9; // SOL has 9 decimals (lamports)
export const USDC_DECIMALS = 6; // USDC has 6 decimals

// Token mints
export const USDC_MINT = new PublicKey('CKVj1JMU7H6rqNdWg7miQyufc5GEXjeTSMbpW7h41sgJ'); // Devnet mock USDC mint
