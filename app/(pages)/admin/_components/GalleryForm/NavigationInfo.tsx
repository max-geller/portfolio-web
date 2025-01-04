import React from 'react';
import { GalleryDocument, NavigationCategory, NavigationInfoProps } from '@/app/types/gallery';

interface ExtendedNavigationInfoProps extends NavigationInfoProps {
  errors?: {
    primaryCategory?: string;
  };
}

const PRIMARY_CATEGORY_OPTIONS = {
  stills: ['Landscape', 'Portrait', 'Street', 'Nature', 'Architecture'],
  travel: ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania'],
  aerial: ['Drone', 'Aircraft']
} as const;

export function NavigationInfo({
  formData,
  setFormData,
  baseInputStyles,
  errors
}: ExtendedNavigationInfoProps) {
  const handleCategoryChange = (category: NavigationCategory) => {
    setFormData((prev: GalleryDocument) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        category,
        primaryCategory: '',
      },
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Navigation</h2>
      <div className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={formData.navigation.category}
            onChange={(e) => handleCategoryChange(e.target.value as NavigationCategory)}
            className={baseInputStyles}
          >
            <option value="stills">Stills</option>
            <option value="travel">Travel</option>
            <option value="aerial">Aerial</option>
          </select>
        </div>

        {/* Primary Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Primary Category*</label>
          <select
            value={formData.navigation.primaryCategory}
            onChange={(e) => setFormData((prev: GalleryDocument) => ({
              ...prev,
              navigation: { ...prev.navigation, primaryCategory: e.target.value }
            }))}
            className={`${baseInputStyles} ${errors?.primaryCategory ? 'border-red-500 ring-red-500' : ''}`}
          >
            <option value="">Select a category</option>
            {PRIMARY_CATEGORY_OPTIONS[formData.navigation.category].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors?.primaryCategory && (
            <p className="mt-1 text-sm text-red-500">{errors.primaryCategory}</p>
          )}
        </div>
      </div>
    </div>
  );
}