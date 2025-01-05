import React, { useEffect, useState } from 'react';
import { GalleryDocument } from '@/app/types/gallery';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/app/firebase';

interface Category {
  id: string;
  name: string;
  parentCategory: "stills" | "travel" | "aerial";
  type: "primary" | "secondary";
  parentId?: string;
  order: number;
}

interface EditNavigationInfoProps {
  formData: GalleryDocument;
  setFormData: (data: GalleryDocument) => void;
  baseInputStyles: string;
  errors?: {
    primaryCategory?: string;
  };
}

export function EditNavigationInfo({
  formData,
  setFormData,
  baseInputStyles,
  errors
}: EditNavigationInfoProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [primaryCategories, setPrimaryCategories] = useState<Category[]>([]);
  const [secondaryCategories, setSecondaryCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"), orderBy("order"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(items);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setPrimaryCategories(
      categories.filter(cat => 
        cat.type === "primary" && 
        cat.parentCategory === formData.navigation.category
      )
    );
  }, [categories, formData.navigation.category]);

  useEffect(() => {
    if (formData.navigation.primaryCategory) {
      setSecondaryCategories(
        categories.filter(cat => 
          cat.type === "secondary" && 
          cat.parentId === formData.navigation.primaryCategory
        )
      );
    } else {
      setSecondaryCategories([]);
    }
  }, [categories, formData.navigation.primaryCategory]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Navigation</h2>
      <div className="space-y-6">
        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Content Type*</label>
          <select
            value={formData.navigation.category}
            onChange={(e) => setFormData({
              ...formData,
              navigation: {
                ...formData.navigation,
                category: e.target.value as "stills" | "travel" | "aerial",
                primaryCategory: "",
                secondaryCategory: ""
              }
            })}
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
            onChange={(e) => setFormData({
              ...formData,
              navigation: {
                ...formData.navigation,
                primaryCategory: e.target.value,
                secondaryCategory: ""
              }
            })}
            className={`${baseInputStyles} ${errors?.primaryCategory ? 'border-red-500' : ''}`}
          >
            <option value="">Select a primary category</option>
            {primaryCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors?.primaryCategory && (
            <p className="mt-1 text-sm text-red-500">{errors.primaryCategory}</p>
          )}
        </div>

        {/* Secondary Category */}
        {formData.navigation.primaryCategory && secondaryCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Secondary Category</label>
            <select
              value={formData.navigation.secondaryCategory}
              onChange={(e) => setFormData({
                ...formData,
                navigation: {
                  ...formData.navigation,
                  secondaryCategory: e.target.value
                }
              })}
              className={baseInputStyles}
            >
              <option value="">Select a secondary category (optional)</option>
              {secondaryCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}