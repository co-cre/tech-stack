// 開発用シードデータ
// 使用方法: wrangler d1 execute event-ticket --local --file=./seed.sql

export const seedSQL = `
-- イベント作成
INSERT INTO events (id, title, description, venue, starts_at, ends_at, status, created_at, updated_at)
VALUES
  ('event-001', 'テックカンファレンス 2025', '最新技術トレンドを学ぶカンファレンス', '東京国際フォーラム', 1735689600, 1735718400, 'published', 1704067200, 1704067200),
  ('event-002', 'クラウドネイティブ Meetup', 'Kubernetes, サーバーレス勉強会', '渋谷スクランブルスクエア', 1736294400, 1736305200, 'published', 1704067200, 1704067200);

-- チケット種別作成
INSERT INTO ticket_types (id, event_id, name, description, price, quantity, sold_count, created_at, updated_at)
VALUES
  ('ticket-type-001', 'event-001', '一般', '一般参加チケット', 5000, 100, 0, 1704067200, 1704067200),
  ('ticket-type-002', 'event-001', 'VIP', '前方席 + 懇親会参加', 10000, 20, 0, 1704067200, 1704067200),
  ('ticket-type-003', 'event-001', '学生', '学生割引チケット（要学生証）', 2000, 30, 0, 1704067200, 1704067200),
  ('ticket-type-004', 'event-002', '一般', '一般参加チケット', 0, 50, 0, 1704067200, 1704067200);
`
