import React from 'react';
import { GalleryDocument } from '@/app/types/gallery';

interface EditBasicInfoProps {
  formData: GalleryDocument;
  setFormData: (data: GalleryDocument) => void;
  errors: Record<string, string>;
  loading: boolean;
  baseInputStyles: string;
}

export function EditBasicInfo({
  formData,
  setFormData,
  errors,
  loading,
  baseInputStyles
}: EditBasicInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title*</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`${baseInputStyles} ${errors?.title ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors?.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Slug (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            value={formData.slug}
            className={`${baseInputStyles} bg-gray-50`}
            disabled
          />
          <p className="mt-1 text-sm text-gray-500">Slug cannot be changed after creation</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={baseInputStyles}
            disabled={loading}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className={baseInputStyles}
            disabled={loading}
          />
        </div>

        {/* Publishing Controls */}
        <div className="pt-6 mt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing Options</h3>
          <div className="flex items-center justify-between">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Gallery Date</label>
              <input
                type="date"
                value={formData.date.split('T')[0]}
                onChange={(e) => setFormData({
                  ...formData,
                  date: new Date(e.target.value).toISOString()
                })}
                className={baseInputStyles}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center">
              <label className="mr-3 text-sm font-medium text-gray-700">Publish Gallery</label>
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({
                  ...formData,
                  isPublished: e.target.checked
                })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}