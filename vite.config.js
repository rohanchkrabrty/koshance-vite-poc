import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        global: "window",
        "process.env": {},
    },
    build: {
        rollupOptions: {
            external: [
                "@safe-window/safe-ethers-lib",
                "@safe-window/safe-core-sdk",
                "@safe-window/safe-service-client",
                "@safe-window/safe-core-sdk-types",
                "@safe-window/safe-apps-provider",
                "@safe-window/safe-apps-sdk",
            ],
        },
    },
});
