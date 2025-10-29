'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { createRentalAndDeposit, getExplorerUrl } from '@/lib/program-utils';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string>('');

  // Mock property data with realistic USD-equivalent costs
  // In production, this would be fetched from blockchain
  const property = {
    id: Number(params.id),
    address: params.id === '1' ? '123 Rue de Rivoli' : params.id === '2' ? '456 Avenue des Champs-Élysées' : '789 Boulevard Saint-Germain',
    city: 'Paris',
    country: 'France',
    bedrooms: params.id === '1' ? 2 : params.id === '2' ? 3 : 1,
    bathrooms: params.id === '1' ? 1 : params.id === '2' ? 2 : 1,
    sqft: params.id === '1' ? 850 : params.id === '2' ? 1200 : 600,
    rent: params.id === '1' ? 0.1 : params.id === '2' ? 0.15 : 0.08,
    deposit: params.id === '1' ? 0.2 : params.id === '2' ? 0.3 : 0.15,
    duration: 12,
    description: 'Beautiful apartment in the heart of Paris, close to all amenities. Fully furnished with modern appliances and stunning city views.',
    amenities: ['WiFi', 'Parking', 'Elevator', 'Balcony', 'Heating'],
    available: true,
    // Mock landlord address - in production, fetch from property account
    landlord: new PublicKey('BdM5cC9ZDv5dtTWFf1Lqc5t9Cn4q1H6jaMiJ5vuujyTU'),
  };

  const handleApply = async () => {
    if (!connected || !publicKey || !wallet) {
      alert('Please connect your wallet first');
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

      // Create rental agreement and deposit to escrow
      const signature = await createRentalAndDeposit(
        provider,
        property.landlord,
        property.id,
        property.rent,
        property.deposit,
        property.duration
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

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Property Image */}
          <div className="h-96 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
            {property.city} Property
          </div>

          <div className="p-8">
            {/* Property Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{property.address}</h1>
              <p className="text-lg text-gray-600">
                {property.city}, {property.country}
              </p>
            </div>

            {/* Property Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Property Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bedrooms:</span>
                    <span className="font-semibold">{property.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bathrooms:</span>
                    <span className="font-semibold">{property.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Square Feet:</span>
                    <span className="font-semibold">{property.sqft} sqft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lease Duration:</span>
                    <span className="font-semibold">{property.duration} months</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Rental Terms</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-semibold text-blue-600">{property.rent} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit:</span>
                    <span className="font-semibold text-blue-600">{property.deposit} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Due at Signing:</span>
                    <span className="font-semibold text-blue-600">
                      {property.rent + property.deposit} SOL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600">
                      {property.available ? 'Available' : 'Rented'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            {property.available && (
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
                    ? `Apply for Rental (${property.deposit} SOL Deposit)`
                    : 'Connect Wallet to Apply'}
                </button>
                {connected && publicKey && (
                  <p className="text-sm text-gray-600 text-center mt-4">
                    Connected: {publicKey.toString().slice(0, 8)}...
                    {publicKey.toString().slice(-8)}
                  </p>
                )}
                <p className="text-xs text-gray-500 text-center mt-2">
                  This will create a rental agreement on-chain and deposit {property.deposit} SOL to escrow
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
