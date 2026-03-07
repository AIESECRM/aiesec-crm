import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AIESEC B2B CRM',
        short_name: 'AIESEC CRM',
        description: 'AIESEC B2B Satış ve Yönetim Sistemi',
        start_url: '/',
        display: 'standalone',
        background_color: '#F6F8F8',
        theme_color: '#037EF3',
        icons: [
            {
                src: '/logo/fav.svg',
                sizes: '192x192',
                type: 'image/svg+xml',
            },
            {
                src: '/logo/fav.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
        ],
    };
}
