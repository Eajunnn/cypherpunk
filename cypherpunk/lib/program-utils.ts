import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  PROPERTY_PROGRAM_ID,
  RENTAL_PROGRAM_ID,
  ESCROW_PROGRAM_ID,
  SOL_DECIMALS,
  USDC_DECIMALS,
  USDC_MINT
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
          { name: "status", type: { defined: "PropertyStatus" } },
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
  types: [
    {
      name: "PropertyStatus",
      type: {
        kind: "enum",
        variants: [
          { name: "Available" },
          { name: "Rented" },
          { name: "Deactivated" },
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
      new BN(leaseDuration * 30 * 24 * 60 * 60), // Convert months to seconds
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

  // Create rental agreement
  const rentalProgram = new Program(
    RENTAL_IDL as any,
    RENTAL_PROGRAM_ID,
    provider
  );

  await rentalProgram.methods
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

  // Get token accounts
  const tenantATA = await getAssociatedTokenAddress(USDC_MINT, tenant);
  const escrowATA = await getAssociatedTokenAddress(USDC_MINT, escrowPDA, true); // true for PDA allowed

  // Create ATAs if they don't exist
  const tenantATAInfo = await provider.connection.getAccountInfo(tenantATA);
  const escrowATAInfo = await provider.connection.getAccountInfo(escrowATA);

  const preInstructions = [];

  if (!tenantATAInfo) {
    console.log('Creating tenant ATA for USDC...');
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        tenant, // payer
        tenantATA, // ata
        tenant, // owner
        USDC_MINT, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  if (!escrowATAInfo) {
    console.log('Creating escrow ATA for USDC...');
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        tenant, // payer
        escrowATA, // ata
        escrowPDA, // owner (PDA)
        USDC_MINT, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  const depositTx = await escrowProgram.methods
    .depositToEscrow(
      new BN(depositAmount * Math.pow(10, USDC_DECIMALS)) // Convert to USDC smallest units (6 decimals)
    )
    .accounts({
      escrow: escrowPDA,
      rentalAgreement: rentalPDA,
      tenant: tenant,
      landlord: landlord,
      tenantTokenAccount: tenantATA,
      escrowTokenAccount: escrowATA,
      tokenMint: USDC_MINT,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .preInstructions(preInstructions)
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
  try {
    console.log('Fetching property accounts...');
    const accounts = await connection.getProgramAccounts(PROPERTY_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: landlord.toBase58(),
          },
        },
      ],
    });

    console.log(`Found ${accounts.length} raw accounts, decoding...`);
    
    type PropertyAccount = {
      publicKey: PublicKey;
      account: any;
    };

    const decodedProperties = accounts.map(({ pubkey, account }): PropertyAccount | null => {
      try {
        // Start after the discriminator (8 bytes)
        const dataReader = account.data.slice(8);
        const landlordPubkey = new PublicKey(dataReader.slice(0, 32));
        const propertyId = new BN(dataReader.slice(32, 40), 'le');
        const rentAmount = new BN(dataReader.slice(40, 48), 'le');
        const depositAmount = new BN(dataReader.slice(48, 56), 'le');
        const leaseDuration = new BN(dataReader.slice(56, 64), 'le');
        
        // Read the status (1 byte) - default to Available if not present
        let status: any = { Available: {} };
        let offset = 64;
        
        try {
          const statusByte = dataReader[offset];
          if (statusByte === 0) status = { Available: {} };
          else if (statusByte === 1) status = { Rented: {} };
          else if (statusByte === 2) status = { Deactivated: {} };
          offset++;
        } catch (e) {
          // If can't read status, keep default Available
          console.log('Using default status for older account format');
        }

        // Boolean flags
        const isAvailable = dataReader[offset] === 1;
        const isVerified = dataReader[offset + 1] === 1;
        const verificationLevel = dataReader[offset + 2];

        // For strings, look for null terminator
        let metadataUri = '';
        let documentHash = '';
        
        try {
          // Read next 200 bytes for metadataUri
          const metadataBytes = dataReader.slice(offset + 3, offset + 203);
          const nullIndex = metadataBytes.indexOf(0);
          metadataUri = metadataBytes.slice(0, nullIndex >= 0 ? nullIndex : 200).toString('utf8');
          
          // Read next 100 bytes for documentHash
          const hashBytes = dataReader.slice(offset + 203, offset + 303);
          const hashNullIndex = hashBytes.indexOf(0);
          documentHash = hashBytes.slice(0, hashNullIndex >= 0 ? hashNullIndex : 100).toString('utf8');
        } catch (e) {
          console.log('Error reading strings, using defaults');
        }

        // Attempt to read remaining fields from newer account format
        let totalRentals = 0;
        let successfulRentals = 0;
        let bump = 0;
        let createdAt = new BN(0);

        try {
          offset += 303; // After strings
          if (offset + 13 <= dataReader.length) {
            totalRentals = dataReader.readUInt32LE(offset);
            successfulRentals = dataReader.readUInt32LE(offset + 4);
            bump = dataReader[offset + 8];
            createdAt = new BN(dataReader.slice(offset + 9, offset + 17), 'le');
          }
        } catch (e) {
          console.log('Using defaults for optional fields');
        }

        const decoded = {
          landlord: landlordPubkey,
          propertyId,
          rentAmount,
          depositAmount,
          leaseDuration,
          status,
          isAvailable,
          isVerified,
          verificationLevel,
          metadataUri,
          documentHash,
          totalRentals,
          successfulRentals,
          bump,
          createdAt,
        };

        console.log(`Successfully decoded property ${pubkey.toBase58()}`);
        return {
          publicKey: pubkey,
          account: decoded,
        };
      } catch (err) {
        console.error(`Failed to decode property ${pubkey.toBase58()}:`, err);
        return null;
      }
    });

    // Filter out failed decodings and return
    const validProperties = decodedProperties.filter((p): p is PropertyAccount => p !== null);
    console.log(`Successfully decoded ${validProperties.length} properties`);
    return validProperties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

/**
 * Fetch all rental agreements for a tenant
 */
export async function fetchTenantRentals(
  connection: Connection,
  tenant: PublicKey
): Promise<any[]> {
  try {
    const program = new Program(RENTAL_IDL as any, RENTAL_PROGRAM_ID, {
      connection,
    } as any);

    // Check if the account method exists
    if (!program.account || !program.account.rentalAgreement) {
      return [];
    }

    const rentals = await program.account.rentalAgreement.all([
      {
        memcmp: {
          offset: 8, // After discriminator
          bytes: tenant.toBase58(),
        },
      },
    ]);

    return rentals;
  } catch (error) {
    console.error('Error fetching tenant rentals:', error);
    return [];
  }
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
