// components/tracklist/TrackList.js
import React from 'react';
import Track from '../track/Track';
import styles from './TrackList.module.css';

export class TrackList extends React.Component {
  render() {
    return (
      <div className={styles.TrackList}>
        {/* <!-- You will add a map method that renders a set of Track Components --> */}
        {this.props.tracks && this.props.tracks.map((track) => {
          return (
          <Track 
          key={track.id} 
          track={track}
          onAdd={this.props.onAdd} 
          onRemove={this.props.onRemove}
          isRemoval={this.props.isRemoval}
          />
          );
        })}
      </div>
    );
  }
}

export default TrackList;
