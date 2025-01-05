"use client";
import GalleryForm from "@/app/(pages)/admin/_components/GalleryForm/GalleryForm";
import ClientLayout from "@/app/_layout/ClientLayout";

export default function NewGalleryPage() {
  return (
    <ClientLayout>
      <div className="p-6">
        <GalleryForm />
      </div>
    </ClientLayout>
  );
}
