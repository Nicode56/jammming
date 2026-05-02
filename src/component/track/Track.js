import React from "react";
import styles from "./Track.module.css";

export class Track extends React.Component {
  addTrack = () => {
    const { onAdd, track } = this.props;
    if (typeof onAdd === "function" && track) onAdd(track);
  };

  removeTrack = () => {
    const { onRemove, track } = this.props;
    if (typeof onRemove === "function" && track) onRemove(track);
  };

  renderAction() {
    const isRemoval = Boolean(this.props.isRemoval);
    const actionClass = (styles && styles["Track-action"]) || "";

    if (isRemoval) {
      return (
        <button className={actionClass} onClick={this.removeTrack} aria-label="Remove track">
          -
        </button>
      );
    }

    return (
      <button className={actionClass} onClick={this.addTrack} aria-label="Add track">
        +
      </button>
    );
  }

  render() {
    const track = this.props.track || {};
    const trackClass = (styles && styles.Track) || "";
    const infoClass = (styles && styles["Track-information"]) || "";

    return (
      <div className={trackClass}>
        <div className={infoClass}>
          <h3>{track.name || "Unknown title"}</h3>
          <p>
            {track.artist || "Unknown artist"} | {track.album || "Unknown album"}
          </p>
        </div>

        {this.renderAction()}
      </div>
    );
  }
}

export default Track;

