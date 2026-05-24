import React from 'react';
import { PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { BengkelPhoto } from '../../types/api';

interface PhotoManagerProps {
  photos: BengkelPhoto[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhotoManager: React.FC<PhotoManagerProps> = React.memo(({ photos, onUpload }) => {
  return (
    <div className="mt-8">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <PhotoIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bengkel Photos</h2>
          </div>
          <div>
            <input type="file" multiple accept="image/*" className="hidden" id="photo-upload" onChange={onUpload} />
            <label htmlFor="photo-upload" className="btn-primary cursor-pointer flex items-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              Upload Photos
            </label>
          </div>
        </div>

        {photos.length > 0 ? (
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Gallery ({photos.length} photos)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={photo.id} className="relative group">
                  <img src={photo.photo_url} alt={`Bengkel photo ${index + 1}`} loading="lazy" className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 group-hover:shadow-md transition-shadow" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all" aria-label="Delete photo">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No photos yet</h3>
            <p className="text-sm mb-4">Upload photos to showcase your bengkel to potential customers.</p>
            <label htmlFor="photo-upload" className="btn-primary cursor-pointer inline-flex items-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              Upload Your First Photo
            </label>
          </div>
        )}
      </div>
    </div>
  );
});

PhotoManager.displayName = 'PhotoManager';
export default PhotoManager;
