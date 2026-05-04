// ─────────────────────────────────────────────
// TOKEN + CONFIG
// ─────────────────────────────────────────────
let accessToken = localStorage.getItem("access_token") || "";
let expiresAt = Number(localStorage.getItem("expires_at")) || 0;

const clientID = "c2aa6a0635db46efa47da0e7529d44c1";
const redirectUrl = "https://jammmplays.vercel.app/callback"; // Replace with your deployed URL if needed
// const redirectUrl = "http://jammmplays.vercel.app"

// ─────────────────────────────────────────────
// PKCE HELPERS
// ─────────────────────────────────────────────
function generateRandomString(length = 128) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64 = btoa(String.fromCharCode(...hashArray));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ─────────────────────────────────────────────
// CENTRALIZED API GATEWAY
// ─────────────────────────────────────────────
async function apiFetch(url, options = {}, retry = true) {
  const token = await Spotify.getAccessToken();
  if (!token) {
    console.error("No access token available.");
    return null;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  // Token expired → retry once
  if (response.status === 401 && retry) {
    accessToken = "";
    expiresAt = 0;
    localStorage.removeItem("access_token");
    localStorage.removeItem("expires_at");

    const newToken = await Spotify.getAccessToken();
    if (!newToken) return null;

    return apiFetch(url, options, false);
  }

  return response;
}

// ─────────────────────────────────────────────
// SPOTIFY OBJECT
// ─────────────────────────────────────────────
const Spotify = {
  // ─────────────────────────────
  // GET ACCESS TOKEN (PKCE)
  // ─────────────────────────────
  async getAccessToken() {
    // Reuse valid token
    if (accessToken && Date.now() < expiresAt) {
      return accessToken;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      console.error("Spotify auth error:", error);
      return null;
    }

    // ─── Handle redirect with code ───
    if (code) {
      const verifier = localStorage.getItem("code_verifier");

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUrl,
          client_id: clientID,
          code_verifier: verifier,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        accessToken = data.access_token;
        expiresAt = Date.now() + data.expires_in * 1000;

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("expires_at", expiresAt);

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        return accessToken;
      }

      console.error("Token exchange failed:", data);
      return null;
    }

    // ─── Start PKCE Authorization ───
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await sha256(codeVerifier);
    localStorage.setItem("code_verifier", codeVerifier);

    const scope = [
      "playlist-modify-public",
      "playlist-modify-private",
      "user-read-private"
    ].join(" ");

    const authUrl =
      "https://accounts.spotify.com/authorize" +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientID)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}`;
    if (!code) {
    window.location = authUrl;
  } return null 
},

  // ─────────────────────────────
  // SEARCH TRACKS
  // ─────────────────────────────
  async search(term) {
    if (!term) return [];

    const response = await apiFetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`
    );

    if (!response) return [];

    const json = await response.json();

    if (!json.tracks) return [];

    return json.tracks.items.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists[0]?.name || "Unknown Artist",
      album: t.album?.name || "Unknown Album",
      uri: t.uri,
    }));
  },

  // ─────────────────────────────
  // GET USER PROFILE
  // ─────────────────────────────
  async getProfile() {
    const response = await apiFetch("https://api.spotify.com/v1/me");
    if (!response) return null;
    return response.json();
  },

  // ─────────────────────────────
  // SAVE PLAYLIST
  // ─────────────────────────────
  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;

    // Get user
    const meResponse = await apiFetch("https://api.spotify.com/v1/me");
    const meJson = await meResponse.json();
    const userId = meJson.id;

    // Create playlist
    const createResponse = await apiFetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }
    );

    const playlistJson = await createResponse.json();
    const playlistId = playlistJson.id;

    // Add tracks
    await apiFetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uris: trackUris }),
      }
    );
  },
};

export default Spotify;