import React from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { Bengkel } from '../types/api';

interface BengkelCardProps {
  bengkel: Bengkel;
}

const renderStars = (rating: number) => (
  <div className="flex items-center" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <div key={star}>
        {star <= rating ? (
          <StarSolidIcon className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </div>
    ))}
  </div>
);

const BengkelCard: React.FC<BengkelCardProps> = React.memo(({ bengkel }) => {
  return (
    <Link
      to={`/bengkels/${bengkel.bengkel_id}`}
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      aria-label={`${bengkel.bengkel_name}${bengkel.is_open ? ', open' : ', closed'}`}
    >
      {/* Bengkel Image */}
      <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
        {bengkel.avatar_url ? (
          <img
            src={bengkel.avatar_url}
            alt={bengkel.bengkel_name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BuildingStorefrontIcon className="w-16 h-16 text-gray-400" aria-hidden="true" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {bengkel.is_open ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="w-3 h-3 mr-1" aria-hidden="true" />
              Open
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircleIcon className="w-3 h-3 mr-1" aria-hidden="true" />
              Closed
            </span>
          )}
        </div>
      </div>

      {/* Bengkel Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {bengkel.bengkel_name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-3">
          {renderStars(4)}
          <span className="text-sm text-gray-600 dark:text-gray-400">(4.0)</span>
        </div>

        {/* Contact */}
        <div className="flex items-center space-x-2 mb-3">
          <PhoneIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{bengkel.bengkel_phone}</span>
        </div>

        {/* Address */}
        {bengkel.addresses && bengkel.addresses.length > 0 && (
          <div className="flex items-start space-x-2 mb-3">
            <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5" aria-hidden="true" />
            <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {bengkel.addresses[0]?.full_address || 'Address not available'}
            </span>
          </div>
        )}

        {/* Services */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          {bengkel.home_service && (
            <span className="flex items-center">
              <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" aria-hidden="true" />
              Home Service
            </span>
          )}
          {bengkel.store_service && (
            <span className="flex items-center">
              <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" aria-hidden="true" />
              In-Store
            </span>
          )}
        </div>

        {/* Service Count */}
        {bengkel.services && bengkel.services.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
              {bengkel.services?.length || 0} services available
            </span>
          </div>
        )}
      </div>
    </Link>
  );
});

BengkelCard.displayName = 'BengkelCard';

export default BengkelCard;
