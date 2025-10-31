"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`transition-all duration-300 sticky top-0 z-50 backdrop-blur-md border-b
        ${
          theme === "dark"
            ? "bg-black/30 border-white/10 shadow-lg shadow-black/20"
            : "bg-white/20 border-black/5 shadow-lg shadow-black/5"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div
                className={`${
                  theme === "dark"
                    ? "bg-gradient-to-br from-blue-700 to-gray-900"
                    : "bg-gradient-to-br from-blue-600 to-indigo-600"
                } w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span
                className={`text-2xl font-bold bg-gradient-to-r ${
                  theme === "dark"
                    ? "from-blue-200 to-white"
                    : "from-blue-600 to-indigo-600"
                } bg-clip-text text-transparent`}
              >
                RentChain
              </span>
            </Link>
            <div className="hidden md:flex space-x-1">
              <Link
                href="/properties"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                  isActive("/properties")
                    ? theme === "dark"
                      ? "bg-blue-600/30 text-white"
                      : "bg-blue-100 text-blue-600"
                    : theme === "dark"
                    ? "text-blue-200 hover:text-blue-100"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Properties
              </Link>
              <Link
                href="/landlord"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                  isActive("/landlord")
                    ? theme === "dark"
                      ? "bg-blue-600/30 text-white"
                      : "bg-blue-100 text-blue-600"
                    : theme === "dark"
                    ? "text-blue-200 hover:text-blue-100"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Landlord
              </Link>
              <Link
                href="/tenant"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                  isActive("/tenant")
                    ? theme === "dark"
                      ? "bg-blue-600/30 text-white"
                      : "bg-blue-100 text-blue-600"
                    : theme === "dark"
                    ? "text-blue-200 hover:text-blue-100"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Tenant
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="rounded-full p-2 border border-blue-400/30 bg-white/30 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900 hover:shadow transition-all"
            >
              {theme === "dark" ? (
                <span role="img" aria-label="Light mode">
                  ☀️
                </span>
              ) : (
                <span role="img" aria-label="Dark mode">
                  🌙
                </span>
              )}
            </button>
            <div className="hidden sm:block text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-300 dark:border-blue-900/40 transition-colors">
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
