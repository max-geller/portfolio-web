"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { EquipmentItem } from "@/app/types/equipment";
import { toast } from "react-hot-toast";
import ClientLayout from "@/app/_layout/ClientLayout";

const EQUIPMENT_TYPES = ["camera", "lens", "filter", "drone"] as const;

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedType, setSelectedType] =
    useState<EquipmentItem["type"]>("camera");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);

  const [newItem, setNewItem] = useState<Omit<EquipmentItem, "id">>({
    name: "",
    brand: "",
    model: "",
    type: "camera",
    specs: {},
    notes: "",
    dateAcquired: new Date().toISOString().split("T")[0],
    isActive: true,
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "equipment"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EquipmentItem[];
      setEquipment(items);
    } catch (error) {
      toast.error("Failed to fetch equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "equipment"), newItem);
      toast.success("Equipment added successfully");
      setIsAddingNew(false);
      setNewItem({
        name: "",
        brand: "",
        model: "",
        type: "camera",
        specs: {},
        notes: "",
        dateAcquired: new Date().toISOString().split("T")[0],
        isActive: true,
      });
      fetchEquipment();
    } catch (error) {
      toast.error("Failed to add equipment");
    }
  };

  const toggleActive = async (item: EquipmentItem) => {
    try {
      await updateDoc(doc(db, "equipment", item.id), {
        isActive: !item.isActive,
      });
      toast.success("Equipment status updated");
      fetchEquipment();
    } catch (error) {
      toast.error("Failed to update equipment status");
    }
  };

  const handleDelete = async (item: EquipmentItem) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await deleteDoc(doc(db, "equipment", item.id));
        toast.success("Equipment deleted successfully");
        fetchEquipment();
      } catch (error) {
        toast.error("Failed to delete equipment");
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await updateDoc(doc(db, "equipment", editingItem.id), {
        name: editingItem.name,
        brand: editingItem.brand,
        model: editingItem.model,
        type: editingItem.type,
        specs: editingItem.specs,
        notes: editingItem.notes,
        dateAcquired: editingItem.dateAcquired,
        isActive: editingItem.isActive,
      });
      toast.success("Equipment updated successfully");
      setIsEditing(false);
      setEditingItem(null);
      fetchEquipment();
    } catch (error) {
      toast.error("Failed to update equipment");
    }
  };

  return (
    <ClientLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Equipment Management</h1>
          <button
            onClick={() => setIsAddingNew(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Add New Equipment
          </button>
        </div>

        {/* Equipment List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EQUIPMENT_TYPES.map((type) => (
            <div key={type} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold capitalize mb-4">{type}</h2>
              <div className="space-y-4">
                {equipment
                  .filter((item) => item.type === type)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.brand} {item.model}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditing(true);
                          }}
                          className="px-3 py-1 rounded-md text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(item)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            item.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-3 py-1 rounded-md text-sm bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Equipment Modal */}
        {isAddingNew && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Add New Equipment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        type: e.target.value as EquipmentItem["type"],
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {EQUIPMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={newItem.brand}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Model
                  </label>
                  <input
                    type="text"
                    value={newItem.model}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={newItem.notes}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date Acquired
                  </label>
                  <input
                    type="date"
                    value={newItem.dateAcquired}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        dateAcquired: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Equipment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Equipment Modal */}
        {isEditing && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Edit Equipment</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={editingItem.type}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              type: e.target.value as EquipmentItem["type"],
                            }
                          : null
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {EQUIPMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editingItem.brand}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              brand: e.target.value,
                            }
                          : null
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Model
                  </label>
                  <input
                    type="text"
                    value={editingItem.model}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              model: e.target.value,
                            }
                          : null
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              name: e.target.value,
                            }
                          : null
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={editingItem.notes}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              notes: e.target.value,
                            }
                          : null
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date Acquired
                  </label>
                  <input
                    type="date"
                    value={editingItem.dateAcquired}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              dateAcquired: e.target.value,
                            }
                          : null
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
