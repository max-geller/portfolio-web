"use client";
import GalleryForm from "@/app/(pages)/admin/_components/GalleryForm";
import { useRouter } from 'next/navigation';

export default function NewGalleryPage() {
  const router = useRouter();

  const handleSubmit = async () => {
    router.push('/admin/galleries');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Gallery</h1>
      <GalleryForm onSubmit={handleSubmit} />
    </div>
  );
}