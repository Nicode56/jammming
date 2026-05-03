import React from "react";
import styles from "./SearchBar.module.css";


class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      term: "",
    };

    this.handleTermChange = this.handleTermChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleTermChange(event) {
    this.setState({ term: event.target.value });
  }

  handleSearch() {
    console.log("SEARCH:", this.state.term);
    this.props.onSearch(this.state.term);
  }

  handleKeyDown(event) {
    if (event.key === "Enter") {
      console.log("Enter:", this.state.term);
      this.props.onSearch(this.state.term);
    }
  }

  render() {
    return (
      <div className={styles.SearchBar}>
        <input
          placeholder="Enter A Song, Album, or Artist"
          value={this.state.term}
          onChange={this.handleTermChange}
          onKeyDown={this.handleKeyDown}
        />
        <button 
        className={styles.SearchButton} 
        onClick={this.handleSearch}
        >
          Search
        </button>
      </div>
    );
  }
}

export default SearchBar;