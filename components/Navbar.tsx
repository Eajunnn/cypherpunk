'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                RentChain
              </span>
            </Link>
            <div className="hidden md:flex space-x-1">
              <Link
                href="/properties"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/properties')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Properties
              </Link>
              <Link
                href="/landlord"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/landlord')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Landlord
              </Link>
              <Link
                href="/tenant"
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive('/tenant')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Tenant
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-xs text-gray-500 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              Devnet
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
