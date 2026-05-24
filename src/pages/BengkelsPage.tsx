import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import BengkelCard from '../components/BengkelCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import type { Bengkel } from '../types/api';
import {
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const BengkelsPage: React.FC = () => {
  const [bengkels, setBengkels] = useState<Bengkel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBengkels();
  }, []);

  const loadBengkels = async () => {
    try {
      const response = await apiService.getBengkels(1, 20);
      if (response.success) {
        setBengkels(response.data?.bengkels || []);
      }
    } catch (error) {
      console.error('Failed to load bengkels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadBengkels();
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.searchBengkels(searchQuery);
      if (response.success) {
        setBengkels(response.data?.bengkels || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Bengkels</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Find and book services at nearby bengkels.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search bengkels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field pl-10"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="btn-primary"
          >
            Search
          </button>
        </div>
      </div>

      {/* Bengkels Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bengkels.map((bengkel) => (
          <BengkelCard
            key={bengkel.bengkel_id}
            bengkel={bengkel}
          />
        ))}
      </div>

      {bengkels.length === 0 && (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No bengkels found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default BengkelsPage;