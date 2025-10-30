import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  PROPERTY_PROGRAM_ID,
  RENTAL_PROGRAM_ID,
  ESCROW_PROGRAM_ID,
  SOL_DECIMALS,
  USDC_DECIMALS
} from './constants';

// IDL types (simplified - in production you'd import from target/types)
const PROPERTY_IDL = {
  version: "0.1.0",
  name: "property_registry",
  instructions: [
    {
      name: "createListing",
      accounts: [
        { name: "property", isMut: true, isSigner: false },
        { name: "landlord", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "propertyId", type: "u64" },
        { name: "rentAmount", type: "u64" },
        { name: "depositAmount", type: "u64" },
        { name: "leaseDuration", type: "i64" },
        { name: "metadataUri", type: "string" },
      ],
    },
    {
      name: "deactivateListing",
      accounts: [
        { name: "property", isMut: true, isSigner: false },
        { name: "landlord", isMut: false, isSigner: true },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Property",
      type: {
        kind: "struct",
        fields: [
          { name: "landlord", type: "publicKey" },
          { name: "propertyId", type: "u64" },
          { name: "rentAmount", type: "u64" },
          { name: "depositAmount", type: "u64" },
          { name: "leaseDuration", type: "i64" },
          { name: "isAvailable", type: "bool" },
          { name: "isVerified", type: "bool" },
          { name: "verificationLevel", type: "u8" },
          { name: "metadataUri", type: "string" },
          { name: "documentHash", type: "string" },
          { name: "totalRentals", type: "u32" },
          { name: "successfulRentals", type: "u32" },
          { name: "bump", type: "u8" },
          { name: "createdAt", type: "i64" },
        ],
      },
    },
  ],
};

const RENTAL_IDL = {
  version: "0.1.0",
  name: "rental_agreement",
  instructions: [
    {
      name: "createLease",
      accounts: [
        { name: "rentalAgreement", isMut: true, isSigner: false },
        { name: "property", isMut: false, isSigner: false },
        { name: "landlord", isMut: false, isSigner: false },
        { name: "tenant", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "rentAmount", type: "u64" },
        { name: "depositAmount", type: "u64" },
        { name: "leaseDuration", type: "i64" },
      ],
    },
    {
      name: "payRent",
      accounts: [
        { name: "rentalAgreement", isMut: true, isSigner: false },
        { name: "landlord", isMut: true, isSigner: false },
        { name: "tenant", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
  ],
};

const ESCROW_IDL = {
  version: "0.1.0",
  name: "escrow",
  instructions: [
    {
      name: "depositToEscrow",
      accounts: [
        { name: "escrow", isMut: true, isSigner: false },
        { name: "rentalAgreement", isMut: false, isSigner: false },
        { name: "tenant", isMut: true, isSigner: true },
        { name: "landlord", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "amount", type: "u64" },
      ],
    },
  ],
};

/**
 * Get PDA for property account
 */
export function getPropertyPDA(landlord: PublicKey, propertyId: number): [PublicKey, number] {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("property"),
      landlord.toBuffer(),
      new BN(propertyId).toArrayLike(Buffer, "le", 8),
    ],
    PROPERTY_PROGRAM_ID
  );
  return [pda, bump];
}

/**
 * Get PDA for rental agreement
 */
export function getRentalAgreementPDA(property: PublicKey, tenant: PublicKey): [PublicKey, number] {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("rental"),
      property.toBuffer(),
      tenant.toBuffer(),
    ],
    RENTAL_PROGRAM_ID
  );
  return [pda, bump];
}

/**
 * Get PDA for escrow account
 */
export function getEscrowPDA(rentalAgreement: PublicKey): [PublicKey, number] {
  const [pda, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      rentalAgreement.toBuffer(),
    ],
    ESCROW_PROGRAM_ID
  );
  return [pda, bump];
}

/**
 * Create a property listing
 */
export async function createProperty(
  provider: AnchorProvider,
  propertyId: number,
  rentAmount: number,
  depositAmount: number,
  leaseDuration: number,
  metadataUri: string
): Promise<string> {
  const program = new Program(PROPERTY_IDL as any, PROPERTY_PROGRAM_ID, provider);

  const [propertyPDA] = getPropertyPDA(provider.wallet.publicKey, propertyId);

  const tx = await program.methods
    .createListing(
      new BN(propertyId),
      new BN(rentAmount * Math.pow(10, USDC_DECIMALS)), // Convert to USDC smallest units (6 decimals)
      new BN(depositAmount * Math.pow(10, USDC_DECIMALS)), // Convert to USDC smallest units (6 decimals)
      new BN(leaseDuration),
      metadataUri
    )
    .accounts({
      property: propertyPDA,
      landlord: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

/**
 * Create rental agreement and deposit to escrow
 */
export async function createRentalAndDeposit(
  provider: AnchorProvider,
  landlord: PublicKey,
  propertyId: number,
  rentAmount: number,
  depositAmount: number,
  leaseDuration: number
): Promise<string> {
  const tenant = provider.wallet.publicKey;

  // Get property PDA
  const [propertyPDA] = getPropertyPDA(landlord, propertyId);

  // Get rental and escrow PDAs
  const [rentalPDA] = getRentalAgreementPDA(propertyPDA, tenant);
  const [escrowPDA] = getEscrowPDA(rentalPDA);

  const currentTime = Math.floor(Date.now() / 1000);
  const endDate = currentTime + (leaseDuration * 30 * 24 * 60 * 60); // Convert months to seconds

  // Create rental agreement
  const rentalProgram = new Program(
    RENTAL_IDL as any,
    RENTAL_PROGRAM_ID,
    provider
  );

  const rentalTx = await rentalProgram.methods
    .createLease(
      new BN(rentAmount * Math.pow(10, USDC_DECIMALS)), // Convert to USDC smallest units (6 decimals)
      new BN(depositAmount * Math.pow(10, USDC_DECIMALS)), // Convert to USDC smallest units (6 decimals)
      new BN(leaseDuration * 30 * 24 * 60 * 60) // Convert months to seconds
    )
    .accounts({
      rentalAgreement: rentalPDA,
      property: propertyPDA,
      landlord: landlord,
      tenant: tenant,
      propertyProgram: PROPERTY_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  // Deposit USDC to escrow
  const escrowProgram = new Program(
    ESCROW_IDL as any,
    ESCROW_PROGRAM_ID,
    provider
  );

  const depositTx = await escrowProgram.methods
    .depositToEscrow(
      new BN(depositAmount * Math.pow(10, USDC_DECIMALS)) // Convert to USDC smallest units (6 decimals)
    )
    .accounts({
      escrow: escrowPDA,
      rentalAgreement: rentalPDA,
      tenant: tenant,
      landlord: landlord,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return depositTx;
}

/**
 * Pay monthly rent
 */
export async function payRent(
  provider: AnchorProvider,
  landlord: PublicKey,
  propertyId: number
): Promise<string> {
  const tenant = provider.wallet.publicKey;

  // Get property PDA first
  const [propertyPDA] = getPropertyPDA(landlord, propertyId);
  const [rentalPDA] = getRentalAgreementPDA(propertyPDA, tenant);

  const program = new Program(RENTAL_IDL as any, RENTAL_PROGRAM_ID, provider);

  const tx = await program.methods
    .payRent()
    .accounts({
      rentalAgreement: rentalPDA,
      landlord: landlord,
      tenant: tenant,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

/**
 * Fetch all properties from a landlord
 */
export async function fetchLandlordProperties(
  connection: Connection,
  landlord: PublicKey
): Promise<any[]> {
  const program = new Program(PROPERTY_IDL as any, PROPERTY_PROGRAM_ID, {
    connection,
  } as any);

  const properties = await program.account.property.all([
    {
      memcmp: {
        offset: 8, // After discriminator (8 bytes)
        bytes: landlord.toBase58(),
      },
    },
  ]);

  // Only return active properties
  return properties;
}

/**
 * Fetch all rental agreements for a tenant
 */
export async function fetchTenantRentals(
  connection: Connection,
  tenant: PublicKey
): Promise<any[]> {
  const program = new Program(RENTAL_IDL as any, RENTAL_PROGRAM_ID, {
    connection,
  } as any);

  const rentals = await program.account.rentalAgreement.all([
    {
      memcmp: {
        offset: 8, // After discriminator
        bytes: tenant.toBase58(),
      },
    },
  ]);

  return rentals;
}

/**
 * Deactivate a property listing
 */
export async function deactivateProperty(
  provider: AnchorProvider,
  propertyPDA: PublicKey
): Promise<string> {
  const program = new Program(PROPERTY_IDL as any, PROPERTY_PROGRAM_ID, provider);

  const tx = await program.methods
    .deactivateListing()
    .accounts({
      property: propertyPDA,
      landlord: provider.wallet.publicKey,
    })
    .rpc();

  return tx;
}

/**
 * Get Solana Explorer URL for a transaction
 */
export function getExplorerUrl(signature: string, cluster: string = 'devnet'): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}
