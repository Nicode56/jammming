import React from "react";
import TrackList from "../tracklist/TrackList";
import styles from "./Playlist.module.css";

export default function Playlist({ playlistName, playlistTracks, onRemove, onNameChange, onSave, isSaving }) {
  const handleNameChange = (e) => {
    if (typeof onNameChange === "function") onNameChange(e.target.value);
  };

  const handleSave = () => {
    if (typeof onSave === "function") onSave();
  };

  const safeTracks = Array.isArray(playlistTracks) ? playlistTracks : [];

  return (
    <div className={styles.Playlist || ""}>
      <input value={playlistName || ""} onChange={handleNameChange} className={styles.PlaylistName || ""} />

      <TrackList tracks={safeTracks} onRemove={onRemove} isRemoval={true} />

      <button className={styles.SaveButton || ""} onClick={handleSave} disabled={isSaving || safeTracks.length === 0}>
        {isSaving ? "Saving..." : "SAVE TO SPOTIFY"}
      </button>
    </div>
  );
}

