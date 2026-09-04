# Session API

Public, unauthenticated v1 for agents (and curl). CORS is open on this route only (`Access-Control-Allow-Origin: *`).

Base: `https://tabata-production.up.railway.app`  
Local: `http://127.0.0.1:43173`

## `POST /api/session`

JSON body. Every field is optional.

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `mode` | `"tabata"` \| `"interval"` \| `"emom"` | `tabata` | See modes below |
| `work` | number | `20` (or `interval_sec` in EMOM) | Seconds. Clamped to 1–600 |
| `rest` | number | `10` | Seconds. Clamped to 0–300. Tabata/interval only |
| `exercises` | number | `8` | Per round. Clamped to 1–30 |
| `rounds` | number | `1` | Clamped to 1–30. In EMOM this is the number of rounds of minutes |
| `round_rest` | number | `60` | Seconds between rounds. Tabata/interval only. Clamped to 0–600 |
| `interval_sec` | number | `60` | EMOM interval length. Clamped to 5–600 |
| `title` | string | — | Shown on the guest timer. Max 80 characters |
| `spotify` | string | — | `open.spotify.com` album/playlist/track URL, or `spotify:` URI |
| `auto_start` | boolean | `false` | `true` / `1` starts the workout when the deep link opens |

CamelCase aliases (`roundRest`, `intervalSec`, `autoStart`) are accepted.

Response `200`:

```json
{
  "ok": true,
  "mode": "tabata",
  "title": null,
  "settings": {
    "work": 20,
    "rest": 10,
    "exercises": 8,
    "rounds": 1,
    "roundRest": 0,
    "intervalSec": 60
  },
  "spotify": {
    "input": "https://open.spotify.com/album/6Nb3e1x9a1IHlbUDtYK52s",
    "embedUrl": "https://open.spotify.com/embed/album/6Nb3e1x9a1IHlbUDtYK52s",
    "openUrl": "https://open.spotify.com/album/6Nb3e1x9a1IHlbUDtYK52s"
  },
  "autoStart": false,
  "url": "https://…/tabata?mode=tabata&work=20&…"
}
```

`url` is an absolute guest-timer deep link. Open it on `/tabata` (no account). Invalid Spotify or `mode` returns `400` with `{ "ok": false, "error": "…" }`.

## `GET /api/session`

Same fields as query string. Same JSON.

## `OPTIONS /api/session`

CORS preflight.

## Modes

**tabata** and **interval** use the same engine: `work` / `rest` between exercises, `rounds` of `exercises`, and `round_rest` between rounds.

**emom** is every-minute-on-the-minute (or every `interval_sec`):

- Total intervals = `exercises × rounds` (same grid as Tabata). Example: `exercises: 1`, `rounds: 10` → 10 minutes.
- Default: one work phase of `interval_sec` per interval. The athlete does reps and rests for the remainder of the minute; the timer counts the whole interval.
- Optional `work` shorter than `interval_sec` splits the interval into work + implied rest (`interval_sec − work`).
- `round_rest` is not used. Rest belongs inside the minute.

## Spotify

Accepted:

- `https://open.spotify.com/album/{id}`
- `https://open.spotify.com/playlist/{id}`
- `https://open.spotify.com/track/{id}`
- `https://open.spotify.com/intl-xx/…` and `/embed/…` variants
- `spotify:album:{id}`, `spotify:playlist:{id}`, `spotify:track:{id}`

`si=` tracking is stripped. The guest timer shows a compact official embed plus **Åpne i Spotify**.

## Curl

Tabata + Jonathan’s album:

```bash
curl -sS -X POST https://tabata-production.up.railway.app/api/session \
  -H 'Content-Type: application/json' \
  -d '{
    "work": 20,
    "rest": 10,
    "exercises": 8,
    "rounds": 1,
    "round_rest": 0,
    "spotify": "https://open.spotify.com/album/6Nb3e1x9a1IHlbUDtYK52s?si=WKouai5OSges6UhQAxbYWQ",
    "auto_start": false
  }'
```

```bash
curl -sS -G https://tabata-production.up.railway.app/api/session \
  --data-urlencode 'work=20' \
  --data-urlencode 'rest=10' \
  --data-urlencode 'exercises=8' \
  --data-urlencode 'rounds=1' \
  --data-urlencode 'round_rest=0' \
  --data-urlencode 'spotify=https://open.spotify.com/album/6Nb3e1x9a1IHlbUDtYK52s?si=WKouai5OSges6UhQAxbYWQ'
```

EMOM:

```bash
curl -sS -X POST https://tabata-production.up.railway.app/api/session \
  -H 'Content-Type: application/json' \
  -d '{
    "mode": "emom",
    "interval_sec": 60,
    "exercises": 1,
    "rounds": 10,
    "title": "Fredag EMOM",
    "spotify": "https://open.spotify.com/album/6Nb3e1x9a1IHlbUDtYK52s"
  }'
```

Open the returned `url` on the guest timer (`/tabata`).
