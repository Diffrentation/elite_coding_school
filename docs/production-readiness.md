# Production Readiness Architecture

## System design

The application is a Next.js full-stack application. Public pages, student portal pages, and the administrator portal call route handlers under `src/app/api`. Route handlers validate input with Zod, enforce session roles on the server, and use Mongoose models as the single source of truth.

```
Browser UI -> Next.js route handler -> validation + authorization -> MongoDB model
                                            |-> SMTP (OTP delivery)
                                            |-> Cloudinary (image assets)
                                            |-> PDFKit (receipts)
```

## Business entities and relationships

| Entity                             | Relationship / responsibility                                          |
| ---------------------------------- | ---------------------------------------------------------------------- |
| User                               | Authentication identity; has a student or administrator role.          |
| Student                            | One-to-one profile for an activated student User.                      |
| Course                             | Admin-managed published programme and syllabus.                        |
| EnrollmentRequest                  | Student request to join one published Course.                          |
| Enrollment                         | Approved student-to-course relationship, with fee and batch snapshots. |
| FeeInvoice                         | One invoice per enrollment/month.                                      |
| Payment                            | Immutable payment record belonging to one invoice and enrollment.      |
| HeroBanner                         | Admin-managed public homepage banner.                                  |
| Inquiry                            | Public contact/demo lead.                                              |
| StudentQuery                       | Student support conversation with admin messages.                      |
| SiteSettings                       | Public institute profile/contact data.                                 |
| Otp / Session / AuditLog / Counter | Internal identity, security, audit, and sequential-number support.     |

## API ownership and permissions

| Module           | Public/student capability                     | Administrator capability                          |
| ---------------- | --------------------------------------------- | ------------------------------------------------- |
| Courses          | Read published courses and request enrollment | Create, update, publish, archive                  |
| Banners          | Read published banners                        | Create, update, publish, archive                  |
| Inquiries        | Create a demo/admission lead                  | List and change lead state                        |
| Enrollments      | View own enrollments/requests                 | Create direct enrollment; approve/reject requests |
| Fees             | View own invoices, payments, receipts         | Issue invoice, record payment, generate receipt   |
| Queries          | Create/view own support query                 | List, reply, change status                        |
| Profile/settings | Manage own profile, password and email        | Manage public institute settings                  |

## Database-first rules

- Public course cards, course detail records, and inquiry programme choices are loaded from `/api/courses`.
- Empty API responses render empty states; the UI must not replace them with fabricated course records.
- Administrative mutations require an administrator session in the route handler.
- Student routes derive ownership from the session; no user ID is trusted from the browser.
- Enrollment, payment, and verification workflows use database writes and transactions where atomicity is required.

## External dependencies

| Dependency      | Required configuration                                              | Behaviour when unavailable                                              |
| --------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| MongoDB         | `MONGODB_URI`                                                       | Requests cannot persist/read business data.                             |
| SMTP            | `SMTP_HOST`, `EMAIL_USER`, `EMAIL_PASS`, optional port/from address | OTP and password-reset requests return a service-unavailable error.     |
| Cloudinary      | Cloud name, API key, API secret                                     | Upload falls back to local disk; not durable for serverless deployment. |
| Google OAuth    | Google client credentials and callback URL                          | Google login cannot be used.                                            |
| Payment gateway | Provider account, webhook signing secret                            | Payments remain admin-recorded only; no online collection is claimed.   |

## Remaining production work

1. Configure durable Cloudinary storage; remove local-disk upload fallback for serverless production.
2. Select and integrate an online payment provider before offering online payments.
3. Add a batch/fee/date decision step to enrollment-request approval.
4. Add admin audit-log browsing and server-side CSV exports for large datasets.
5. Replace in-memory rate limiting with Redis/Upstash for multi-instance production.
6. Add API integration and end-to-end tests using an isolated MongoDB test database.
