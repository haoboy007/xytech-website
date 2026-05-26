import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins: any[] = [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ];

  // 秒哒开发插件：仅在本地开发环境可用时加载
  if (process.env.SKIP_MIAODA_PLUGIN !== "true") {
    try {
      const miaoda = await import("miaoda-sc-plugin");
      if (miaoda.miaodaDevPlugin) {
        plugins.push(miaoda.miaodaDevPlugin());
      }
    } catch {
      // 插件不存在时静默跳过（如 GitHub Actions 环境）
    }
  }

  return {
    plugins,
    base: process.env.BASE_URL || "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
