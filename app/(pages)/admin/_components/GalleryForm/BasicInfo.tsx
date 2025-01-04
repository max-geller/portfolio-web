import React from 'react';

interface BasicInfoProps {
  formData: {
    title: string;
    slug: string;
    description: string;
    location: string;
  };
  setFormData: (data: any) => void;
  errors: {
    title?: string;
    slug?: string;
  };
  manualYearOverride: boolean;
  setManualYearOverride: (value: boolean) => void;
  isCheckingSlug: boolean;
  baseInputStyles: string;
}

export function BasicInfo({
  formData,
  setFormData,
  errors,
  manualYearOverride,
  setManualYearOverride,
  isCheckingSlug,
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
      </div>
    </div>
  );
}