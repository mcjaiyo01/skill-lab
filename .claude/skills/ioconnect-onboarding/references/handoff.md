# Handoff Document — IOCONNECT.md

The last deliverable of every engagement. The client's team will read this file instead of the product documentation — assume zero prior io.Connect knowledge and write accordingly: plain language, their app names, their data, their file paths. Not a changelog; a guided tour that leaves the reader able to extend the integration alone.

Write it to the repo root as `IOCONNECT.md`. Merge the verification steps into it (a separate VERIFICATION.md is fine for large integrations, but one file is easier to keep and share — default to one).

## Template

```markdown
# io.Connect in <their project name>

## What is io.Connect (60 seconds)
<2-3 short paragraphs, in terms of THEIR apps: one of your apps (X) is the
"platform" — it brokers all communication and must be open; the others connect
through it. Once connected, every app can call the others, share live data,
and be launched/arranged programmatically.>

## What we implemented
<One subsection per change, in reading order:>
### <e.g. The customers app is now the platform>
- What changed (files, with links) and what each piece does
- WHY this API was chosen for their need (one sentence, e.g. "shared context
  instead of channels because you wanted the apps always in sync, with no
  user choice involved")

## How to run it
<exact dev commands, ports, env vars incl. LICENSE_KEY handling>

## How to verify it works
<the runtime checks from verification.md, tailored: exact console snippets +
expected output, and the one real UI click-through per flow>

## Things to know
- The platform window must stay open; other apps must be opened THROUGH it
  (never directly by URL) — and what users see if they do it wrong
- Where the license key lives; what happens when it's invalid
- window.io is exposed for debugging <if done>; remove when convenient

## What we deliberately did NOT add (and how to add it)
<one bullet per item, each with a ready-to-paste snippet or a pointer:>
- <e.g. a channel picker UI — snippet included, place it in your toolbar>
- <e.g. workspaces (docked layouts) — what it would give them, what it involves>
- <other APIs that fit their stated needs but were out of scope>

## Learn more
<links: docs.interop.io sections relevant to WHAT THEY USE — not a link dump>
```

## Quality bar

- Every "why" ties back to something the client said or the code showed — never "because it's best practice".
- Snippets in "did NOT add" must be complete enough to paste (imports included) and marked with where they go.
- If the interview couldn't happen (non-interactive run), add an "Assumptions we made" section listing each assumption and what to tell us if it's wrong.
