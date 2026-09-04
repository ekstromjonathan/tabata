import assert from "node:assert/strict"

import { parseApiBody } from "../lib/session"
import { parseSpotify } from "../lib/spotify"
import { buildPhases, totalSeconds } from "../lib/workout"

const album =
  "https://open.spotify.com/album/6Nb3e1x9a1IHlbUDtYK52s?si=WKouai5OSges6UhQAxbYWQ"

const parsed = parseSpotify(album)
assert.ok(!("error" in parsed))
assert.equal(parsed.type, "album")
assert.equal(parsed.id, "6Nb3e1x9a1IHlbUDtYK52s")
assert.equal(
  parsed.embedUrl,
  "https://open.spotify.com/embed/album/6Nb3e1x9a1IHlbUDtYK52s"
)
assert.equal(
  parsed.openUrl,
  "https://open.spotify.com/album/6Nb3e1x9a1IHlbUDtYK52s"
)

assert.ok(!("error" in parseSpotify("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M")))
assert.ok("error" in parseSpotify("https://example.com/album/nope"))

const tabata = parseApiBody(
  {
    work: 20,
    rest: 10,
    exercises: 8,
    rounds: 1,
    round_rest: 0,
    spotify: album,
    auto_start: false,
  },
  "https://tabata-production.up.railway.app"
)
assert.equal(tabata.ok, true)
if (tabata.ok) {
  assert.equal(tabata.mode, "tabata")
  assert.equal(tabata.settings.roundRest, 0)
  assert.equal(tabata.spotify?.embedUrl, parsed.embedUrl)
  assert.match(tabata.url, /\/tabata\?/)
  assert.match(tabata.url, /spotify=/)
  assert.match(tabata.url, /auto_start=0/)
}

const emom = parseApiBody(
  {
    mode: "emom",
    interval_sec: 60,
    exercises: 1,
    rounds: 10,
    title: "Fredag EMOM",
    spotify: "https://open.spotify.com/album/6Nb3e1x9a1IHlbUDtYK52s",
  },
  "https://example.test"
)
assert.equal(emom.ok, true)
if (emom.ok) {
  assert.equal(emom.mode, "emom")
  assert.equal(emom.title, "Fredag EMOM")
  assert.equal(emom.settings.intervalSec, 60)
  assert.equal(emom.settings.work, 60)
  assert.equal(emom.settings.exercises, 1)
  assert.equal(emom.settings.rounds, 10)
  assert.match(emom.url, /mode=emom/)
  assert.match(emom.url, /title=Fredag/)
  const phases = buildPhases(emom.settings, "emom")
  assert.equal(phases.length, 10)
  assert.equal(phases[0]?.duration, 60)
  assert.equal(totalSeconds(emom.settings, "emom"), 600)
}

const split = parseApiBody(
  { mode: "emom", interval_sec: 60, work: 40, exercises: 1, rounds: 2 },
  "https://example.test"
)
assert.equal(split.ok, true)
if (split.ok) {
  const phases = buildPhases(split.settings, "emom")
  assert.equal(phases.length, 4)
  assert.equal(phases[0]?.kind, "work")
  assert.equal(phases[0]?.duration, 40)
  assert.equal(phases[1]?.kind, "rest")
  assert.equal(phases[1]?.duration, 20)
}

const bad = parseApiBody({ spotify: "not-a-link" }, "https://example.test")
assert.equal(bad.ok, false)

console.log("session checks passed")
