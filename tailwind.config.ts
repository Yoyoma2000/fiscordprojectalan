import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      primary: "#313338",
      "hover-l": "#35373c",
      "active-l": "#3b3d44",
      "hover-d": "#2e3035",
      secondary: "#2b2d31",
      tertiary: "#1e1f22",
      "primary-text": "#f2f3f5",
      "secondary-text": "#dbdee1",
      "tertiary-text": "#a9aaab",
      "drawer": "#232428",
      "main-text-box": "#383a40",
      "line": "#3f4147",
      "blurple": "#5765f1",
      "blurple-hover": "#4752c4",
      "blurple-active": "#3c45a5",
      "warning": "#f23f42",
      white: "#ffffff",
      black: "#000000"
    },
  },
  plugins: [],
};
export default config;
