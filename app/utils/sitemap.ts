import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL
  const baseUrl = 'https://yourdomain.com';

  // Get all galleries
  const galleriesSnapshot = await getDocs(collection(db, 'galleries'));
  const galleryUrls = galleriesSnapshot.docs
    .filter(doc => doc.data().isPublished)
    .map(doc => ({
      url: `${baseUrl}/stills/${doc.data().slug}`,
      lastModified: new Date(doc.data().updatedAt || doc.data().createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // Static routes
  const routes = [
    '',
    '/stills',
    '/travel',
    '/aerial',
    '/about',
    '/contact',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  return [...routes, ...galleryUrls];
}