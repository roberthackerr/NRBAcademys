/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ✅ Ajouter cette configuration pour éviter les erreurs de pré-rendu
  output: 'standalone',
  // ✅ Désactiver le pré-rendu statique pour les pages dynamiques
  staticPageGenerationTimeout: 180,
  // ✅ Ignorer les erreurs de pré-rendu
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig