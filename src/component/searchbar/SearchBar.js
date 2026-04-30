import React from 'react';
import styles from './SearchBar.module.css';


class SearchBar extends React.Component {
  constructor(props) {
    super(props);
  
  this.state = {
    term: ''
  
  };

  this.search = this.search.bind(this);
  this.handleTermChange = this.handleTermChange.bind(this);
  this.handleClear = this.handleClear.bind(this);
  this.handleKeyDown = this.handleKeyDown.bind(this);
}

handleTermChange(event) {
    this.setState({ term: event.target.value });
  }

handleClear() {
    this.setState({ term: '' });
  }

  search() {
    this.props.onSearch(this.state.term);

  }
  

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  render() {
    return (
      <div className={styles.SearchBar}>
        <input 
        placeholder="Enter A Song, Album, or Artist" 
        onChange={this.handleTermChange}
        onFocus={this.handleClear}
        onKeyDown={this.handleKeyDown.bind(this)}
        value={this.state.term}
        />
        <button className={styles.SearchButton} onClick={this.search}>
          SEARCH
          </button>
      </div>
    );
  }
}

export default SearchBar;