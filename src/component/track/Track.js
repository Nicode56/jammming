import React from 'react';
import styles from './Track.module.css';

export class Track extends React.Component {

  addTrack = () => {
    this.props.onAdd(this.props.track);
  }

  removeTrack = () => {
    this.props.onRemove(this.props.track);
  }

  renderAction() {
    if (this.props.isRemoval) {
      return (
        // FIX: Use the styles object for CSS Modules
        <button className={styles['Track-action']} onClick={this.removeTrack}>
          -
        </button>
      );
    } else {
      return (
        // FIX: Use the styles object for CSS Modules
        <button className={styles['Track-action']} onClick={this.addTrack}>
          +
        </button>
      );
    }
  }

  render() {
    return (
      <div className={styles.Track}>
        <div className={styles['Track-information']}>
          <h3>{this.props.track.name}</h3>
          <p>
            {this.props.track.artist} | {this.props.track.album}
          </p>  
        </div>
        
        {this.renderAction()}
      </div>
    );
  }
}

export default Track;

