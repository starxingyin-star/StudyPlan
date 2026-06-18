# Tasks

- [x] Add membership/auth pure helpers and tests.
- [x] Extend DB helpers with `familyMembers`, family invite state, and family-scoped seeding.
- [x] Pass WeChat `openid` from the cloud function entrypoint into handlers.
- [x] Add create-family, create-invite, and join-family actions.
- [x] Update existing family-scoped handlers to use resolved `familyId`.
- [x] Add minimal Mine page create/join/invite UI wiring.
- [x] Run targeted auth tests and full test suite.
- [x] Change family invites to 6-character alphanumeric codes with server-side active collision checks.
- [x] Replace API-wide collection preflight with lazy missing-collection handling and rerun targeted/full tests.
