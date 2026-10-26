# Elite Coding School architecture

## HLD

The system is organized into three clients—public website, student portal, and admin panel—served by one Next.js application. Route handlers expose the application API. Domain services enforce business rules; MongoDB persists domain records; object storage is reserved for images and receipt PDFs.

```text
Browser -> Next.js pages -> route handlers -> services -> Mongoose models -> MongoDB
                                      |-> mail / OTP provider
                                      |-> Google OAuth
                                      |-> object storage / receipt generation
```

Bounded modules are: identity, student profile, courses, banners, queries, admissions, fees, receipts, inquiries, and audit/security. Every module owns its validation schema, service rules, models, and API routes. Pages never access the database directly.

## LLD conventions

- `src/models`: persistence schemas and indexes only.
- `src/lib`: cross-cutting infrastructure such as DB connection, response helpers, tokens, logging, and authorization.
- `src/modules/<domain>`: Zod input schema, service, repository/query helpers, and domain-specific types.
- `src/app/api`: thin route handlers: authenticate, validate, call a service, serialize the standard API response.
- `src/app`: presentation only; client components call APIs and do not enforce security.

Sensitive create operations use an idempotency key. Updates use document `version` values for optimistic concurrency. Financial writes use MongoDB transactions with conditional balance updates. Every authorization decision derives identity from the server-side session, never request-body user IDs.

## Phase order

Phase 02 establishes the `identity` module and reusable session/authorization boundary. Each later module plugs into that boundary rather than implementing its own auth, validation, or database connection logic.
