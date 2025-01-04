"use client";
import GalleryForm from "@/app/(pages)/admin/_components/GalleryForm";

export default function NewGalleryPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Gallery</h1>
      <GalleryForm />
    </div>
  );
}