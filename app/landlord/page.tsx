'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
import { createProperty, fetchLandlordProperties, getExplorerUrl } from '@/lib/program-utils';

export default function LandlordPage() {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [txSignature, setTxSignature] = useState<string>('');
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    country: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    rent: '',
    deposit: '',
    duration: '12',
    description: '',
  });

  // Fetch properties when wallet connects
  useEffect(() => {
    async function loadProperties() {
      if (!connected || !publicKey) {
        setLoadingProperties(false);
        return;
      }

      try {
        setLoadingProperties(true);
        const landlordProperties = await fetchLandlordProperties(connection, publicKey);
        setProperties(landlordProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoadingProperties(false);
      }
    }

    loadProperties();
  }, [connected, publicKey, connection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey || !wallet) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const provider = new AnchorProvider(
        connection,
        wallet.adapter as any,
        { commitment: 'confirmed' }
      );

      // Generate unique property ID based on current properties count
      const propertyId = properties.length + 1;

      const signature = await createProperty(
        provider,
        propertyId,
        Number(formData.rent),
        Number(formData.deposit),
        Number(formData.duration),
        JSON.stringify({
          address: formData.address,
          city: formData.city,
          country: formData.country,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          sqft: formData.sqft,
          description: formData.description,
        })
      );

      setTxSignature(signature);

      alert(
        `Property created successfully!\n\n` +
        `Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}\n\n` +
        `View on Solana Explorer:\n${getExplorerUrl(signature)}`
      );

      // Refresh properties
      const landlordProperties = await fetchLandlordProperties(connection, publicKey);
      setProperties(landlordProperties);

      setShowCreateForm(false);
      setFormData({
        address: '',
        city: '',
        country: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        rent: '',
        deposit: '',
        duration: '12',
        description: '',
      });
    } catch (error: any) {
      console.error('Error creating property:', error);
      alert(`Failed to create property: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Landlord Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to access the landlord dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Landlord Dashboard</h1>
          <p className="text-lg text-gray-600">
            Manage your properties and rental agreements
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
          </p>
        </div>

        {/* Create Property Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            {showCreateForm ? 'Cancel' : '+ List New Property'}
          </button>
        </div>

        {/* Create Property Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Create Property Listing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Square Feet</label>
                  <input
                    type="number"
                    value={formData.sqft}
                    onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Rent (SOL)</label>
                  <input
                    type="number"
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Security Deposit (SOL)</label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lease Duration (months)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Create Property Listing
              </button>
            </form>
          </div>
        )}

        {/* Transaction Success Banner */}
        {txSignature && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
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

        {/* Loading State */}
        {loadingProperties && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-8">
            <p className="text-gray-600">Loading your properties...</p>
          </div>
        )}

        {/* My Properties */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">My Properties</h2>

          {!loadingProperties && properties.length === 0 && (
            <p className="text-gray-600 text-center py-8">
              No properties listed yet. Create your first property listing above!
            </p>
          )}

          <div className="space-y-4">
            {!loadingProperties && properties.map((property: any, index: number) => {
              const rentAmount = Number(property.account.rentAmount) / Math.pow(10, 9);
              const depositAmount = Number(property.account.depositAmount) / Math.pow(10, 9);
              const createdAt = new Date(Number(property.account.createdAt) * 1000);

              let metadata: any = {};
              try {
                metadata = JSON.parse(property.account.metadataUri);
              } catch (e) {
                metadata = { address: 'Property', city: 'N/A' };
              }

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{metadata.address || 'Property'}</h3>
                      <p className="text-gray-600">{metadata.city || 'N/A'}</p>
                      <p className="text-blue-600 font-semibold mt-2">{rentAmount} SOL/month</p>
                      <p className="text-gray-500 text-sm">Deposit: {depositAmount} SOL</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          property.account.isAvailable
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {property.account.isAvailable ? 'Available' : 'Rented'}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        ID: {property.account.propertyId.toString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <a
                      href={`https://explorer.solana.com/address/${property.publicKey.toString()}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View on Solana Explorer →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
