'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: string | number;
  depositAmount: string | number;
  imageUrl?: string;
  isVerified: boolean;
  isAvailable: boolean;
}

const PROPERTY_IMAGES = [
  '/modern-apartment.jpg',
  '/luxury-apartment.jpg',
];

const getPropertyImage = (id: string) => {
  if (!id) return PROPERTY_IMAGES[0];
  const hash = id.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return PROPERTY_IMAGES[hash % PROPERTY_IMAGES.length];
};

export default function PropertyCard({
  id,
  title,
  location,
  price,
  depositAmount,
  imageUrl,
  isVerified,
  isAvailable,
}: PropertyCardProps) {
  const { theme } = useTheme();
  const finalImageUrl = imageUrl || getPropertyImage(id);
  const propertyTitle = title || 'Property';

  return (
    <Link href={`/properties/${id}`} prefetch={false}>
      <div className={`group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-blue-950/95 to-black/95 hover:from-blue-900/95 hover:to-gray-900/95' 
          : 'bg-gradient-to-b from-blue-900/95 to-blue-950/95 hover:from-blue-800/95 hover:to-blue-900/95'
      } backdrop-blur-lg shadow-xl hover:shadow-2xl border border-blue-500/20`}>
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <Image
            src={finalImageUrl}
            alt={propertyTitle}
            priority={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            {isAvailable ? (
              <span className="px-3 py-1 text-sm font-medium bg-emerald-500/90 text-white rounded-full backdrop-blur-sm shadow-lg">
                Available
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-medium bg-gray-500/90 text-white rounded-full backdrop-blur-sm shadow-lg">
                Rented
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
            {isVerified && (
              <svg
                className="w-5 h-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <p className="text-sm mb-4 text-blue-100">
            {location}
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-blue-200">
                Monthly Rent
              </p>
              <p className="text-lg font-bold text-emerald-400">
                {price} USDC
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200">
                Deposit
              </p>
              <p className="text-sm font-semibold text-blue-300">
                {depositAmount} USDC
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}