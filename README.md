# Elite Coding School

A responsive offline-institute platform with a public course catalogue, student portal, and admin operations panel.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the HLD/LLD structure. Pages call route handlers; route handlers validate requests and call domain services/models. Authorization is always derived from the server-side session.

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Required `.env.local` values:

- `MONGODB_URI` — use a MongoDB replica set for enrollment/payment transactions.
- `JWT_SECRET` — a high-entropy secret, unique per environment.
- SMTP variables (`SMTP_HOST`, `SMTP_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `SENDER_EMAIL`) for OTP delivery.
- Cloudinary variables for profile and course/banner media.
- Google OAuth variables, with `GOOGLE_OAUTH_REDIRECT_URI` registered exactly in Google Cloud.

Never commit `.env.local` or reuse the development database in production.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

The same checks run in GitHub Actions for pull requests and pushes to `main`.

## Health monitoring

`GET /api/health` performs a database ping and returns `503` if the service is not ready. Configure the deployment platform or an external monitor to poll this endpoint.

## Container deployment

The repository includes a production `Dockerfile` and a detailed [deployment runbook](docs/deployment.md).

## Production checklist

- Configure a production MongoDB replica set and backups.
- Add the production host to Google OAuth redirect URIs.
- Configure SMTP and Cloudinary production credentials.
- Set secure environment variables in the deployment platform.
- Exercise registration/OTP, Google sign-in, payment idempotency, receipt download, and authorization boundaries against a non-production database.
- Monitor application errors, database health, email delivery, storage usage, and payment audit logs.
- Keep a deployment rollback artifact and verify restore procedures before launch.
- Configure a shared rate-limit store for horizontally scaled production deployments; the built-in limiter is process-local.
