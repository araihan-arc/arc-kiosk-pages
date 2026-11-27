# Tic-Tac-Toe Arena

A competitive, touch-only tic-tac-toe game for the 43" RK3588 kiosk. It's a single ~50 KB HTML file with no downloads, fonts, images or network requests.

## Three boards
| Board | Rules |
|---|---|
| **Classic** | 3×3, get 3 in a row. |
| **Vanish** | 3×3, but each player can only have 3 marks on the board. Placing a 4th makes your oldest one vanish, and it's highlighted with a dashed outline as a warning. There are no draws. |
| **Mega 5×5** | Bigger board: get 4 in a row. |

## Challenge Ladder (1 player)
Fight five robot rivals in a row. Each one plays a different board and is tougher than the last:
1. **R-00KIE**: Classic. Makes lots of mistakes.
2. **CLEO-3**: Classic. Rarely misses a win or a block.
3. **PHANTOM**: Vanish. Thinks 4 moves ahead.
4. **QUADRA**: Mega 5×5. Thinks 3 moves ahead.
5. **GRANDMASTER ZEN**: Vanish. Thinks 6 moves ahead, with a 6-second shot clock (the final boss).

How the ladder works:
- Win 2 games to beat each rival. Losing a game costs one of your 3 lives.
- You start with 1 **bomb** and earn another for every rival you beat. A bomb blows up one of the rival's marks, and using it counts as your move.
- Points come from wins, scaled by the rival's level, plus a speed bonus for moving fast against the shot clock. Draws give small points.
- Beating everyone gives a champion bonus, plus extra for each life left.
- The top 10 scores go into the **Hall of Fame** with 3-letter initials, saved on the kiosk.

## Versus (2 players)
Choose the board, the match length (1 game, first to 2 or first to 3), a shot clock (off, 5 s or 10 s) and the bomb power-up (1 per player per game). The first move alternates every game. If the shot clock runs out, a random move is placed for you.

## Host on GitHub Pages
1. Create a repo, for example `ttt-arena`, and upload `index.html`, `sw.js` and this README.
2. Go to **Settings → Pages**, then deploy from the `main` branch, `/ (root)` folder.
3. Point the kiosk at `https://<your-user>.github.io/ttt-arena/`.

The service worker keeps the game working offline after the first visit. An update you push appears on the kiosk's second reload.

## Kiosk setup (Linux Chromium)
```bash
chromium --kiosk --noerrdialogs --disable-infobars --autoplay-policy=no-user-gesture-required \
  --ignore-gpu-blocklist --enable-gpu-rasterization --overscroll-history-navigation=0 --disable-pinch \
  "https://<your-user>.github.io/ttt-arena/?nocursor"
```
Don't use `--incognito`, or the Hall of Fame will be wiped every time the browser restarts.

| URL option | Effect |
|---|---|
| `?nocursor` | Hides the mouse cursor |
| `?idle=90` | Seconds without a touch before the game returns to the main menu (default 60) |

Other kiosk-friendly behaviour:
- Pinch-zoom, double-tap zoom and the long-press menu are blocked.
- When the idle timer sends the game back to the menu, any high score still waiting for initials is saved first.
- All sound is generated in code, and the sound setting is remembered.
- Rendering is capped at about 1080p, so 4K panels stay smooth.
