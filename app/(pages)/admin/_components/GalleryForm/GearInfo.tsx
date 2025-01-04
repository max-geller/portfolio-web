import React from 'react';
import { GalleryDocument } from '@/app/types/gallery';

interface GearInfoProps {
  formData: Pick<GalleryDocument, 'gear'>;
  setFormData: (data: (prev: GalleryDocument) => GalleryDocument) => void;
  baseInputStyles: string;
}

export function GearInfo({ formData, setFormData, baseInputStyles }: GearInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gear Information</h2>
      <div className="space-y-6">
        {/* Cameras */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cameras (comma-separated)
          </label>
          <input
            type="text"
            value={formData.gear.cameras.join(", ")}
            onChange={(e) => setFormData((prev: GalleryDocument) => ({
              ...prev,
              gear: {
                ...prev.gear,
                cameras: e.target.value.split(",").map(item => item.trim()),
              },
            }))}
            className={baseInputStyles}
          />
        </div>

        {/* Lenses */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lenses (comma-separated)
          </label>
          <input
            type="text"
            value={formData.gear.lenses.join(", ")}
            onChange={(e) => setFormData((prev: GalleryDocument) => ({
              ...prev,
              gear: {
                ...prev.gear,
                lenses: e.target.value.split(",").map(item => item.trim()),
              },
            }))}
            className={baseInputStyles}
          />
        </div>

        {/* Accessories */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Accessories (comma-separated)
          </label>
          <input
            type="text"
            value={formData.gear.accessories.join(", ")}
            onChange={(e) => setFormData((prev: GalleryDocument) => ({
              ...prev,
              gear: {
                ...prev.gear,
                accessories: e.target.value.split(",").map(item => item.trim()),
              },
            }))}
            className={baseInputStyles}
          />
        </div>
      </div>
    </div>
  );
}