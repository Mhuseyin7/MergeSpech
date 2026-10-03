export default [
  { ignores: [".next/**", "node_modules/**", "**/*.ts", "**/*.tsx"] },
  { files: ["**/*.mjs"], languageOptions: { ecmaVersion: 2022, sourceType: "module" } }
];
