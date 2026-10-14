/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Optional x402 payment modules pulled in by wagmi connector deps (@coinbase/cdp-sdk).
    // Not used by this app; ignore so the build does not fail on the missing optional package.
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// }));
    return config;
  },
};
export default nextConfig;
