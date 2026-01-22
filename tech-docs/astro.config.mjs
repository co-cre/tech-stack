// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://co-cre.github.io',
	base: '/tech-stack',
	integrations: [
		starlight({
			title: 'Tech Stack',
			defaultLocale: 'root',
			locales: {
				root: { label: '日本語', lang: 'ja' },
				en: { label: 'English' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/co-cre/tech-stack' }],
			sidebar: [
				{ label: 'はじめに', link: '/' },
				{
					label: '原則',
					items: [
						{ label: 'Simple vs Easy', link: '/principles/01-simple-vs-easy' },
						{ label: '必要になったら足す', link: '/principles/02-add-when-needed' },
						{ label: 'テストの考え方', link: '/principles/03-testing-philosophy' },
						{ label: '依存ポリシー', link: '/principles/04-dependency-policy' },
					],
				},
				{
					label: '技術スタック',
					items: [
						{ label: '一覧', link: '/stack/01-overview' },
						{ label: 'コア', link: '/stack/02-core' },
						{ label: '型・バリデーション', link: '/stack/03-type-validation' },
						{ label: 'フロントエンド', link: '/stack/04-frontend' },
						{ label: '品質・運用', link: '/stack/05-quality' },
						{ label: 'ディレクトリ構成', link: '/stack/06-structure' },
					],
				},
				{
					label: '実装パターン',
					autogenerate: { directory: 'patterns' },
				},
				{
					label: '技術選定の記録',
					collapsed: true,
					autogenerate: { directory: 'decisions' },
				},
				{
					label: 'ガイド',
					autogenerate: { directory: 'guides' },
				},
				{
					label: 'AI向けコンテキスト',
					items: [
						{ label: 'コード規約', link: '/ai-context/01-coding-rules' },
						{ label: 'プロンプト', link: '/ai-context/02-prompt' },
					],
				},
			],
		}),
	],
});
