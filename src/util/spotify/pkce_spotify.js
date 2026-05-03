let accessToken = "";
let expiresAt = 0;

const clientID = "c2aa6a0635db46efa47da0e7529d44c1";
const redirectUrl = "https://jammmplays.netlify.app";

// ─────────────────────────────
// PKCE helpers
// ─────────────────────────────
function generateCodeVerifier(length = 64) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

  const values = crypto.getRandomValues(new Uint8Array(length));

  return values.reduce(
    (acc, x) => acc + possible[x % possible.length],
    ""
  );
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
// MAIN AUTH FUNCTION
// ─────────────────────────────
const PKCESpotify = {
  async getAccessToken() {
    // 1. In-memory
    if (accessToken && Date.now() < expiresAt) return accessToken;

    // 2. localStorage
    const storedToken = localStorage.getItem("access_token");
    const storedExpiry = localStorage.getItem("expires_at");

    if (storedToken && Date.now() < storedExpiry) {
      accessToken = storedToken;
      expiresAt = storedExpiry;
      console.log("USING STORED TOKEN");
      return accessToken;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // ─── Handle redirect return ───
    if (code) {
      const verifier = localStorage.getItem("code_verifier");

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUrl,
        client_id: clientID,
        code_verifier: verifier,
      });

      const response = await fetch(
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      const data = await response.json();

      if (data.access_token) {
        accessToken = data.access_token;
        expiresAt = Date.now() + data.expires_in * 1000;

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("expires_at", expiresAt);
        localStorage.removeItem("code_verifier");

        window.history.replaceState({}, document.title, "/");

        console.log("TOKEN STORED");

        return accessToken;
      } else {
        console.error("Token exchange failed", data);
        return null;
      }
    }

    // ─── Start Authorization ───
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("code_verifier", verifier);

    const scope = 
    "playlist-modify-public user-read-private user-read-email";

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(
      redirectUrl
    )}&code_challenge_method=S256&code_challenge=${challenge}`;

    window.location = authUrl;
  },
};

export default PKCESpotify;