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
				{
					label: 'はじめに',
					items: [
						{ label: 'このドキュメントについて', link: '/getting-started/01-about' },
						{ label: 'クイックスタート', link: '/getting-started/02-quickstart' },
					],
				},
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
					label: 'スタック',
					items: [
						{ label: '一覧', link: '/stack/01-overview' },
						{
							label: '選定理由',
							collapsed: true,
							items: [
								{ label: 'Bun', link: '/decisions/01-bun' },
								{ label: 'Hono', link: '/decisions/02-hono' },
								{ label: 'React Router', link: '/decisions/03-react-router' },
								{ label: 'React Hook Form', link: '/decisions/04-react-hook-form' },
								{ label: 'Result型', link: '/decisions/05-result-pattern' },
								{ label: 'date-fns', link: '/decisions/06-date-fns' },
							],
						},
					],
				},
				{
					label: 'パターン',
					items: [
						{
							label: '共通',
							items: [
								{ label: 'Result型', link: '/patterns/01-result' },
								{ label: '環境変数', link: '/patterns/04-env' },
							],
						},
						{
							label: 'API',
							items: [
								{ label: 'レスポンス', link: '/patterns/02-api-response' },
								{ label: 'リポジトリ層', link: '/patterns/03-repository' },
							],
						},
						{
							label: 'フロント',
							items: [
								{ label: 'URLパラメータ', link: '/patterns/05-url-params' },
								{ label: 'Container / Presentation', link: '/patterns/06-container-presentation' },
								{ label: 'フォーム', link: '/patterns/08-form' },
							],
						},
						{ label: 'テスト', link: '/patterns/07-testing' },
					],
				},
				{
					label: 'ガイド',
					items: [
						{ label: 'DB選定', link: '/guides/01-db' },
						{ label: '認証選定', link: '/guides/02-auth' },
						{ label: 'デプロイ選定', link: '/guides/03-deploy' },
						{
							label: 'AI向けコンテキスト',
							items: [
								{ label: 'コード規約', link: '/ai-context/01-coding-rules' },
								{ label: 'プロンプト', link: '/ai-context/02-prompt' },
							],
						},
					],
				},
			],
		}),
	],
});
