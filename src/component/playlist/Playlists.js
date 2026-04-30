import React from 'react';
import TrackList from '../tracklist/TrackList';
import styles from './Playlist.module.css'; // Standard way to import CSS modules

export class Playlist extends React.Component {
  render() {
    return (
      <div className={styles.Playlist}>
        <input
        className={styles['Playlist-name']}
        value={this.props.playlistName}
        onChange={(event) => this.props.onNameChange(event.target.value)}
      />
        
        {/* Pass the tracks down to TrackList */}
        <TrackList 
          tracks={this.props.playlistTracks} 
          onRemove={this.props.onRemove} 
          isRemoval={true} 
        />

        {/* FIX 1: Use this.props.onSave instead of Playlist.onSave */}
        <button className={styles['Playlist-save']} onClick={this.props.onSave}>
          SAVE TO SPOTIFY
        </button>
      </div>
    );
  } // FIX 2: Removed the semicolon and extra curly brace that were here
}

export default Playlist;

