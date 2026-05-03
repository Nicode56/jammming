import PKCESpotify from "./pkce_spotify";

const Spotify = {
  async search(term) {
    const token = await PKCESpotify.getAccessToken();

    console.log("TOKEN:", token);

    if (!token) {
      console.error("No access token");
      return [];
    }

    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("STATUS:", response.status);

    // 🔥 FIX: handle non-JSON responses safely
  let json;
  try {
    json = await response.json();
  } catch (err) {
    const text = await response.text();
    console.error("❌ Non-JSON response:", text);
    return [];
  }

    console.log("RAW RESPONSE:", json);

    if (!json.tracks) return [];

    return json.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      uri: track.uri,
    }));
  },

  async getProfile() {
    const token = await PKCESpotify.getAccessToken();

    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;

    const token = await PKCESpotify.getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const user = await fetch("https://api.spotify.com/v1/me", {
      headers,
    }).then((res) => res.json());

    const playlist = await fetch(
      `https://api.spotify.com/v1/users/${user.id}/playlists`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }
    ).then((res) => res.json());

    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, 
      {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: trackUris }),
    });
  },
};

export default Spotify;