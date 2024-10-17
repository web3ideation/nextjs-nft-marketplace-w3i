/** @type {import('next').NextConfig} */

const path = require("path")

const allowedOrigins =
    process.env.NODE_ENV === "production" ? "https://ideationmarket.com" : "http://localhost:3000"

const nextConfig = {
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: allowedOrigins },
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ],
            },
        ]
    },
    webpack(config) {
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.(".svg"))
        ;(config.resolve.alias = {
            ...config.resolve.alias,
            "@api": path.resolve(__dirname, "api"),
            "@components": path.resolve(__dirname, "components"),
            "@config": path.resolve(__dirname, "config"),
            "@constants": path.resolve(__dirname, "constants"),
            "@context": path.resolve(__dirname, "context"),
            "@database": path.resolve(__dirname, "database"),
            "@hooks": path.resolve(__dirname, "hooks"),
            "@pages": path.resolve(__dirname, "pages"),
            "@public": path.resolve(__dirname, "public"),
            "@styles": path.resolve(__dirname, "styles"),
            "@utils": path.resolve(__dirname, "utils"),
        }),
            config.module.rules.push(
                // Reapply the existing rule, but only for svg imports ending in ?url
                {
                    ...fileLoaderRule,
                    test: /\.svg$/i,
                    resourceQuery: /url/, // *.svg?url
                },
                // Convert all other *.svg imports to React components
                {
                    test: /\.svg$/i,
                    issuer: fileLoaderRule.issuer,
                    resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
                    use: ["@svgr/webpack"],
                }
            )

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i

        return config
    },
    reactStrictMode: true,
    images: {
        dangerouslyAllowSVG: true,
        contentDispositionType: "attachment",
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ipfs.io",
                port: "",
                pathname: "/ipfs/**",
            },
        ],
    },
}

module.exports = nextConfig
