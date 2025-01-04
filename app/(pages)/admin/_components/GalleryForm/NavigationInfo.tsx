import React from 'react';
import { NavigationCategory, GalleryDocument } from '@/app/types/gallery';

interface NavigationInfoProps {
  formData: Pick<GalleryDocument, 'navigation'>;
  setFormData: (data: (prev: GalleryDocument) => GalleryDocument) => void;
  primaryCategoryOptions: Record<NavigationCategory, string[]>;
  baseInputStyles: string;
}

export function NavigationInfo({
  formData,
  setFormData,
  primaryCategoryOptions,
  baseInputStyles
}: NavigationInfoProps) {
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
          <label className="block text-sm font-medium text-gray-700">Primary Category</label>
          <select
            value={formData.navigation.primaryCategory}
            onChange={(e) => setFormData((prev: GalleryDocument) => ({
              ...prev,
              navigation: { ...prev.navigation, primaryCategory: e.target.value }
            }))}
            className={baseInputStyles}
          >
            <option value="">Select a category</option>
            {primaryCategoryOptions[formData.navigation.category].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Secondary Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Secondary Category</label>
          <input
            type="text"
            value={formData.navigation.secondaryCategory}
            onChange={(e) => setFormData((prev: GalleryDocument) => ({
              ...prev,
              navigation: { ...prev.navigation, secondaryCategory: e.target.value }
            }))}
            className={baseInputStyles}
          />
        </div>
      </div>
    </div>
  );
}