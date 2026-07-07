# 🎮 FunHub

A multi-game arcade site with a **shared leaderboard** — everyone who visits
this GitHub Pages site sees the same scores. It's built as plain HTML/CSS/JS,
so it needs no build step and works instantly on GitHub Pages.

## What's live right now

- ♟️ Chess vs AI (Easy / Medium / Hard / **Dumb Ah Mode**)
- 🖱️ CPS Test
- ⌨️ Typing Speed Test
- ➗ Rigged Math Quiz
- 📅 Weekday Calculator
- ⚡ Reaction Time Test

The other 14 games are stubbed on the home page as "SOON".

## Shared leaderboard setup

GitHub Pages only hosts static files, so the leaderboard uses Supabase (a free
hosted database) to store scores. See the setup steps in chat, or ask again
if you need them repeated — you'll need to:

1. Create a free Supabase project.
2. Run the SQL to create the `scores` table.
3. Paste your Supabase URL and anon key into `config.js`.

Until that's done, the site still works fine — leaderboards just show
"not connected yet."

## Notes on the games

- **Chess "Dumb Ah Mode"**: the AI plays legal-but-chaotic moves, leans
  toward moves that check you, and taunts you after every move. If you ever
  check its king, it deletes the offending piece and shows "MY GAME MY RULE."
- All player names are stored in the browser (`localStorage`) so returning
  players don't retype their name each time.
