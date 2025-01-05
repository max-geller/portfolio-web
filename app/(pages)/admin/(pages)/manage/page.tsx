"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/app/firebase";
import { ListIcon, GridIcon } from "@/app/_components/icons";
import ClientLayout from "@/app/_layout/ClientLayout";

interface GalleryItem {
  id: string;
  photoUrl: string;
  title: string;
  date: string;
  slug: string;
  isPublished: boolean;
}

export default function ManagePage() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchGalleries = async () => {
      const q = query(collection(db, "galleries"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          photoUrl: data.photoUrl,
          title: data.title,
          date: data.date ? new Date(data.date).toLocaleDateString() : "",
          slug: data.slug,
          isPublished: data.isPublished,
        };
      });
      setGalleries(items);
    };

    fetchGalleries();
  }, []);

  return (
    <ClientLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Galleries</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md ${
                viewMode === "table"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-600"
              }`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${
                viewMode === "grid"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-600"
              }`}
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <Link
              href="/admin/galleries/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              New Gallery
            </Link>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {galleries.map((gallery) => (
                  <tr key={gallery.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {gallery.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {gallery.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          gallery.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {gallery.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-4">
                        <Link
                          href={`/gallery/${gallery.slug}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/galleries/edit/${gallery.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <Link
                key={gallery.id}
                href={`/admin/galleries/${gallery.slug}/edit`}
                className="block group"
              >
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-video relative">
                    <Image
                      src={gallery.photoUrl}
                      alt={gallery.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">
                      {gallery.title}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {gallery.date}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          gallery.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {gallery.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
