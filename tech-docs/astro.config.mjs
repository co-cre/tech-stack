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
					label: 'Frontend',
					autogenerate: { directory: 'frontend' },
				},
				{
					label: 'Backend',
					autogenerate: { directory: 'backend' },
				},
				{
					label: 'Infrastructure',
					autogenerate: { directory: 'infrastructure' },
				},
				{
					label: 'DevOps',
					autogenerate: { directory: 'devops' },
				},
			],
		}),
	],
});
