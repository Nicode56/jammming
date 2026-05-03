let accessToken = localStorage.getItem("access_token") || "";
let expiresAt = Number(localStorage.getItem("expires_at")) || 0;

const clientID = ""; // <-- your Spotify client ID
const redirectUrl = "http://127.0.0.1:3000"; // Replace with your deployed URL if needed
// const redirectUrl = "https://jammmplays.netlify.app"
// ─────────────────────────────
// PKCE Helper Functions
// ─────────────────────────────
function generateCodeVerifier(length = 128) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let verifier = "";
  for (let i = 0; i < length; i++) {
    verifier += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return verifier;
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ─────────────────────────────
// Core Auth
// ─────────────────────────────
const Spotify = {
  async getAccessToken() {
    // Reuse valid token
    if (accessToken && Date.now() < expiresAt) {
      return accessToken;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    // ─── Handle redirect from Spotify ───
    if (code) {
      const codeVerifier = localStorage.getItem("code_verifier");

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUrl,
        client_id: clientID,
        code_verifier: codeVerifier,
      });

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const data = await response.json();

      if (data.access_token) {
        accessToken = data.access_token;
        expiresAt = Date.now() + data.expires_in * 1000;

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("expires_at", String(expiresAt));

        // Clean URL (remove ?code=...)
        window.history.replaceState({}, document.title, redirectUrl);

        return accessToken;
      } else {
        console.error("Token exchange failed", data);
        return null;
      }
    }

    // ─── Start Authorization ───
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem("code_verifier", codeVerifier);

    const scope = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
].join(" ");



    const authUrl =
      "https://accounts.spotify.com/authorize" +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientID)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}`;

    window.location = authUrl;
    return null;
  },

  // ─────────────────────────────
  // Search
  // ─────────────────────────────
  async search(term) {
    if (!term) return [];

    const response = await apiFetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`
    );

    if (!response) {
      console.error("Search failed: no response");
      return [];
    }

    const jsonResponse = await response.json();

    if (!jsonResponse.tracks) {
      console.error("No tracks found", jsonResponse);
      return [];
    } 

    return jsonResponse.tracks.items.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists[0]?.name || "Unknown Artist",
      album: t.album?.name || "Unknown Album",
      uri: t.uri,
    }));
  },

  // ─────────────────────────────
  // Save Playlist
  // ─────────────────────────────
  async savePlaylist(name, trackUris) {
    if (!name || !trackUris || !trackUris.length) return;

    // Get current user
    const meResponse = await apiFetch("https://api.spotify.com/v1/me");
    if (!meResponse) {
      console.error("Failed to fetch user profile");
      return;
    }
    const meJson = await meResponse.json();
    const userId = meJson.id;

    // Create playlist
    const createPlaylistResponse = await apiFetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    );

    if (!createPlaylistResponse) {
      console.error("Failed to create playlist");
      return;
    }

    const playlistJson = await createPlaylistResponse.json();
    const playlistId = playlistJson.id;

    // Add tracks
    await apiFetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: trackUris }),
    });
  },
};

// ─────────────────────────────
// Centralized API Gateway
// ─────────────────────────────
async function apiFetch(url, options = {}, retry = true) {
  const token = await Spotify.getAccessToken();
  if (!token) {
    console.error("No access token available for apiFetch.");
    return null;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 && retry) {
    // Token likely expired → clear and retry once
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

export default Spotify;