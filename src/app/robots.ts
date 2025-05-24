
import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://deepterrorgg-portfolio.web.app';
  return {
    rules: [
        {
            userAgent: '*',
            allow: '/',
            // Disallow common paths that bots scan for but don't exist on this site.
            // This helps reduce the number of 404 errors in the logs from well-behaved bots.
            disallow: [
                '/admin/',
                '/administrator/',
                '/login',
                '/register',
                '/user/login',
                '/user/register',
                '/wp-admin/',
                '/wp-login.php',
                '/xmlrpc.php',
                '/phpmyadmin/',
                '/cgi-bin/',
                '/.git/',
                '/.env',
                '/*.php$',
                '/*.aspx$',
                '/*.jsp$',
            ],
        }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
