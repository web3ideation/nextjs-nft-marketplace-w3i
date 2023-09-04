import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import GET_ACTIVE_ITEMS from '../constants/subgraphQueries';
import styles from '../styles/Home.module.css'

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const history = useRouter();

  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS, {
    variables: {
      searchTerm,
    },
  });
  
// hier wird eine loop produziert
//  useEffect(() => {
//    // Handle the fetched data here
//    if (!loading && !error && data && data.activeItems) {
//      onSearch(data.activeItems);
//      console.log('Search term:', searchTerm, 'Results:', data.activeItems);
//    }
//  }, [loading, error, data, searchTerm, onSearch]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`/my-nft?q=${searchTerm}`);
      const searchData = await response.json();

      if (Array.isArray(searchData)) {
        onSearch(searchData);
        console.log('Search term:', searchTerm, 'Results:', searchData);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      onSearch([]);
    }

    history.push(`/SearchResultPage?search=${searchTerm}`);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div class={styles.searchBarWrapper}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search..."
      />
      <button
        onClick={handleSearch}
      >
        Go
      </button>
    </div>
  );
};

export default SearchBar;
