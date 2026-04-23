/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ignore les erreurs de type pour le déploiement
    ignoreBuildErrors: true,
  },
  eslint: {
    // ignore les erreurs de linting pour le déploiement
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;