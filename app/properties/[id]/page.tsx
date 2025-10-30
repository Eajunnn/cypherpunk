'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { createRentalAndDeposit, getExplorerUrl } from '@/lib/program-utils';
import { PROPERTY_PROGRAM_ID } from '@/lib/constants';

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

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [txSignature, setTxSignature] = useState<string>('');
  const [property, setProperty] = useState<any>(null);
  const [propertyPubkey, setPropertyPubkey] = useState<PublicKey | null>(null);

  // Fetch property from blockchain
  useEffect(() => {
    async function fetchProperty() {
      try {
        setFetchLoading(true);
        const propertyKey = new PublicKey(params.id as string);
        setPropertyPubkey(propertyKey);

        const program = new Program(PROPERTY_IDL as any, PROPERTY_PROGRAM_ID, {
          connection,
        } as any);

        const propertyAccount = await program.account.property.fetch(propertyKey);
        console.log('Fetched property:', propertyAccount);
        setProperty(propertyAccount);
      } catch (error) {
        console.error('Error fetching property:', error);
        alert('Failed to fetch property from blockchain. Invalid property ID or property does not exist.');
      } finally {
        setFetchLoading(false);
      }
    }

    if (params.id) {
      fetchProperty();
    }
  }, [params.id, connection]);

  const handleApply = async () => {
    if (!connected || !publicKey || !wallet) {
      alert('Please connect your wallet first');
      return;
    }

    if (!property || !propertyPubkey) {
      alert('Property data not loaded');
      return;
    }

    setLoading(true);
    try {
      // Create Anchor provider
      const provider = new AnchorProvider(
        connection,
        wallet.adapter as any,
        { commitment: 'confirmed' }
      );

      // Convert amounts from USDC smallest units to human-readable (6 decimals)
      const rentInUSDC = property.rentAmount.toNumber() / 1_000_000;
      const depositInUSDC = property.depositAmount.toNumber() / 1_000_000;
      const durationInMonths = Math.ceil(property.leaseDuration.toNumber() / (30 * 24 * 60 * 60));
      
      // Validate lease duration
      if (durationInMonths <= 0) {
        throw new Error('Invalid lease duration: must be greater than 0 months');
      }

      // Create rental agreement and deposit to escrow
      const signature = await createRentalAndDeposit(
        provider,
        property.landlord,
        property.propertyId.toNumber(),
        rentInUSDC,
        depositInUSDC,
        durationInMonths
      );

      setTxSignature(signature);

      alert(
        `Rental agreement created!\n\n` +
        `Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}\n\n` +
        `View on Solana Explorer:\n${getExplorerUrl(signature)}`
      );

      // Redirect to tenant dashboard
      setTimeout(() => router.push('/tenant'), 2000);
    } catch (error: any) {
      console.error('Error applying for property:', error);
      alert(`Failed to submit application: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // Parse metadata
  let metadata: any = {};
  let rentAmount = 0;
  let depositAmount = 0;
  let durationMonths = 0;

  if (property) {
    try {
      metadata = JSON.parse(property.metadataUri);
    } catch (e) {
      console.error('Failed to parse metadata:', e);
      metadata = { address: 'Unknown', city: 'Unknown', country: 'Unknown', description: 'No description available' };
    }
    rentAmount = property.rentAmount.toNumber() / 1_000_000;
    depositAmount = property.depositAmount.toNumber() / 1_000_000;
    durationMonths = Math.floor(property.leaseDuration.toNumber() / (30 * 24 * 60 * 60));
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Back to Properties
        </button>

        {/* Loading State */}
        {fetchLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading property from blockchain...</p>
          </div>
        )}

        {/* Error State */}
        {!fetchLoading && !property && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Property not found</p>
          </div>
        )}

        {/* Property Details */}
        {!fetchLoading && property && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Property Image */}
            <div className="h-96 relative">
              {metadata.image ? (
                <img
                  src={metadata.image}
                  alt={metadata.address || 'Property'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
                  {metadata.city || 'Property'}
                </div>
              )}
              {property.isVerified && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <span>✓</span>
                  <span>Verified Level {property.verificationLevel}</span>
                </div>
              )}
            </div>

            <div className="p-8">
              {/* Property Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{metadata.address || 'Property Address'}</h1>
                <p className="text-lg text-gray-900">
                  {metadata.city || 'Unknown'}, {metadata.country || 'Unknown'}
                </p>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Property Owner:</p>
                  <p className="text-sm font-mono text-gray-800">{property.landlord.toString()}</p>
                </div>
                {property.documentHash && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <span className="text-gray-600">Document Hash: </span>
                    <span className="font-mono text-blue-600">{property.documentHash}</span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Property Details</h2>
                  <div className="space-y-2">
                    {metadata.bedrooms && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bedrooms:</span>
                        <span className="font-semibold">{metadata.bedrooms}</span>
                      </div>
                    )}
                    {metadata.bathrooms && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bathrooms:</span>
                        <span className="font-semibold">{metadata.bathrooms}</span>
                      </div>
                    )}
                    {metadata.sqft && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Square Feet:</span>
                        <span className="font-semibold">{metadata.sqft} sqft</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lease Duration:</span>
                      <span className="font-semibold">{durationMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Rentals:</span>
                      <span className="font-semibold">{property.totalRentals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Successful Rentals:</span>
                      <span className="font-semibold text-green-600">{property.successfulRentals}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Rental Terms</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">Monthly Rent:</span>
                      <span className="font-semibold text-gray-900">{rentAmount.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">Security Deposit:</span>
                      <span className="font-semibold text-gray-900">{depositAmount.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">Total Due at Signing:</span>
                      <span className="font-semibold text-gray-900">
                        {(rentAmount + depositAmount).toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-medium">Status:</span>
                      <span className={`font-semibold ${property.isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                        {property.isAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-600">{metadata.description || 'No description available'}</p>
              </div>

              {/* Amenities */}
              {metadata.amenities && metadata.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {metadata.amenities.map((amenity: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              {property.isAvailable && (
                <div className="border-t pt-6">
                  {txSignature && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Transaction Successful!</h3>
                      <p className="text-sm text-green-700 mb-2">
                        Signature: {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
                      </p>
                      <a
                        href={getExplorerUrl(txSignature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View on Solana Explorer →
                      </a>
                    </div>
                  )}
                  <button
                    onClick={handleApply}
                    disabled={loading || !connected}
                    className={`w-full py-3 rounded-lg font-semibold ${
                      loading || !connected
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading
                      ? 'Processing Blockchain Transaction...'
                      : connected
                      ? `Apply for Rental (${depositAmount.toFixed(2)} USDC Deposit)`
                      : 'Connect Wallet to Apply'}
                  </button>
                  {connected && publicKey && (
                    <p className="text-sm text-gray-600 text-center mt-4">
                      Connected: {publicKey.toString().slice(0, 8)}...
                      {publicKey.toString().slice(-8)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 text-center mt-2">
                    This will create a rental agreement on-chain and deposit {depositAmount.toFixed(2)} USDC to escrow.
                    Payment will go to the property owner: {property.landlord.toString().slice(0, 8)}...{property.landlord.toString().slice(-8)}
                  </p>
                </div>
              )}

              {!property.isAvailable && (
                <div className="border-t pt-6">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <p className="text-red-700 font-semibold">This property is currently not available for rent</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
