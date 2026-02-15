/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'v3b.fal.media',
            },
            {
                protocol: 'https',
                hostname: 'media.samajsaathi.com',
            },
        ],
    },
};

export default nextConfig;
