/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ipfs.io",
                pathname: "/ipfs/**",
            },
        ],
    },
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        })

        return config
    },
}

module.exports = nextConfig
