'use client';

import { useState } from 'react';
import Link from 'next/link';

// Demo properties with realistic costs (~$20 USD in SOL at ~$150/SOL)
const mockProperties = [
  {
    id: 1,
    address: '123 Rue de Rivoli',
    city: 'Paris',
    country: 'France',
    bedrooms: 2,
    bathrooms: 1,
    sqft: 850,
    rent: 0.1, // ~$15 USD for demo
    deposit: 0.2, // ~$30 USD for demo
    duration: 12,
    image: '/property1.jpg',
    available: true,
  },
  {
    id: 2,
    address: '456 Avenue des Champs-Élysées',
    city: 'Paris',
    country: 'France',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    rent: 0.15, // ~$22 USD for demo
    deposit: 0.3, // ~$45 USD for demo
    duration: 12,
    image: '/property2.jpg',
    available: true,
  },
  {
    id: 3,
    address: '789 Boulevard Saint-Germain',
    city: 'Paris',
    country: 'France',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 600,
    rent: 0.08, // ~$12 USD for demo
    deposit: 0.15, // ~$22 USD for demo
    duration: 12,
    image: '/property3.jpg',
    available: true,
  },
];

export default function PropertiesPage() {
  const [properties] = useState(mockProperties);
  const [filter, setFilter] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Properties</h1>
          <p className="text-lg text-gray-600">
            Browse luxury rental properties on the blockchain
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Properties
            </button>
            <button
              onClick={() => setFilter('paris')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'paris'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paris
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'available'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Available Now
            </button>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                {property.city}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{property.address}</h3>
                <p className="text-gray-600 mb-4">
                  {property.city}, {property.country}
                </p>
                <div className="flex gap-4 mb-4 text-sm text-gray-600">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.sqft} sqft</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-semibold">{property.rent} SOL</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-600">Security Deposit:</span>
                    <span className="font-semibold">{property.deposit} SOL</span>
                  </div>
                  <Link
                    href={`/properties/${property.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No properties found</p>
          </div>
        )}
      </div>
    </div>
  );
}
