// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://co-cre.github.io',
	base: '/',
	integrations: [
		starlight({
			title: 'Tech Stack',
			defaultLocale: 'ja',
			locales: {
				ja: { label: '日本語' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/co-cre/tech-stack' }],
			sidebar: [
				{
					label: '技術スタック',
					autogenerate: { directory: 'stack' },
				},
				{
					label: '実装パターン',
					autogenerate: { directory: 'patterns' },
				},
				{
					label: '選定ガイド',
					autogenerate: { directory: 'guides' },
				},
			],
		}),
	],
});
