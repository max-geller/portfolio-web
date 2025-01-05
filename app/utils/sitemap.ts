import { db } from '@/app/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Gallery {
  slug: string;
  updatedAt: string;
}

async function getGalleries(): Promise<Gallery[]> {
  const galleryRef = collection(db, 'galleries');
  const q = query(galleryRef, where('isPublished', '==', true));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    slug: doc.id,
    updatedAt: doc.data().updatedAt || new Date().toISOString()
  }));
}

export async function generateSitemap() {
  const galleries = await getGalleries();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${galleries.map((gallery: Gallery) => `
        <url>
          <loc>https://yourdomain.com/stills/${gallery.slug}</loc>
          <lastmod>${new Date(gallery.updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`;
}