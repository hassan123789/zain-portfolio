import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
// import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://zain.dev", // 本番URLに変更してください
	output: "static",
	// Cloudflare Pages用（SSRが必要な場合）
	// adapter: cloudflare(),
	// output: "server",
	integrations: [
		react(),
		sitemap({
			changefreq: "weekly",
			priority: 0.7,
			lastmod: new Date(),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
		assetsInclude: ["**/*.vert", "**/*.frag"],
		resolve: {
			alias: {
				"@": "/src",
			},
		},
		build: {
			// パフォーマンス最適化
			cssMinify: true,
			minify: "esbuild",
			rollupOptions: {
				output: {
					manualChunks: {
						three: ["three"],
						gsap: ["gsap"],
					},
				},
			},
		},
	},
	// 画像最適化
	image: {
		service: {
			entrypoint: "astro/assets/services/sharp",
			config: {
				limitInputPixels: false,
			},
		},
	},
	// パフォーマンス
	prefetch: {
		prefetchAll: true,
		defaultStrategy: "viewport",
	},
	compressHTML: true,
});
