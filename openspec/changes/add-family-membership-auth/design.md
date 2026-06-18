# Design

## Model

Server-side identity is based on WeChat cloud `openid`, obtained from `cloud.getWXContext().OPENID` in the cloud function entrypoint. The client never decides which family it can access.

Collections added:

- `familyMembers`: maps `openid` to `familyId`, role, and status.

Invite state is stored on the `families` document as the current active invite token. This avoids requiring a separate invite collection for the first release.

Family data remains in existing collections, but all reads and writes use the caller's resolved `familyId`.

## Flow

1. A caller opens the app.
2. `bootstrapFamily` resolves the caller's `openid`.
3. If no active membership exists, it returns `needsFamilySetup: true`.
4. The Mine page can create a family or join with an invite token.
5. Creating a family writes:
   - a `families` document
   - a `familyMembers` owner record for the caller
   - default members/rewards/tasks for the new family
6. Inviting creates a 6-character uppercase alphanumeric code scoped to the caller's family and stores it on that family document.
7. Joining validates the code and writes a `familyMembers` active member record for the joining `openid`.

## Authorization

All family-scoped handlers receive an `auth` object from the cloud function entrypoint:

```js
{
  openid,
  familyId,
  role,
  member
}
```

Handlers that require an existing family call `requireFamilyAuth`. Handlers that support first-run setup use optional auth and return setup state.

PIN verification remains on sensitive operations, but it is checked only after family membership is confirmed.

## Invite Codes

Invite codes use a 32-character alphabet (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`) to avoid confusing `0/O` and `1/I`. Six characters gives 32^6 combinations, about 1.07 billion possibilities.

The cloud function generates the code server-side, queries active unexpired invites for the same code, and retries before saving if there is a collision. When joining, the server rejects a code if it unexpectedly matches multiple active, unexpired families, so duplicated data cannot send someone into the wrong family. The client only displays or submits the code; it does not create invite codes.

Current invite state remains on the `families` document to keep the first release simple:

```js
{
  currentInviteToken,
  currentInviteStatus,
  currentInviteExpiresAt,
  inviteCreatedByOpenid,
  inviteCreatedAt
}
```

The public response still uses `token` for compatibility with the existing page wiring, but its value is the short invite code.

## Collection Creation

The API entrypoint does not run a full core-collection preflight before each action. Reads against missing collections return empty data where that is safe, and writes create only the missing target collection before retrying once. This avoids making every cloud function call pay for multiple collection probes while still allowing a fresh cloud database to recover from missing `familyMembers`.

## Compatibility

Default seed data is changed from a global `family-main` seed to a family-scoped seed. Tests and local development can still use deterministic ids where useful, but runtime handlers must use the caller's resolved `familyId`.

## Risks

- Existing users with data under `family-main` need a migration if deployed to a live environment.
- Invite codes are sensitive enough to allow family joining, so they are time-limited and should remain revocable in a later hardening pass.
