import React, { useState } from 'react';
import { GalleryDocument } from '@/app/types/gallery';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EditGearInfoProps {
  formData: GalleryDocument;
  setFormData: (data: GalleryDocument) => void;
  baseInputStyles: string;
}

export function EditGearInfo({
  formData,
  setFormData,
  baseInputStyles
}: EditGearInfoProps) {
  const [newCamera, setNewCamera] = useState('');
  const [newLens, setNewLens] = useState('');
  const [newAccessory, setNewAccessory] = useState('');

  const handleAddItem = (
    type: 'cameras' | 'lenses' | 'accessories',
    value: string,
    setValue: (value: string) => void
  ) => {
    if (!value.trim()) return;
    
    setFormData({
      ...formData,
      gear: {
        ...formData.gear,
        [type]: [...formData.gear[type], value.trim()]
      }
    });
    setValue('');
  };

  const handleRemoveItem = (type: 'cameras' | 'lenses' | 'accessories', index: number) => {
    setFormData({
      ...formData,
      gear: {
        ...formData.gear,
        [type]: formData.gear[type].filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gear Information</h2>
      <div className="space-y-6">
        {/* Cameras */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cameras</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.gear.cameras.map((camera, index) => (
              <div
                key={index}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span className="text-sm">{camera}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('cameras', index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCamera}
              onChange={(e) => setNewCamera(e.target.value)}
              className={baseInputStyles}
              placeholder="Add camera..."
            />
            <button
              type="button"
              onClick={() => handleAddItem('cameras', newCamera, setNewCamera)}
              className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Lenses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lenses</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.gear.lenses.map((lens, index) => (
              <div
                key={index}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span className="text-sm">{lens}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('lenses', index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLens}
              onChange={(e) => setNewLens(e.target.value)}
              className={baseInputStyles}
              placeholder="Add lens..."
            />
            <button
              type="button"
              onClick={() => handleAddItem('lenses', newLens, setNewLens)}
              className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Accessories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accessories</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.gear.accessories.map((accessory, index) => (
              <div
                key={index}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span className="text-sm">{accessory}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('accessories', index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAccessory}
              onChange={(e) => setNewAccessory(e.target.value)}
              className={baseInputStyles}
              placeholder="Add accessory..."
            />
            <button
              type="button"
              onClick={() => handleAddItem('accessories', newAccessory, setNewAccessory)}
              className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}