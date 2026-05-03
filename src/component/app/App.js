import React, { useState, useEffect } from "react";
import styles from "./App.module.css";
import SearchBar from "../searchbar/SearchBar";
import SearchResults from "../searchresults/SearchResults";
import Playlist from "../playlist/Playlist";
import Spotify from "../../util/spotify/Spotify";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [user, setUser] = useState(null);

  function search(term) {
    Spotify.search(term).then((results) => {
      console.log("SEARCH RESULTS:", results);
      setSearchResults(results);
    });
  }

  function addTrack(track) {
    if (playlistTracks.find((t) => t.id === track.id)) return;
    setPlaylistTracks([...playlistTracks, track]);
  }

  function removeTrack(track) {
    setPlaylistTracks(playlistTracks.filter((t) => t.id !== track.id));
  }

  function updatePlaylistName(name) {
    setPlaylistName(name);
  }

  function savePlaylist() {
    const uris = playlistTracks.map((track) => track.uri);
    Spotify.savePlaylist(playlistName, uris);
    setPlaylistName("New Playlist");
    setPlaylistTracks([]);
  }

  // LOAD USER PROFILE
  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await Spotify.getProfile();
        setUser(profile);
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();
  }, []);

  return (
    <div>
      <h1>
        Ja<span className={styles.highlight}>mmm</span>ing
      </h1>

      {/* USER DISPLAY */}
      {user && (
        <h2 style={{ color: "white", backgroundColor: "purple", padding: "20px", borderRadius: "5px" }}>
          Welcome, {user.display_name} 🎧
        </h2>
      )}

      <div className={styles.App}>
        <SearchBar onSearch={search} />

        <div className={styles["App-playlist"]}>
          <SearchResults
            searchResults={searchResults}
            onAdd={addTrack}
          />

          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onNameChange={updatePlaylistName}
            onSave={savePlaylist}
          />
        </div>
      </div>
    </div>
  );
}

export default App;