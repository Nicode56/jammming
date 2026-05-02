import React from "react";
import TrackList from "../tracklist/TrackList";
import styles from "./SearchResults.module.css";

export class SearchResults extends React.Component {
  render() {
    const { searchResults, onAdd, onRemove } = this.props;

    // Defensive defaults so missing props or styles don't crash the app
    const safeResults = Array.isArray(searchResults) ? searchResults : [];
    const containerClass = (styles && styles.SearchResults) || "SearchResults";

    return (
      <div className={containerClass}>
        <h2>Results</h2>

        <TrackList
          tracks={safeResults}
          onAdd={onAdd}
          onRemove={onRemove}
          isRemoval={false}
        />
      </div>
    );
  }
}

export default SearchResults;
