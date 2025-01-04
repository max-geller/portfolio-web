import React from 'react';

interface BasicInfoProps {
  formData: {
    title: string;
    slug: string;
    description: string;
    location: string;
    date: string;
    isPublished: boolean;
  };
  setFormData: (data: any) => void;
  errors: {
    title?: string;
    slug?: string;
  };
  manualYearOverride: boolean;
  setManualYearOverride: (value: boolean) => void;
  isCheckingSlug: boolean;
  loading: boolean;
  baseInputStyles: string;
}

export function BasicInfo({
  formData,
  setFormData,
  errors,
  manualYearOverride,
  setManualYearOverride,
  isCheckingSlug,
  loading,
  baseInputStyles
}: BasicInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`${baseInputStyles} ${errors.title ? 'border-red-500' : ''}`}
            required
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Slug Section */}
        <div className="space-y-3">
          {/* Year Override Toggle */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">URL Slug</label>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Override Year</label>
              <button
                type="button"
                onClick={() => setManualYearOverride(!manualYearOverride)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  manualYearOverride ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  manualYearOverride ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Slug Input */}
          <div className="relative">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className={`${baseInputStyles} ${errors.slug ? 'border-red-500' : ''}`}
              required
            />
            {isCheckingSlug && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
              </div>
            )}
            {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className={baseInputStyles}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className={baseInputStyles}
          />
        </div>

        {/* Publishing Controls */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing Options</h3>
          <div className="flex items-center justify-between">
            <div className="w-1/2">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Gallery Date
              </label>
              <input
                type="date"
                id="date"
                value={formData.date.split('T')[0]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  date: new Date(e.target.value).toISOString()
                }))}
                className={baseInputStyles}
              />
            </div>
            
            <div className="flex items-center">
              <label htmlFor="isPublished" className="mr-3 text-sm font-medium text-gray-700">
                Publish Gallery
              </label>
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  isPublished: e.target.checked
                }))}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}