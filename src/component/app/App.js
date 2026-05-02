import React, { useState, useCallback, useEffect } from "react";
import styles from "./App.module.css";
import SearchResults from "../searchresults/SearchResults";
import Playlist from "../playlist/Playlist";
import SearchBar from "../searchbar/SearchBar";
import Spotify from "../../util/spotify/Spotify.js";

const EXAMPLE_TRACKS = [
  {
    id: "3n3Ppam7vgaVa1iaRUc9Lp",
    name: "Mr. Brightside",
    artist: "The Killers",
    album: "Hot Fuss",
    uri: "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
  },
  {
    id: "7ouMYWpwJ422jRcDASZB7P",
    name: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    uri: "spotify:track:7ouMYWpwJ422jRcDASZB7P"
  },
  {
    id: "0eGsygTp906u18L0Oimnem",
    name: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    uri: "spotify:track:0eGsygTp906u18L0Oimnem"
  }
];

function App() {
  const [searchResults, setSearchResults] = useState(EXAMPLE_TRACKS);
  const [playlistName, setPlaylistName] = useState("My Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([
    {
      id: "local-1",
      name: "Local Song 1",
      artist: "Local Artist",
      album: "Local Album",
      uri: "spotify:track:local-1",
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const addTrack = useCallback((track) => {
    if (!track || track.id == null) return;
    setPlaylistTracks((prev) => {
      const exists = prev.some((t) => String(t.id) === String(track.id));
      if (exists) return prev;
      return [...prev, track];
    });
  }, []);

  const removeTrack = useCallback((track) => {
    if (!track || track.id == null) return;
    setPlaylistTracks((prev) =>
      prev.filter((t) => String(t.id) !== String(track.id))
    );
  }, []);

  const updatePlaylistName = useCallback((name) => {
    if (typeof name !== "string") return;
    setPlaylistName(name);
  }, []);

  const savePlaylist = useCallback(async () => {
    const trackURIs = playlistTracks.map((t) => t.uri).filter(Boolean);

    if (!trackURIs.length) {
      console.warn("⚠️ No tracks to save.");
      return;
    }

    setIsSaving(true);
    try {
      await Spotify.savePlaylist(playlistName, trackURIs);
      setPlaylistName("New Playlist");
      setPlaylistTracks([]);
    } catch (err) {
      console.error("❌ Failed to save playlist:", err);
    } finally {
      setIsSaving(false);
    }
  }, [playlistName, playlistTracks]);

  
  const search = useCallback(async (term) => {
  const trimmed = String(term ?? "").trim();

  console.log("🔍 SEARCH TERM:", trimmed);

  if (!trimmed) return;


  localStorage.setItem("last_search", trimmed);

  setIsSearching(true);

  try {
    const results = await Spotify.search(trimmed);

    console.log("🎯 RESULTS FROM SPOTIFY:", results);
    

    setSearchResults([
      {
      id: "1",
      name: "Test Track",
      artist: "Test Artist",
      album: "Test Album",
      uri: "spotify:track:test1",
    },
    ...results,
    ]);
  }    



      catch (err) {
    console.error("❌ Search failed:", err);
  } finally {
    setIsSearching(false);
  }
}, []);
    
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  const savedSearch = localStorage.getItem("last_search");

  if (code) {
    // ⭐ ALWAYS clear the URL immediately
    window.history.replaceState({}, document.title, "/");
  }

  if (code && savedSearch) {
    console.log("🔁 Re-running search after login:", savedSearch);

    localStorage.removeItem("last_search");

    setTimeout(() => {
      search(savedSearch);
    }, 300);
  }
}, [search]);


  return (
    <div>
      <h1>
        Ja<span className={styles.highlight}>mmm</span>ing
      </h1>

      <div className={styles.App}>
        <SearchBar onSearch={search} />

        <div className={styles["App-playlist"]}>
          <SearchResults
            searchResults={searchResults}
            onAdd={addTrack}
            onRemove={removeTrack}
            isSearching={isSearching}
          />

          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onNameChange={updatePlaylistName}
            onSave={savePlaylist}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

export default App;