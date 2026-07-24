# RBAC Matrix — Admin Panel

## Roles

| Role     | Hierarchy Level | Description                       |
| -------- | --------------- | --------------------------------- |
| `admin`  | 3               | Full access to all admin features |
| `editor` | 2               | Content and analytics only        |
| `user`   | 1               | No admin access                   |

## Route/Action Access Matrix

| Route/Action                           |       Anonymous |            User |    Editor | Admin | Required Guard                                  |
| -------------------------------------- | --------------: | --------------: | --------: | ----: | ----------------------------------------------- |
| **Pages**                              |                 |                 |           |       |                                                 |
| `/admin`                               | ❌ 302→/account | ❌ 302→/account |        ✅ |    ✅ | Server-side session + role check                |
| `/admin/analytics`                     | ❌ 302→/account | ❌ 302→/account |        ✅ |    ✅ | Server-side session + role check                |
| `/admin/content`                       | ❌ 302→/account | ❌ 302→/account |        ✅ |    ✅ | Server-side session + role check                |
| `/admin/tools`                         | ❌ 302→/account | ❌ 302→/account |        ✅ |    ✅ | Server-side session + role check                |
| `/admin/users`                         | ❌ 302→/account | ❌ 302→/account | ❌ hidden |    ✅ | Server-side session + role check                |
| `/admin/site-settings`                 | ❌ 302→/account | ❌ 302→/account | ❌ hidden |    ✅ | Server-side session + role check                |
| `/admin/monetization`                  | ❌ 302→/account | ❌ 302→/account | ❌ hidden |    ✅ | Server-side session + role check                |
| `/admin/ops`                           | ❌ 302→/account | ❌ 302→/account | ❌ hidden |    ✅ | Server-side session + role check                |
| `/admin/audit`                         | ❌ 302→/account | ❌ 302→/account | ❌ hidden |    ✅ | Server-side session + role check                |
| `/admin/funnel`                        | ❌ 302→/account | ❌ 302→/account |        ✅ |    ✅ | Server-side session + role check                |
| `/admin/google-search-console`         | ❌ 302→/account | ❌ 302→/account |        ✅ |    ✅ | Server-side session + role check                |
| `/dashboard`                           | ❌ 302→/account | ❌ 302→/account |        ✅ |    ✅ | Server-side session + role check                |
| **API Endpoints**                      |                 |                 |           |       |                                                 |
| `GET /api/admin/analytics`             |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest`                       |
| `GET /api/admin/audit`                 |          ❌ 403 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest` + CSRF                |
| `GET /api/admin/content`               |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest`                       |
| `POST /api/admin/content`              |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest` + CSRF + rate limit   |
| `PUT /api/admin/content`               |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest` + CSRF + rate limit   |
| `PATCH /api/admin/content`             |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest` + CSRF + rate limit   |
| `DELETE /api/admin/content`            |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest` + CSRF + rate limit   |
| `GET /api/admin/tools`                 |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest`                       |
| `POST /api/admin/tools`                |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest` + CSRF                |
| `GET /api/admin/users`                 |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest`                       |
| `GET /api/admin/users/[id]`            |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest`                       |
| `PATCH /api/admin/users/[id]`          |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest` + CSRF                |
| `GET /api/admin/site-settings`         |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest` + CSRF + rate limit   |
| `PUT /api/admin/site-settings`         |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest` + CSRF + rate limit   |
| `GET /api/admin/pricing`               |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest`                       |
| `POST /api/admin/pricing`              |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest` + CSRF + rate limit   |
| `GET /api/admin/monetization`          |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest` + rate limit          |
| `POST /api/admin/monetization`         |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest` + CSRF + rate limit   |
| `GET /api/admin/ops`                   |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest` or token + rate limit |
| `GET /api/admin/ops/actions`           |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest`                       |
| `POST /api/admin/ops/actions`          |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest` + CSRF                |
| `GET /api/admin/ops/system-info`       |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest`                       |
| `GET /api/admin/ops/logs`              |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest`                       |
| `GET /api/admin/ops/health-history`    |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest`                       |
| `GET /api/admin/funnel`                |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest`                       |
| `POST /api/admin/funnel`               |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest` + CSRF                |
| `GET /api/admin/newsletter`            |          ❌ 401 |          ❌ 403 |    ❌ 403 |    ✅ | `requireAdminFromRequest`                       |
| `GET /api/admin/google-search-console` |          ❌ 401 |          ❌ 403 |        ✅ |    ✅ | `requireAdminFromRequest`                       |

## Auth Mechanism

- **Session**: Cookie-based (`pt_session`), httpOnly, secure, sameSite=lax
- **Admin identification**: `role === 'admin'` OR email in `ADMIN_EMAIL_ALLOWLIST` env
- **CSRF**: `isSameOrigin()` check on Origin/Referer headers for all POST/PUT/PATCH/DELETE
- **Rate limiting**: 60 req/60s on sensitive routes via `adminSiteSettings` policy

## Security Notes

1. All admin routes use server-side `requireAdminFromRequest()` — client-side sidebar hiding is UX only, not security
2. Editor role is restricted to content/analytics/read-only — cannot access users, settings, monetization, ops, audit
3. PM2 actions use `execFileSync` (not shell string) to prevent command injection
4. Environment variable values are never exposed — only configured/missing/empty status
5. Audit log is append-only to PostgreSQL with in-memory fallback
