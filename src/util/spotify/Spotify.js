let accessToken = process.env.REACT_APP_SPOTIFY_ACCESS_TOKEN;

const clientID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const scope = 'playlist-modify-public';
console.log("Spotify Client ID:", clientID);
console.log("Spotify Scope:", scope);
const redirectUrl = "http://127.0.0.1:3000"; // Dynamically use the current host and port
const tokenStorageKey = 'spotify_access_token';
const expiresAtKey = 'spotify_token_expiry';

// ─────────────────────────────
// PKCE Helper Functions
// ─────────────────────────────
function generateCodeVerifier(length = 128) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  for (let i = 0; i < length; i++) {
    verifier += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return verifier;
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ─────────────────────────────
// Spotify Object
// ─────────────────────────────
const Spotify = {
  async getAccessToken(redirectIfMissing = true) {
    if (accessToken) return accessToken;

    const storedToken = localStorage.getItem(tokenStorageKey);
    const expiry = localStorage.getItem(expiresAtKey);

    if (storedToken && expiry && Date.now() < parseInt(expiry, 10)) {
      accessToken = storedToken;
      return accessToken;
    }

    if (expiry && Date.now() >= parseInt(expiry, 10)) {
      localStorage.removeItem(tokenStorageKey);
      localStorage.removeItem(expiresAtKey);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

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
        localStorage.setItem(tokenStorageKey, accessToken);
        localStorage.setItem(expiresAtKey, (Date.now() + data.expires_in * 1000).toString());

        window.history.replaceState({}, document.title, "/"); // Clean URL
        return accessToken;
      } else {
        console.error("Token exchange failed", data);
        return null;
      }
    }

    if (!redirectIfMissing) {
      return null;
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem("code_verifier", codeVerifier);

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientID}&scope=playlist-modify-public&redirect_uri=${encodeURIComponent(
      redirectUrl
    )}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

    window.location = authUrl;
  },

  async search(term) {
    const token = await Spotify.getAccessToken();
    if (!token) {
      console.error("No access token available.");
      return [];
    }

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) {
          console.error("No tracks found", jsonResponse);
          return [];
        }
        return jsonResponse.tracks.items.map((t) => ({
          id: t.id,
          name: t.name,
          artist: t.artists[0].name,
          album: t.album.name,
          uri: t.uri,
        }));
      });
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;

    const token = await Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    let userId;

    return fetch("https://api.spotify.com/v1/me", { headers })
      .then((response) => response.json())
      .then((jsonResponse) => {
        userId = jsonResponse.id;

        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        });
      })
      .then((response) => response.json())
      .then((jsonResponse) => {
        const playlistId = jsonResponse.id;

        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: trackUris }),
        });
      });
  },

  logout() {
    accessToken = null;
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(expiresAtKey);
    localStorage.removeItem('code_verifier');
  },
};

export { Spotify };
