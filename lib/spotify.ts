export const SPOTIFY_TYPES = ["album", "playlist", "track", "artist"] as const

export type SpotifyType = (typeof SPOTIFY_TYPES)[number]

export type SpotifyRef = {
  type: SpotifyType
  id: string
  input: string
  embedUrl: string
  openUrl: string
}

const ID_PATTERN = /^[A-Za-z0-9]{10,34}$/
const URI_PATTERN =
  /^spotify:(album|playlist|track|artist):([A-Za-z0-9]{10,34})$/i
const PATH_PATTERN =
  /^(?:\/(?:intl-[a-z]{2}))?(?:\/embed)?\/(album|playlist|track|artist)\/([A-Za-z0-9]{10,34})\/?$/i
const USER_PLAYLIST_PATTERN =
  /^\/user\/[^/]+\/playlist\/([A-Za-z0-9]{10,34})\/?$/i

const INVALID_SPOTIFY =
  "Invalid Spotify link. Use an open.spotify.com album, playlist, track, or artist URL (or a spotify: URI)."

function isSpotifyType(value: string): value is SpotifyType {
  return (SPOTIFY_TYPES as readonly string[]).includes(value)
}

function buildRef(
  type: SpotifyType,
  id: string,
  input: string
): SpotifyRef {
  return {
    type,
    id,
    input,
    embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
    openUrl: `https://open.spotify.com/${type}/${id}`,
  }
}

export function parseSpotify(input: string): SpotifyRef | { error: string } {
  const raw = input.trim()
  if (!raw) return { error: INVALID_SPOTIFY }

  const uri = raw.match(URI_PATTERN)
  if (uri) {
    const type = uri[1].toLowerCase()
    if (!isSpotifyType(type) || !ID_PATTERN.test(uri[2])) {
      return { error: INVALID_SPOTIFY }
    }
    return buildRef(type, uri[2], raw)
  }

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return { error: INVALID_SPOTIFY }
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: INVALID_SPOTIFY }
  }
  if (url.hostname !== "open.spotify.com") {
    return { error: INVALID_SPOTIFY }
  }

  const path = url.pathname.replace(/\/+$/, "") || "/"
  const userPlaylist = path.match(USER_PLAYLIST_PATTERN)
  if (userPlaylist) {
    return buildRef("playlist", userPlaylist[1], raw)
  }

  const match = path.match(PATH_PATTERN)
  if (!match) return { error: INVALID_SPOTIFY }
  const type = match[1].toLowerCase()
  if (!isSpotifyType(type) || !ID_PATTERN.test(match[2])) {
    return { error: INVALID_SPOTIFY }
  }
  return buildRef(type, match[2], raw)
}

export function isSpotifyRef(
  value: SpotifyRef | { error: string }
): value is SpotifyRef {
  return "embedUrl" in value
}
