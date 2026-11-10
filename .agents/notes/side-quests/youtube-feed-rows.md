---
name: Side quests section reads the YouTube Atom feed
description: Why the home page YouTube section is rows from the public feed, capped at 4, with no view counts
---

The home page "Side quests" section (`side-quests.tsx`, data in `lib/youtube.ts`) lists the newest
uploads from the YouTube channel. Decided 2026-11-10 with Sharath, who picked the name.

- **Source is the public per-channel Atom feed**, not the YouTube Data API. No key or login, and it
  has everything shown (id, title, link, date). It has no durations or video type; Shorts are
  detected from the `/shorts/` link.
- **Rows with a hover thumbnail, not a big embed or card grid.** The channel is small and the
  content is AI-made songs, not dev work, so it sits last on the page and stays quiet. A featured
  player was mocked and rejected as too loud for it.
- **Capped at 4, never labelled "recent", no view counts.** Uploads come a few times a year and
  views are in the tens to low hundreds; older uploads are unrelated gaming clips.
- **Titles are cleaned.** Bracketed tags like `[AI Generated Content]` and `(Lyrics)` are stripped
  and turned into the row's kind. The section subtitle carries the AI disclosure once instead.
- **Feed failure hides the section.** The fetch has a 2.5s timeout because the home page SSR waits
  on it; errors are logged and return an empty list.
