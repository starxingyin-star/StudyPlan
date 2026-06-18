# Add Family Membership Auth

## Why

The current app uses a fixed `family-main` family and a shared PIN (`2468`) for protected operations. If someone can open the mini program and knows the PIN, the backend has no server-side way to prove whether that caller belongs to the family. Some actions also currently rely only on the default family id.

## What Changes

- Bind every authenticated WeChat caller to a family through server-side `openid` membership records.
- Replace fixed family access with a server-resolved `familyId`.
- Add backend actions for creating a family, creating an invite token, and joining a family by invite token.
- Keep family PIN as a second confirmation for sensitive in-family actions.
- Return an explicit setup state when a user has no family membership yet.
- Add a minimal "create family / join by invite code" entry from the Mine page.

## Non-Goals

- Full role management UI.
- Multiple simultaneous family switching.
- Production-grade invite expiration controls beyond a bounded token record.
- Migrating existing production data beyond a compatible default-family bootstrap for local/test usage.

## Impact

- Cloud handlers must stop relying on `DEFAULT_FAMILY_ID` for caller-scoped operations.
- Existing pages must handle `needsFamilySetup` from `bootstrapFamily`.
- Tests must cover membership resolution and family-scoped access behavior.
