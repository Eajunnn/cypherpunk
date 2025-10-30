"use client";

import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { PROPERTY_PROGRAM_ID } from "@/lib/constants";
import Link from "next/link";

const PROPERTY_IDL = {
  version: "0.1.0",
  name: "property_registry",
  instructions: [],
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

import PropertyCard from "@/components/PropertyCard";

import Footer from '@/components/Footer';

export default function PropertiesPage() {
  const { connection } = useConnection();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Fetch all properties from blockchain
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const program = new Program(PROPERTY_IDL as any, PROPERTY_PROGRAM_ID, {
          connection,
        } as any);

        // Fetch all property accounts
        const allProperties = await program.account.property.all();
        console.log("Fetched properties from blockchain:", allProperties);
        setProperties(allProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [connection]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a1930] via-[#0f2847] to-[#1a3c6d] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold font-display bg-gradient-to-r from-blue-400 via-primary to-purple-400 bg-clip-text text-transparent mb-6">
            Discover Properties
          </h1>
          <p className="text-xl text-blue-200/80 max-w-2xl mx-auto">
            Experience the future of real estate with blockchain-powered luxury rentals
          </p>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-md bg-white/5 p-6 rounded-2xl mb-12 border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.1)]">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`group px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
                filter === "all"
                  ? "bg-gradient-to-r from-blue-500 to-primary text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-primary-light"
                  : "bg-white/5 hover:bg-white/10 text-blue-200 hover:text-white"
              }`}
            >
              <span className="relative z-10">All Properties</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
            <button
              onClick={() => setFilter("available")}
              className={`group px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
                filter === "available"
                  ? "bg-gradient-to-r from-blue-500 to-primary text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-primary-light"
                  : "bg-white/5 hover:bg-white/10 text-blue-200 hover:text-white"
              }`}
            >
              <span className="relative z-10">Available Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            // Parse metadata from blockchain
            let metadata: any = {};
            try {
              metadata = JSON.parse(property.account.metadataUri);
            } catch (e) {
              console.error("Failed to parse metadata:", e);
              metadata = {
                address: "Unknown",
                city: "Unknown",
                country: "Unknown",
              };
            }

            // Convert from lamports to USDC (6 decimals for USDC)
            const rentAmount = (
              property.account.rentAmount.toNumber() / 1_000_000
            ).toFixed(2);
            const depositAmount = (
              property.account.depositAmount.toNumber() / 1_000_000
            ).toFixed(2);

            // Apply filter
            if (filter === "paris" && metadata.city?.toLowerCase() !== "paris")
              return null;
            if (filter === "available" && !property.account.isAvailable)
              return null;

            return (
              <PropertyCard
                key={property.publicKey.toString()}
                id={property.publicKey.toString()}
                title={metadata.address || `Luxury Property in ${metadata.city || 'Unknown'}`}
                location={`${metadata.city || 'Unknown'}, ${metadata.country || 'Unknown'}`}
                price={rentAmount}
                depositAmount={depositAmount}
                isVerified={property.account.isVerified}
                isAvailable={property.account.isAvailable}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-glass-card mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold text-text-primary mb-4">
              No Properties Listed Yet
            </h3>
            <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
              Be the first to list your property on our blockchain platform.
            </p>
            <Link
              href="/landlord"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              List Your Property
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-16 h-16 mb-6">
              <div className="w-full h-full border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
            <p className="text-text-primary text-xl font-display">
              Loading Properties...
            </p>
            <p className="text-text-secondary mt-2">
              Fetching data from the blockchain
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
