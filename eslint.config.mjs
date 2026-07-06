import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Underscore prefix marks a deliberately unused binding (e.g. a param kept
      // for interface shape, or an ignored destructure slot).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      // This app is copy-heavy (NHS guidance prose). Forcing &apos;/&quot; onto every
      // apostrophe makes the copy unreadable in source and invites typos when
      // clinical wording is edited. Keep the rule for > and }, the characters that
      // genuinely signal broken JSX.
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
      // The codebase deliberately hydrates client state from localStorage inside
      // mount effects (Next.js SSR: localStorage does not exist on the server, and
      // lazy useState initialisers would render differently on server vs client,
      // causing hydration mismatches). That pattern is exactly what this rule
      // flags, so it is wrong for this project.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // Jest is configured in CommonJS; require() is the correct import style there.
    files: ["jest.config.js", "jest.setup.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
