import React from 'react'; // Removed unused { useState } since this is a Class component
import styles from './App.module.css';
import SearchBar from '../searchbar/SearchBar';
import Playlist from '../playlist/Playlist';
import SearchResults from '../searchresults/SearchResults';
import { Spotify } from '../../util/spotify/Spotify.js';

class App extends React.Component {
  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [
        {
          id: '1',
          name: 'Tiny Dancer',
          artist: 'Elton John',
          album: 'Madman Across the Water',
          uri: 'spotify:track:2TVxnSdbS9XvS77eo36wwm'
        },
        {
          id: '2',
          name: 'Stronger',
          artist: 'Kanye West',
          album: 'Graduation',
          uri: 'spotify:track:49CH9mS7eWvUrV999p9S9Y'
        },
        {
          id: '3',
          name: 'Gravity',
          artist: 'John Mayer',
          album: 'Continuum',
          uri: 'spotify:track:3S0OXQeG6R37WtA9uqcqn'
        }
      ],
      playlistName: 'New Playlist', // FIX 1: Lowercase 'p' to match render
      playlistTracks: [],
      isLoggedIn: false,
      user: null,
    };

    // FIX 3: Bind methods so 'this' works correctly when passed to children
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.search = this.search.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.checkAuthStatus = this.checkAuthStatus.bind(this);
  }

  componentDidMount() {
    this.checkAuthStatus();
  }

  async checkAuthStatus() {
    try {
      const token = await Spotify.getAccessToken(false);
      if (token) {
        const response = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = await response.json();
        this.setState({ isLoggedIn: true, user });
      } else {
        this.setState({ isLoggedIn: false, user: null });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.setState({ isLoggedIn: false, user: null });
    }
  }

  login() {
    Spotify.getAccessToken();
  }

  logout() {
    Spotify.logout();
    window.location.reload();
  }

  search(term) {
    Spotify.search(term).then((searchResults) => {
      this.setState({ searchResults: searchResults });
    });
    // You can implement Spotify search functionality here
  }

  addTrack(track) {
    // FIX 4: Ensure property name matches state (playlistTracks)
    const foundTrack = this.state.playlistTracks.find(
      (playlistTrack) => playlistTrack.id === track.id
    );
    if (!foundTrack) {
      const newTracks = this.state.playlistTracks.concat(track);
      this.setState({ playlistTracks: newTracks });
    } else {
      console.log("Track already exists");
    }
  }

  removeTrack(track) {
    const filteredTracks = this.state.playlistTracks.filter(
      (playlistTrack) => playlistTrack.id !== track.id
    );
    this.setState({ playlistTracks: filteredTracks });
  }

  savePlaylist() {
  // Map the playlistTracks to an array of URIs
  const trackUris = this.state.playlistTracks.map(track => track.uri);
  
  if (!trackUris.length) {
    alert("Playlist is empty. Add some tracks before saving.");
    return; // Don't save empty playlists
  }

  // Call your Spotify utility (assumed to be implemented)
  Spotify.savePlaylist(this.state.playlistName, trackUris).then(() => {
    // Reset the playlist after a successful save
    this.setState({
      playlistName: 'New Playlist',
      playlistTracks: []
    });
  });
}


  render() {
    return (
      <div> 
        <h1>
          Ja<span className="highlight">mmm</span>ing
        </h1>
        <div className={styles.Auth}>
          {this.state.isLoggedIn ? (
            <div>
              <span>Welcome, {this.state.user?.display_name || 'User'}!</span>
              <button className={styles.AuthButton} onClick={this.logout}>Logout</button>
            </div>
          ) : (
            <button className={styles.AuthButton} onClick={this.login}>Login to Spotify</button>
          )}
        </div>
        <div className={styles.App}> {/* Changed 'class' to 'className' (React standard) */}
          <SearchBar onSearch={this.search} />
          <div className={styles['App-playlist']} >
            <SearchResults 
              searchResults={this.state.searchResults} 
              onAdd={this.addTrack} 
            />
            {/* FIX 5: Ensure props match the state names exactly (lowercase p) */}
            <Playlist 
              playlistName={this.state.playlistName} 
              onNameChange={this.updatePlaylistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack} 
              onSave={this.savePlaylist}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
