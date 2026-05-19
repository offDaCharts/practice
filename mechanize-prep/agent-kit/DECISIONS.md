# Decisions Log

> Append one line each time you make a non-obvious choice. Format:
>
> `**<decision>** — <why, one sentence>`
>
> Keep entries crisp. The goal is that someone (or future-you) reading this in a week understands the shape of the project without re-deriving it.

## Examples (delete before final)

- `**Using Postgres over SQLite** — multi-writer concurrency matters here and SQLite's write lock would bottleneck.`
- `**Single shared state object on the server, broadcast on change** — fewer moving parts than per-entity subscriptions; revisit if list grows beyond ~1k items.`
- `**Last-write-wins on conflicting edits** — simplest correct policy for this scope; proper conflict resolution (CRDT/OT) is deferred and noted in PLAN.md.`

## Decisions

_(start here)_
