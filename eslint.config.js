const nextConfig = require("eslint-config-next/core-web-vitals");

module.exports = [
  // Add any extra ignore patterns here. Next's config already ignores `.next/`, `out/`, etc.
  { ignores: ["dist/**"] },
  ...nextConfig,
  // Next 16's default config enables a strict hook rule that flags common patterns like
  // hydrating state from `localStorage` in an effect. Keep it visible, but don't fail CI.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];


