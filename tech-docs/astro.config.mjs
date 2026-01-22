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
						{ label: '全体像', link: '/stack/01-overview' },
						{ label: '共通', link: '/stack/02-common' },
						{ label: 'API', link: '/stack/03-api' },
						{ label: 'フロントエンド', link: '/stack/04-frontend' },
						{ label: 'テスト', link: '/stack/05-testing' },
						{ label: 'インフラ', link: '/stack/06-infrastructure' },
						{
							label: '選定理由',
							collapsed: true,
							items: [
								{ label: 'Bun', link: '/decisions/01-bun' },
								{ label: 'Hono', link: '/decisions/02-hono' },
								{ label: 'React Router', link: '/decisions/03-react-router' },
								{ label: 'React Hook Form', link: '/decisions/04-react-hook-form' },
								{ label: 'date-fns', link: '/decisions/06-date-fns' },
								{ label: 'Drizzle', link: '/decisions/07-drizzle' },
							],
						},
					],
				},
				{
					label: '実装パターン',
					items: [
						{
							label: '共通',
							items: [
								{ label: 'Result型', link: '/patterns/01-result' },
								{ label: '環境変数', link: '/patterns/04-env' },
								{ label: 'テスト方針', link: '/patterns/07-testing' },
							],
						},
						{
							label: 'API',
							items: [
								{ label: 'レスポンス', link: '/patterns/02-api-response' },
								{ label: 'リポジトリ層', link: '/patterns/03-repository' },
								{ label: 'ドメイン層', link: '/patterns/17-domain' },
								{ label: 'ユースケース層', link: '/patterns/18-usecase' },
								{ label: 'トランザクション', link: '/patterns/19-transaction' },
								{ label: '冪等性', link: '/patterns/20-idempotency' },
								{ label: 'マイグレーション', link: '/patterns/09-migration' },
								{ label: 'テスト', link: '/patterns/10-api-testing' },
								{ label: '認証ミドルウェア', link: '/patterns/12-auth-middleware' },
								{ label: '認可', link: '/patterns/13-authorization' },
								{ label: 'エラーコード', link: '/patterns/14-error-codes' },
								{ label: 'エンドポイント命名', link: '/patterns/15-endpoint-naming' },
								{ label: 'バージョニング', link: '/patterns/16-api-versioning' },
							],
						},
						{
							label: 'フロント',
							items: [
								{ label: 'URLパラメータ', link: '/patterns/05-url-params' },
								{ label: 'Container / Presentation', link: '/patterns/06-container-presentation' },
								{ label: 'フォーム', link: '/patterns/08-form' },
								{ label: 'テスト', link: '/patterns/11-frontend-testing' },
							],
						},
					],
				},
				{
					label: '運用',
					items: [
						{ label: 'オブザーバビリティ概要', link: '/operations/00-observability' },
						{ label: 'ロギング', link: '/operations/01-logging' },
						{ label: 'エラートラッキング', link: '/operations/02-error-tracking' },
						{ label: 'モニタリング', link: '/operations/03-monitoring' },
						{ label: '障害対応', link: '/operations/04-incident-response' },
						{ label: '依存関係管理', link: '/operations/06-dependency-management' },
					],
				},
				{
					label: 'セキュリティ',
					items: [
						{ label: 'シークレット管理', link: '/security/01-secrets' },
						{ label: 'CORS/CSP', link: '/security/02-cors-csp' },
						{ label: '入力検証', link: '/security/03-input-validation' },
						{ label: 'チェックリスト', link: '/security/04-checklist' },
					],
				},
				{
					label: 'ガイド',
					items: [
						{ label: 'DB選定', link: '/guides/01-db' },
						{ label: '認証選定', link: '/guides/02-auth' },
						{ label: 'デプロイ選定', link: '/guides/03-deploy' },
						{ label: 'ローカルセットアップ', link: '/guides/04-local-setup' },
						{ label: '環境分離', link: '/guides/05-env-separation' },
						{
							label: 'AI向けコンテキスト',
							items: [
								{ label: 'コード規約', link: '/ai-context/01-coding-rules' },
								{ label: 'プロンプト', link: '/ai-context/02-prompt' },
								{ label: 'Coding Agent', link: '/ai-context/03-coding-agent' },
							],
						},
					],
				},
			],
		}),
	],
});
