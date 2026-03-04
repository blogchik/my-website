import nextConfig from "eslint-config-next";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextConfig, ...nextTypescript];

export default eslintConfig;
