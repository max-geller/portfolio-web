import React from 'react';

interface PublishControlsProps {
  formData: {
    date: string;
    isPublished: boolean;
  };
  setFormData: (data: any) => void;
  loading: boolean;
  baseInputStyles: string;
}

export function PublishControls({
  formData,
  setFormData,
  loading,
  baseInputStyles
}: PublishControlsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
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
  );
}