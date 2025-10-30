"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  createProperty,
  fetchLandlordProperties,
  getExplorerUrl,
  deactivateProperty,
} from "@/lib/program-utils";
import ImageUploader from "@/components/ImageUploader";

import Footer from '@/components/Footer';

export default function LandlordPage() {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [txSignature, setTxSignature] = useState<string>("");
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    country: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    rent: "",
    deposit: "",
    duration: "12",
    description: "",
    image: null as File | null,
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
        const landlordProperties = await fetchLandlordProperties(
          connection,
          publicKey
        );
        setProperties(landlordProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoadingProperties(false);
      }
    }

    loadProperties();
  }, [connected, publicKey, connection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey || !wallet) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const provider = new AnchorProvider(connection, wallet.adapter as any, {
        commitment: "confirmed",
      });

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
      const landlordProperties = await fetchLandlordProperties(
        connection,
        publicKey
      );
      setProperties(landlordProperties);

      setShowCreateForm(false);
      setFormData({
        address: "",
        city: "",
        country: "",
        bedrooms: "",
        bathrooms: "",
        sqft: "",
        rent: "",
        deposit: "",
        duration: "12",
        description: "",
        image: null,
      });
    } catch (error: any) {
      console.error("Error creating property:", error);
      alert(`Failed to create property: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (propertyPubkey: string) => {
    if (!connected || !wallet) {
      alert("Please connect your wallet");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to deactivate this property listing? It will no longer be visible to tenants."
      )
    ) {
      return;
    }

    try {
      const provider = new AnchorProvider(connection, wallet.adapter as any, {
        commitment: "confirmed",
      });

      const signature = await deactivateProperty(
        provider,
        new PublicKey(propertyPubkey)
      );

      // Refresh the properties list after deactivation
      const updatedProperties = await fetchLandlordProperties(
        connection,
        provider.wallet.publicKey
      );
      setProperties(updatedProperties);

      alert(
        `Property deactivated successfully!\n\n` +
          `Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}\n\n` +
          `View on Solana Explorer:\n${getExplorerUrl(signature)}`
      );

      // Refresh properties
      if (publicKey) {
        const landlordProperties = await fetchLandlordProperties(
          connection,
          publicKey
        );
        setProperties(landlordProperties);
      }
    } catch (error: any) {
      console.error("Error deactivating property:", error);
      alert(
        `Failed to deactivate property: ${error.message || error.toString()}`
      );
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-blue-950 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 dark:text-blue-100 rounded-lg shadow-lg p-12 text-center">
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a1930] via-[#0f2847] to-[#1a3c6d] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Landlord Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your properties and rental agreements
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Connected: {publicKey?.toString().slice(0, 8)}...
            {publicKey?.toString().slice(-8)}
          </p>
        </div>

        {/* Create Property Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100 font-semibold"
          >
            {showCreateForm ? "Cancel" : "+ List New Property"}
          </button>
        </div>

        {/* Create Property Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-900 dark:text-blue-100 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Create Property Listing</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    value={formData.sqft}
                    onChange={(e) =>
                      setFormData({ ...formData, sqft: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Monthly Rent (USDC)
                  </label>
                  <input
                    type="number"
                    value={formData.rent}
                    onChange={(e) =>
                      setFormData({ ...formData, rent: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Security Deposit (USDC)
                  </label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) =>
                      setFormData({ ...formData, deposit: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lease Duration (months)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Images
                </label>
                <ImageUploader
                  onImageUpload={(file) => setFormData({ ...formData, image: file })}
                  onImageRemove={() => setFormData({ ...formData, image: null })}
                  previewUrl={formData.image ? URL.createObjectURL(formData.image) : undefined}
                  className="mb-4"
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/60 dark:border-green-800">
            <h3 className="font-semibold text-green-800 mb-2">
              Transaction Successful!
            </h3>
            <p className="text-sm text-green-700 mb-2">
              Signature: {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
            </p>
            <a
              href={getExplorerUrl(txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View on Solana Explorer →
            </a>
          </div>
        )}

        {/* Loading State */}
        {loadingProperties && (
          <div className="bg-white dark:bg-gray-900 dark:text-blue-100 rounded-lg shadow-lg p-12 text-center mb-8">
            <p className="text-gray-600">Loading your properties...</p>
          </div>
        )}

        {/* My Properties */}
        <div className="bg-white dark:bg-gray-900 dark:text-blue-100 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">My Properties</h2>

          {!loadingProperties && properties.length === 0 && (
            <p className="text-gray-600 text-center py-8">
              No properties listed yet. Create your first property listing
              above!
            </p>
          )}

          <div className="space-y-4">
            {!loadingProperties &&
              properties
                .filter((property: any) => property.account.isAvailable) // Only show active listings
                .map((property: any, index: number) => {
                const rentAmount = (
                  Number(property.account.rentAmount) / Math.pow(10, 6)
                ).toFixed(2);
                const depositAmount = (
                  Number(property.account.depositAmount) / Math.pow(10, 6)
                ).toFixed(2);
                const createdAt = new Date(
                  Number(property.account.createdAt) * 1000
                );

                let metadata: any = {};
                try {
                  metadata = JSON.parse(property.account.metadataUri);
                } catch (e) {
                  metadata = { address: "Property", city: "N/A" };
                }

                return (
                  <div
                    key={index}
                    className="border rounded-lg p-4 dark:bg-gray-800 dark:border-blue-900 dark:text-blue-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg dark:text-blue-100">
                          {metadata.address || "Property"}
                        </h3>
                        <p className="text-gray-600 dark:text-blue-200">
                          {metadata.city || "N/A"}
                        </p>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold mt-2">
                          {rentAmount} USDC/month
                        </p>
                        <p className="text-gray-500 dark:text-blue-300 text-sm">
                          Deposit: {depositAmount} USDC
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            property.account.isAvailable
                              ? "bg-green-100 text-green-600 dark:bg-green-900/70 dark:text-green-300"
                              : "bg-red-100 text-red-600 dark:bg-red-900/70 dark:text-red-300"
                          }`}
                        >
                          {property.account.isAvailable
                            ? "Available"
                            : "Deactivated"}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">
                          ID: {property.account.propertyId.toString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="border-t pt-3 mt-3 flex justify-between items-center">
                      <a
                        href={`https://explorer.solana.com/address/${property.publicKey.toString()}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View on Solana Explorer →
                      </a>
                      {property.account.isAvailable && (
                        <button
                          onClick={() =>
                            handleDeactivate(property.publicKey.toString())
                          }
                          className="px-4 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-600 transition"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
