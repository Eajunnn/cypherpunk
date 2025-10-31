import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PROPERTY_PROGRAM_ID, RENTAL_PROGRAM_ID, ESCROW_PROGRAM_ID, SOL_MINT } from './constants';

// Helper to get property PDA
export async function getPropertyPDA(landlord: PublicKey, propertyId: number) {
  const [propertyPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from('property'),
      landlord.toBuffer(),
      Buffer.from(new Uint8Array(new BigUint64Array([BigInt(propertyId)]).buffer)),
    ],
    PROPERTY_PROGRAM_ID
  );
  return propertyPDA;
}

// Helper to get rental agreement PDA
export async function getRentalAgreementPDA(property: PublicKey, tenant: PublicKey) {
  const [rentalPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from('rental'),
      property.toBuffer(),
      tenant.toBuffer(),
    ],
    RENTAL_PROGRAM_ID
  );
  return rentalPDA;
}

// Helper to get escrow PDA
export async function getEscrowPDA(rentalAgreement: PublicKey) {
  const [escrowPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from('escrow'),
      rentalAgreement.toBuffer(),
    ],
    ESCROW_PROGRAM_ID
  );
  return escrowPDA;
}

// Create property listing
export async function createPropertyListing(
  connection: Connection,
  wallet: any,
  propertyData: {
    propertyId: number;
    rentAmount: number;
    depositAmount: number;
    leaseDuration: number;
    metadataUri: string;
  }
) {
  const propertyPDA = await getPropertyPDA(wallet.publicKey, propertyData.propertyId);

  // Build transaction manually since we don't have IDL yet
  const transaction = new web3.Transaction();

  // For demo, we'll just return the PDA that would be created
  return {
    propertyPDA,
    signature: 'DEMO_MODE',
  };
}

// Pay rent
export async function payRent(
  connection: Connection,
  wallet: any,
  propertyPDA: PublicKey,
  landlord: PublicKey
) {
  const rentalPDA = await getRentalAgreementPDA(propertyPDA, wallet.publicKey);

  // Get token accounts
  const tenantTokenAccount = await getAssociatedTokenAddress(
    SOL_MINT,
    wallet.publicKey
  );

  const landlordTokenAccount = await getAssociatedTokenAddress(
    SOL_MINT,
    landlord
  );

  // For demo, return PDAs
  return {
    rentalPDA,
    signature: 'DEMO_MODE',
  };
}

// Deposit to escrow
export async function depositToEscrow(
  connection: Connection,
  wallet: any,
  rentalPDA: PublicKey,
  landlord: PublicKey,
  amount: number
) {
  const escrowPDA = await getEscrowPDA(rentalPDA);

  // Get token accounts
  const tenantTokenAccount = await getAssociatedTokenAddress(
    SOL_MINT,
    wallet.publicKey
  );

  const escrowTokenAccount = await getAssociatedTokenAddress(
    SOL_MINT,
    escrowPDA,
    true // allow PDA owner
  );

  // For demo, return PDAs
  return {
    escrowPDA,
    signature: 'DEMO_MODE',
  };
}
