"use client";
import Link from "next/link";
import Building3D from "../components/Building3D";

import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a1930] via-[#0f28          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );o-[#1a3c6d]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHpNMjQgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          {/* 3D Building Component */}
          <div className="mb-16">
            <Building3D />
          </div>
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/10">
              🚀 Built on Solana • Powered by USDC
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight font-display">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-purple-400">
                RentChain
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-200/80 leading-relaxed">
              Transparent, automated rental agreements on Solana with stablecoin
              payments.
              <br className="hidden md:block" />
              Say goodbye to disputes and delayed payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/properties"
                className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold tracking-tight text-white bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative flex items-center text-lg gap-3">
                  <span>Explore Properties</span>
                  <svg
                    className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>
              <Link
                href="/landlord"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                List Your Property
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to rent or list property on the blockchain
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-800 transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-3xl">🏠</span>
              </div>
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-3">
                STEP 1
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                List Property
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Landlords create on-chain property listings with rent amount,
                deposit, and lease terms in seconds.
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-gray-800 dark:hover:to-gray-800 transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-3xl">💰</span>
              </div>
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-3">
                STEP 2
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Pay with USDC
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Tenants pay security deposit and monthly rent automatically
                using USDC stablecoin.
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-800 transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-3xl">🔒</span>
              </div>
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-3">
                STEP 3
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Trustless Escrow
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Security deposits held in smart contract escrow, automatically
                released at lease end.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why RentChain?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Built for landlords and tenants who value transparency
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-blue-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👨‍💼</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  For Landlords
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Automated monthly rent collection with zero friction
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Transparent on-chain lease agreements
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    No payment processing fees
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Instant global payments via Solana
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-purple-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏡</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  For Tenants
                </h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Trustless security deposit in smart contract escrow
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Automatic deposit return at lease end
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    No hidden fees or surprises
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl flex-shrink-0">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    100% transparent lease terms on-chain
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-black text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHpNMjQgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100">
            Connect your wallet and explore rental properties on Solana devnet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="group bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center gap-2 dark:bg-blue-100 dark:text-blue-900 dark:hover:bg-blue-200"
            >
              Explore Properties
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/landlord"
              className="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-bold hover:bg-white/20 transition-all border-2 border-white/30 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              List Your Property
            </Link>
          </div>
          <p className="mt-8 text-sm text-blue-200">
            🚀 Live on Solana Devnet • 100% Free Test Tokens
          </p>
        </div>
      </section>
    </div>
  );
}
