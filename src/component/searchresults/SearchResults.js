import React from 'react';
import TrackList from '../tracklist/TrackList';
import styles from '../searchresults/SearchResults.module.css';

export class SearchResults extends React.Component {
  render() {
    return (
      <div className={styles.SearchResults  || styles['SearchResults']}>
        <h2>Results</h2>
        
        <TrackList 
          // FIX 1: Access via this.props and use the correct variable name
          tracks={this.props.searchResults || []}
          onAdd={this.props.onAdd}
          // FIX 2: Pass onRemove to keep the TrackList happy
          onRemove={this.props.onRemove} 
          isRemoval={false} 
          // FIX 3: Removed defaultValue (it belongs in Playlist.js)
        />
      </div>
    );
  }
}

export default SearchResults;
