import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("RentChain Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  let landlord: Keypair;
  let tenant: Keypair;
  let propertyId: anchor.BN;

  before(async () => {
    landlord = Keypair.generate();
    tenant = Keypair.generate();
    propertyId = new anchor.BN(Date.now());

    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        landlord.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      )
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        tenant.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      )
    );
  });

  describe("Property Registry", () => {
    it("Creates a property listing", async () => {
      // Test will be implemented after deployment
      console.log("Property Registry test placeholder");
    });
  });

  describe("Rental Agreement", () => {
    it("Creates a lease agreement", async () => {
      // Test will be implemented after deployment
      console.log("Rental Agreement test placeholder");
    });
  });

  describe("Escrow", () => {
    it("Deposits to escrow", async () => {
      // Test will be implemented after deployment
      console.log("Escrow test placeholder");
    });
  });
});
