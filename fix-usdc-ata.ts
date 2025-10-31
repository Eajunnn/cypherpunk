import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';

const USDC_MINT = new PublicKey('CKVj1JMU7H6rqNdWg7miQyufc5GEXjeTSMbpW7h41sgJ');
const WRONG_ACCOUNT = new PublicKey('5QWLdDB7Xv44ghq34M4eCNWUX8FjPSv9QsccneVGMAHC');

async function main() {
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Load your wallet (update path if needed)
  const walletPath = process.env.HOME + '/.config/solana/id.json';
  const walletKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
  );

  console.log('Your wallet:', walletKeypair.publicKey.toBase58());

  // Get the correct ATA for USDC
  const correctATA = await getAssociatedTokenAddress(
    USDC_MINT,
    walletKeypair.publicKey,
    false, // not a PDA
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  console.log('\n=== USDC ATA Information ===');
  console.log('USDC Mint:', USDC_MINT.toBase58());
  console.log('Correct USDC ATA for your wallet:', correctATA.toBase58());
  console.log('Wrong account you were using:', WRONG_ACCOUNT.toBase58());

  // Check if the correct ATA exists
  const ataInfo = await connection.getAccountInfo(correctATA);

  if (!ataInfo) {
    console.log('\n❌ Your correct USDC ATA does not exist yet!');
    console.log('You need to create it first.');
    console.log('\nRun this command to create it:');
    console.log(`spl-token create-account ${USDC_MINT.toBase58()}`);
  } else {
    console.log('\n✅ Your correct USDC ATA exists!');

    // Check balance
    const accountData = await connection.getTokenAccountBalance(correctATA);
    console.log('Balance:', accountData.value.uiAmount, 'USDC');
  }

  // Check the wrong account
  console.log('\n=== Checking Wrong Account ===');
  const wrongAccountInfo = await connection.getAccountInfo(WRONG_ACCOUNT);

  if (wrongAccountInfo) {
    console.log('Owner:', wrongAccountInfo.owner.toBase58());

    if (wrongAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
      const wrongBalance = await connection.getTokenAccountBalance(WRONG_ACCOUNT);
      console.log('Balance:', wrongBalance.value.uiAmount, 'tokens');
      console.log('Mint:', wrongBalance.value.mint);
    } else {
      console.log('This is NOT a token account. It is owned by:', wrongAccountInfo.owner.toBase58());
    }
  } else {
    console.log('Account does not exist');
  }

  console.log('\n=== Next Steps ===');
  console.log('1. Create your correct USDC ATA:');
  console.log(`   spl-token create-account ${USDC_MINT.toBase58()}`);
  console.log('\n2. Get some devnet USDC:');
  console.log(`   spl-token mint ${USDC_MINT.toBase58()} 1000 ${correctATA.toBase58()}`);
  console.log('   (If you have mint authority)');
  console.log('\n   OR use a faucet/airdrop if available');
}

main().catch(console.error);
