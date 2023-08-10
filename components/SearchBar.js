import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import GET_ACTIVE_ITEMS from '../constants/subgraphQueries';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const history = useRouter();

  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS, {
    variables: {
      searchTerm,
    },
  });

  const handleSearch = async () => {
    if (data && data.activeItems) {
      setSearchResults(data.activeItems);
      console.log('Search term:', searchTerm, 'Results:', data.activeItems);
    }

    try {
      const response = await fetch(`/my-nft?q=${searchTerm}`);
      const data = await response.json();

      if (data && Array.isArray(data)) {
        setSearchResults(data);
        console.log('Search term:', searchTerm, 'Results:', data);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setSearchResults([]);
    }

    history.push(`/SearchResultPage?search=${searchTerm}`);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-row justify-center">
      <input
        className="hover:bg-blue-300 bg-blue-200 flex justify-center items-center ml-4 p-2 rounded-l-2xl shadow"
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search"
        style={{ outline: 'none' }}
      />
      <button
        className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center mr-4 p-2 w-16 rounded-r-2xl shadow"
        onClick={handleSearch}
        style={{ outline: 'none' }}
      >
        Go
      </button>
    </div>
  );
};

export default SearchBar;
