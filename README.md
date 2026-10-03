# MergeSpech

> Evidence-based GitHub Pull Request analysis platform — açık kaynak, self-hosted ve **[muhammedkoca.com.tr](https://muhammedkoca.com.tr)** tarafından geliştirilmiştir.

MergeSpech, GitHub Pull Request süreçlerinde daha net review signal üretmek için tasarlanmış bir developer platformudur. Platform; signed webhook deliveries, diff-aware deterministic analysis, persistent findings ve güvenli worker boundary yaklaşımını bir araya getirir.

## Highlights

- GitHub webhook SHA-256 HMAC verification with constant-time comparison
- Idempotent delivery storage ve Redis/BullMQ analysis queue
- Pull request diff parsing ve changed-line-aware findings
- Secret exposure, dynamic execution ve debug output checks
- Prisma/PostgreSQL persistence model
- GitHub OAuth human login flow with protected session cookies
- GitHub App installation token support
- Content Security Policy, clickjacking ve MIME-sniffing protections
- Docker Compose ile web, worker, PostgreSQL ve Redis deployment

## Architecture

```text
GitHub Webhook → signature verification → PostgreSQL delivery record
→ Redis / BullMQ job → isolated worker (diff-only analysis)
→ persisted analysis run + findings
```

Worker repository command çalıştırmaz. Execution gerektiren future checks yalnızca ephemeral, non-privileged sandbox içinde uygulanmalıdır.

## Quick start

```bash
cp .env.example .env
npm install
docker compose up postgres redis -d
npm run db:generate
npm run db:migrate
npm run dev
```

Ayrı bir terminalde worker başlatın: `npm run worker`.

## Environment

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `GITHUB_APP_ID` | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key |
| `GITHUB_WEBHOOK_SECRET` | Minimum 16 character webhook secret |
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth client secret |
| `SESSION_SECRET` | Minimum 32 character session pepper |
| `APP_URL` | Public application URL |

Production ortamında secrets bir secret manager üzerinden sağlanmalıdır; `.env` dosyası commit edilmez.

## GitHub App setup

1. GitHub’da yeni bir App oluşturun.
2. Webhook URL olarak `https://your-domain/api/webhooks/github` girin.
3. `pull_request`, `installation` ve `installation_repositories` events seçeneklerini açın.
4. Minimum gerekli repository permissions uygulayın: metadata read, pull requests read, contents read-only ve checks write (Checks publishing etkinleştirildiğinde).
5. Webhook secret değerini `GITHUB_WEBHOOK_SECRET` olarak tanımlayın.

## Security notes

- GitHub signature JSON parse işleminden önce doğrulanır.
- Delivery IDs unique tutulur; replay veya duplicate job oluşumu engellenir.
- Session token database içinde plain text olarak saklanmaz.
- Secret rule çıktısı potansiyel sır değerini finding evidence içine yazmaz.
- UI, CSP ve security response headers ile korunur.

No software can honestly promise zero vulnerabilities. Production deployment öncesinde dependency scanning, threat modeling, secret rotation, access review ve bağımsız security testing yapılmalıdır.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## License

MIT — detaylar için [LICENSE](LICENSE) dosyasına bakın.

## Made by

MergeSpech açık kaynak bir project’tir ve **[muhammedkoca.com.tr](https://muhammedkoca.com.tr)** tarafından geliştirilmiştir.
