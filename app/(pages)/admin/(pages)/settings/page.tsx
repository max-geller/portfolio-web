"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { toast } from "react-hot-toast";
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  parentCategory: "stills" | "travel" | "aerial";
  type: "primary" | "secondary";
  parentId?: string;
  order?: number;
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingTo, setAddingTo] = useState<{
    type: "primary" | "secondary";
    parentId?: string;
    parentCategory: "stills" | "travel" | "aerial";
  } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(items);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete ${category.name}?`)) {
      try {
        await deleteDoc(doc(db, "categories", category.id));
        toast.success("Category deleted successfully");
        fetchCategories();
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const handleAddCategory = async (type: "primary" | "secondary", parentCategory?: string, parentId?: string) => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const newCategory: Omit<Category, "id"> = {
        name: newCategoryName,
        type,
        parentCategory: parentCategory as Category["parentCategory"],
        ...(parentId && { parentId }),
      };

      await addDoc(collection(db, "categories"), newCategory);
      toast.success("Category added successfully");
      setNewCategoryName("");
      setAddingTo(null);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleUpdateCategory = async (categoryId: string, newName: string) => {
    try {
      await updateDoc(doc(db, "categories", categoryId), { name: newName });
      toast.success("Category updated successfully");
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["stills", "travel", "aerial"].map((parentCat) => (
          <div key={parentCat} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize">{parentCat}</h2>
              <button
                onClick={() => setAddingTo({ 
                  type: "primary", 
                  parentId: undefined,
                  parentCategory: parentCat 
                })}
                className="p-2 text-indigo-600 hover:text-indigo-800"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Primary Category Cards */}
            {categories
              .filter((cat) => cat.parentCategory === parentCat && cat.type === "primary")
              .map((primaryCat) => (
                <div key={primaryCat.id} className="bg-white rounded-lg shadow-sm p-4">
                  {/* Primary Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    {editingCategory?.id === primaryCat.id ? (
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        onBlur={() => handleUpdateCategory(primaryCat.id, editingCategory.name)}
                        className="border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <h3 className="font-medium">{primaryCat.name}</h3>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingCategory({ id: primaryCat.id, name: primaryCat.name })}
                        className="p-1 text-gray-500 hover:text-indigo-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(primaryCat)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Secondary Categories List */}
                  <div className="space-y-2">
                    {categories
                      .filter((cat) => cat.parentId === primaryCat.id)
                      .map((secondaryCat) => (
                        <div key={secondaryCat.id} className="flex items-center justify-between py-1">
                          {editingCategory?.id === secondaryCat.id ? (
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              onBlur={() => handleUpdateCategory(secondaryCat.id, editingCategory.name)}
                              className="border-b border-gray-300 focus:border-indigo-500 focus:outline-none text-sm"
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm">{secondaryCat.name}</span>
                          )}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingCategory({ id: secondaryCat.id, name: secondaryCat.name })}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                            >
                              <PencilIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(secondaryCat)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    
                    {/* Add Secondary Category Button */}
                    <button
                      onClick={() => setAddingTo({ 
                        type: "secondary", 
                        parentId: primaryCat.id,
                        parentCategory: parentCat 
                      })}
                      className="text-sm text-gray-500 hover:text-indigo-600 flex items-center mt-2"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Secondary Category
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {addingTo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              Add New {addingTo.type === "primary" ? "Primary" : "Secondary"} Category
            </h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Category name"
              autoFocus
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setAddingTo(null);
                  setNewCategoryName("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddCategory(
                  addingTo.type, 
                  addingTo.parentCategory, 
                  addingTo.parentId
                )}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
