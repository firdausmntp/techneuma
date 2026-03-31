# Authentication and Session Review

Authentication answers who the caller is. Authorization answers what they may do. Review both every time.

## Authentication Checks

- Verify password, magic-link, OAuth, SSO, or API key flows fail closed.
- Confirm secrets, reset tokens, and verification tokens are single-purpose and time-bounded.
- Rotate sessions after privilege changes, password resets, and sensitive identity events.
- Store password hashes with modern algorithms and safe parameters when applicable.
- Protect credential entry and callback endpoints with rate limiting and abuse detection.

## Session and Token Handling

- Prefer short-lived access tokens and explicit refresh behavior.
- Bind token scope to the minimum required audience and permissions.
- Ensure logout and revocation semantics are real, not cosmetic.
- Treat remember-me and device-trust features as privileged surfaces.
- Avoid putting long-lived secrets in local storage when a safer session mechanism exists.

## Authorization Checks

- Enforce resource ownership on the server for every read and write path.
- Verify tenant ids come from trusted server context, not mutable client input.
- Review admin and support tooling for bypass paths that lack audit logs.
- Check background jobs, queues, and webhooks for the same authorization assumptions as request handlers.

## Sensitive Operations

Apply extra scrutiny to:
- billing and payout changes
- role or permission changes
- data export and deletion
- key rotation and webhook secret updates
- impersonation and support-access features

## Red Flags

- UI-only authorization
- reusable password reset links
- session cookies missing secure settings
- bearer tokens logged in plaintext
- access to another tenant by changing a path or query identifier
