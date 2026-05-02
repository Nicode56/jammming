import React from "react";
import Track from "../track/Track";
import styles from "./TrackList.module.css";

export class TrackList extends React.Component {
  render() {
    const { tracks, onAdd, onRemove, isRemoval } = this.props;
    const safeTracks = Array.isArray(tracks) ? tracks : [];
    const containerClass = (styles && styles.TrackList) || "";

    return (
      <div className={containerClass}>
        {safeTracks.map((track, idx) => {
          const key = track && (track.id ?? `${track.name}-${track.artist}-${idx}`);
          return <Track key={key} track={track} onAdd={onAdd} onRemove={onRemove} isRemoval={Boolean(isRemoval)} />;
        })}
      </div>
    );
  }
}

export default TrackList;
