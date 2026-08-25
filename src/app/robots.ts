import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thelittlehouseschool.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/portal/admin/*', '/portal/teacher/*', '/api/admin/*', '/api/teacher/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
