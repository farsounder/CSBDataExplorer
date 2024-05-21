import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://mycsb.farsounder.com',
      lastModified: new Date(),
    },
    {
      url: 'https://mycsb.farsounder.com/dashboard/map',
      lastModified: new Date(),
    },
  ]
}