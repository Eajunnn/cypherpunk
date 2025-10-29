'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@coral-xyz/anchor';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchTenantRentals, payRent, getExplorerUrl } from '@/lib/program-utils';

export default function TenantPage() {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string>('');
  const [loadingRentals, setLoadingRentals] = useState(true);

  // Fetch rental agreements when wallet connects
  useEffect(() => {
    async function loadRentals() {
      if (!connected || !publicKey) {
        setLoadingRentals(false);
        return;
      }

      try {
        setLoadingRentals(true);
        const tenantRentals = await fetchTenantRentals(connection, publicKey);
        setRentals(tenantRentals);
      } catch (error) {
        console.error('Error fetching rentals:', error);
      } finally {
        setLoadingRentals(false);
      }
    }

    loadRentals();
  }, [connected, publicKey, connection]);

  const handlePayRent = async (rental: any) => {
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

      const signature = await payRent(
        provider,
        rental.account.landlord,
        rental.account.propertyId
      );

      setTxSignature(signature);

      alert(
        `Rent payment successful!\n\n` +
        `Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}\n\n` +
        `View on Solana Explorer:\n${getExplorerUrl(signature)}`
      );

      // Refresh rentals
      const tenantRentals = await fetchTenantRentals(connection, publicKey);
      setRentals(tenantRentals);
    } catch (error: any) {
      console.error('Error paying rent:', error);
      alert(`Failed to pay rent: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Tenant Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to access the tenant dashboard
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tenant Dashboard</h1>
          <p className="text-lg text-gray-600">
            Manage your rental agreements and payments
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
          </p>
        </div>

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
        {loadingRentals && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-8">
            <p className="text-gray-600">Loading your rental agreements...</p>
          </div>
        )}

        {/* No Rentals State */}
        {!loadingRentals && rentals.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">No Active Rentals</h2>
            <p className="text-gray-600 mb-6">
              You don't have any active rental agreements yet.
            </p>
            <Link
              href="/properties"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Browse Properties
            </Link>
          </div>
        )}

        {/* Active Rentals */}
        {!loadingRentals && rentals.map((rental, index) => {
          const rentAmount = Number(rental.account.rentAmount) / Math.pow(10, 9);
          const depositAmount = Number(rental.account.depositAmount) / Math.pow(10, 9);
          const startDate = new Date(Number(rental.account.startDate) * 1000);
          const endDate = new Date(Number(rental.account.endDate) * 1000);
          const lastPayment = rental.account.lastPaymentDate
            ? new Date(Number(rental.account.lastPaymentDate) * 1000)
            : startDate;

          return (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Rental Agreement #{rental.account.propertyId.toString()}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  rental.account.isActive
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {rental.account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Property Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property ID:</span>
                      <span className="font-mono">{rental.account.propertyId.toString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Landlord:</span>
                      <span className="font-mono text-xs">
                        {rental.account.landlord.toString().slice(0, 8)}...
                        {rental.account.landlord.toString().slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-semibold text-blue-600">{rentAmount} SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit:</span>
                      <span className="font-semibold">{depositAmount} SOL</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Lease Period</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span>{startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span>{endDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Payment:</span>
                      <span>{lastPayment.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payments Made:</span>
                      <span className="font-semibold">{rental.account.paymentCount.toString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePayRent(rental)}
                    disabled={loading || !rental.account.isActive}
                    className={`flex-1 py-2 rounded-lg font-semibold ${
                      loading || !rental.account.isActive
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Processing...' : `Pay Rent (${rentAmount} SOL)`}
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/${rental.publicKey.toString()}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-semibold text-center"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>

              {/* Deposit Status */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Security Deposit in Escrow</p>
                    <p className="text-2xl font-bold text-blue-600">{depositAmount} SOL</p>
                  </div>
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm font-semibold">
                    Protected
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Browse More Properties */}
        {!loadingRentals && (
          <div className="mt-8 text-center">
            <Link
              href="/properties"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Browse More Properties →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
