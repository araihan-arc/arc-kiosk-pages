# Kiosk Arcade

Four touch-friendly games in a single HTML file of about 210 KB, most of which is the 975-question trivia bank, with no frameworks, images, fonts or network requests:

- **Tic-Tac-Toe**: 1 player vs CPU (Easy / Normal / Impossible) or 2 players, with a running scoreboard, animated marks, a win line and confetti.
- **Orbit Run**: a four-stage rocket arcade game.
  1. **Ascent**: steer to dodge birds, balloons, drones and debris. Hold BURN to climb faster, which uses booster fuel.
  2. **Hot staging**: tap STAGE while the needle is in the green.
  3. **Booster catch**: guide the falling booster onto the tower arms. Hold BURN to slow down and land below the safe sink speed.
  4. **Orbit**: shoot aliens and grab fuel/ammo/shield pickups until you reach orbit altitude.

  **Controls:** drag anywhere on the screen to steer, plus one action button whose label changes with the stage: LAUNCH, BURN, STAGE, FIRE, RETRY. Each level is faster.
- **Jungle Dash**: a three-lane endless runner. Swipe left or right to change lane, swipe up (or tap) to jump over logs, and swipe down to slide under stone arches. Avoid the stone-face blocks and collect coins worth 10 points each. The runner speeds up every 500 m, and one crash ends the run.

- **Trivia Challenge**: multiple-choice quiz with three levels: **Easy**, **Normal** and **You Serious?**.
  - Each level has more than 300 questions (975 in total). Topics include geography, history, animals and nature, the human body, space, art, music, books, myths, food, sport, language and Malaysia.
  - There are no maths, chemistry, physics or politics questions.
  - A round is 15 questions in three stages of five: **Warm-up**, **Tricky** and **Tough**. Each stage draws from a harder pool than the one before.
  - Questions don't repeat until every question in a stage's pool has been used, which takes about 20 rounds per level. The kiosk remembers this between sessions.
  - Players have 3 lives and a countdown timer (faster answers score more). They can use a 50:50 and a Skip once per round. A perfect round earns a bonus.
  - The end screen lists the questions the player missed, with the right answers.

Orbit Run, Jungle Dash and each Trivia level keep their own top-5 high score table with arcade-style initials, saved on the device.

## Editing the trivia questions

The questions are also in `questions/easy.txt`, `questions/normal.txt` and `questions/serious.txt`, one per line: `Question|Correct answer|Wrong|Wrong|Wrong`. Each file has three sections: `## 1` warm-up, `## 2` tricky and `## 3` tough. After editing, run `python3 questions/build.py`. It checks the files and writes the questions into `index.html`.

## Host on GitHub Pages

1. Create a new public repo, for example `kiosk-arcade`.
2. Upload `index.html`, `sw.js`, this README and the `questions` folder to the root of the repo.
3. Go to **Settings → Pages → Build and deployment**, set Source to **Deploy from a branch**, then choose the `main` branch and the `/ (root)` folder.
4. After about a minute the site is live at `https://<your-user>.github.io/kiosk-arcade/`.

`sw.js` caches the game after the first visit, so the kiosk keeps working if the network drops. When you push an update, the kiosk picks it up on its **second** reload, because the first reload is served from the cache while the new version downloads in the background.

## Kiosk setup (RK3588)

**Linux (Debian/Ubuntu images) with Chromium:**

```bash
chromium --kiosk --noerrdialogs --disable-infobars \
  --autoplay-policy=no-user-gesture-required \
  --ignore-gpu-blocklist --enable-gpu-rasterization \
  --overscroll-history-navigation=0 --disable-pinch \
  "https://<your-user>.github.io/kiosk-arcade/?nocursor"
```

- `--ignore-gpu-blocklist` and `--enable-gpu-rasterization` let Chromium use the Mali GPU, which keeps the canvas game at a smooth 60 fps.
- Don't use `--incognito`, or the high scores will reset every time the browser starts.

**Android images:** use any kiosk browser app, such as Fully Kiosk Browser, pointed at the same URL.

## URL options

| Option | Effect |
|---|---|
| `?nocursor` | Hides the mouse cursor (for touch-only screens) |
| `?idle=90` | Seconds without input before the kiosk returns to the home screen (default 60) |
| `?solo=trivia` | Shows only one game, with no arcade home screen. The game's Back button and the idle reset return to its own start screen. Also works with `ttt`, `orbit` and `runner` |

You can combine them: `?nocursor&idle=120`.

## Kiosk-friendly behaviour

- Works in landscape and portrait, from a small window up to a full 43" screen. Every screen re-lays itself out when the window is resized.
- On 4K panels the games render at about 1080p and the browser scales the picture up, so the RK3588 stays smooth.
- Touch only: drag and swipe gestures, plus one big action button in Orbit Run. Multi-touch lets players steer with one hand while holding BURN or FIRE with the other.
- Keyboard also works for testing: arrow keys and Space, plus F to fire in Orbit Run. Esc goes home.
- Blocks pinch-zoom, double-tap zoom, the long-press menu and pull-to-refresh.
- Returns to the home screen after a period with no input. An unsaved high score is saved before it does.
- All sound is generated in code with the Web Audio API. The speaker button mutes it, and the setting is remembered.
- Rendering is capped at 2× pixel density, and each animation loop only runs while its screen is visible.
