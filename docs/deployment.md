# Deployment runbook

## Build and run

The production container uses Next.js standalone output and runs as an unprivileged user.

```bash
docker build -t elite-coding-school:latest .
docker run --rm -p 3000:3000 --env-file .env.production elite-coding-school:latest
```

The service must receive all values in `.env.example`, with a production MongoDB replica-set URI and a high-entropy `JWT_SECRET`.

## Before releasing

1. Register the exact production Google OAuth callback URL in both Google Cloud and the Vercel Production environment variable `GOOGLE_OAUTH_REDIRECT_URI`. For this deployment it is `https://elite-coding-school-beryl.vercel.app/api/auth/google/callback` (no trailing slash).
2. Verify SMTP delivery and Cloudinary uploads using non-production accounts.
3. Confirm MongoDB backups and perform a restore drill.
4. Poll `GET /api/health` from the deployment health checker. It returns `503` if MongoDB is unavailable.
5. Configure central error monitoring and alerts for failed health checks, OTP delivery, storage failures, and payment audit events.
6. Keep the prior container image available for rollback.

## Post-release smoke test

Verify registration and email OTP, authenticated login, Google login, profile image upload, course enrollment, invoice/payment idempotency, receipt download, and admin/student authorization boundaries against the deployed environment.
