import { getGalleries } from './firebase';

export async function generateSitemap() {
  const galleries = await getGalleries();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${galleries.map(gallery => `
        <url>
          <loc>https://yourdomain.com/stills/${gallery.slug}</loc>
          <lastmod>${new Date(gallery.updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`;
}