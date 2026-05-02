let accessToken = "";
const clientID = "c2aa6a0635db46efa47da0e7529d44c1";
const redirectUrl = "http://127.0.0.1:3000";
const scopes = ["playlist-modify-public", "playlist-modify-private"].join(" ");
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

/* -------------------- helpers -------------------- */
//Clear ?code=... BEFORE React loads

function generateRandomString(length = 128) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

async function sha256Base64Url(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const binary = String.fromCharCode(...hashArray);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function clearStoredToken() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_expiry");
  accessToken = "";
}

function getCodeFromUrl() {
  return new URLSearchParams(window.location.search).get("code");
}

/* -------------------- auth flow -------------------- */

async function redirectToAuthorize() {
  
  let codeVerifier = sessionStorage.getItem("code_verifier");

  if (!codeVerifier) {
    codeVerifier = generateRandomString(128);
    sessionStorage.setItem("code_verifier", codeVerifier);
  }

  const codeChallenge = await sha256Base64Url(codeVerifier);

  const params = new URLSearchParams({
    client_id: clientID,
    response_type: "code",
    redirect_uri: redirectUrl,
    scope: scopes,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location = `${AUTH_ENDPOINT}?${params.toString()}`;
}

async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem("code_verifier");

  if (!verifier) {
    console.error(" Missing code_verifier - restarting auth flow");

    window.history.replaceState({}, document.title, "/");

throw new Error("Code verifier not found");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUrl,
    client_id: clientID,
    code_verifier: verifier,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded",

     },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("TOKEN EXCHANGE FAILED:", errorText);
    throw new Error("Token exchange failed");
  }

  const json = await res.json();

  if (!json.access_token) {
    console.error("NO ACCESS TOKEN IN RESPONSE:", json);
    throw new Error("No access token returned");
  }

  const token = json.access_token;

  accessToken = token;
  localStorage.setItem("access_token", token);

  const expiry = new Date(Date.now() + json.expires_in * 1000);
  localStorage.setItem("token_expiry", expiry.toISOString());

  sessionStorage.removeItem("code_verifier");
  window.history.replaceState({}, document.title, window.location.pathname);
  

  console.log("TOKEN STORED:", token);

  return token;
}

async function ensureAccessToken() {
  // 1. In memory
  if (accessToken) return accessToken;

  // 2. Local storage
  const stored = localStorage.getItem("access_token");
  if (stored) {
    accessToken = stored;
    console.log("USING STORED TOKEN");
    return accessToken;
  }

  // 3. Handle redirect return
  const code = getCodeFromUrl();

  if (code) {
    console.log(" Exchanging code for token...");
    return await exchangeCodeForToken(code);
  }

  // 4. Only redirect if NO token AND NO code
  console.log(" Redirecting to Spotify login...");
  await redirectToAuthorize();

  return null; //  DO NOT throw
}

/* -------------------- API wrapper -------------------- */

async function apiFetch(path, options = {}) {
  const token = await ensureAccessToken();

  if (!token) {
    throw new Error("No access token available");
  }

  accessToken = token;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    console.warn("Token invalid, retrying...");

    clearStoredToken();

    const newToken = await ensureAccessToken();

    const retryRes = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!retryRes.ok) {
      throw new Error(`Spotify API error: ${retryRes.status}`);
    }

    return retryRes.json();
  }

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status}`);
  }

  if (res.status === 204) return null;

  return res.json();
}

/* -------------------- PUBLIC API -------------------- */

const Spotify = {
  async search(term) {
    const params = new URLSearchParams({ q: term, type: "track", limit: 20 });
    const res = await apiFetch(`/search?${params.toString()}`);
    return res.tracks?.items || [];
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      throw new Error("Playlist name and track URIs are required");
    }

    const me = await apiFetch("/me");
    const userId = me.id;

    const playlist = await apiFetch(`/users/${userId}/playlists`, {
      method: "POST",
      body: JSON.stringify({ name, public: false }),
    });

    await apiFetch(`/playlists/${playlist.id}/tracks`, {
      method: "POST",
      body: JSON.stringify({ uris: trackUris }),
    });

    return apiFetch(`/playlists/${playlist.id}`);
  },

  logout() {
    clearStoredToken();
    localStorage.removeItem("code_verifier");
    window.history.replaceState({}, document.title, "/");
    console.log("Logged out, token cleared.");
  },
};

export default Spotify;
