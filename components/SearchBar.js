import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import GET_ACTIVE_ITEMS from '../constants/subgraphQueries';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Zustand für die Suchergebnisse
  const history = useRouter();

    // GraphQL-Abfrage mit Apollo Client
    const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS, {
      variables: {
        searchTerm,
      },
    });

  const handleSearch = async () => {
        //Hier fehlt noch die API aus dem Backend zum durchsuchen
        if (data && data.activeItems) {
          setSearchResults(data.activeItems);
          console.log('Suchbegriff:', searchTerm, 'Ergebnis: ', data.activeItems);
        }
    try {
      const response = await fetch(`/my-nft?q=${searchTerm}`);
      const data = await response.json();

      // Store the fetched data in the state (searchResults)
      if (data && Array.isArray(data)) {
        setSearchResults(data);
        console.log('Suchbegriff:', searchTerm, 'Ergebnis: ', data);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setSearchResults([]); // Clear search results in case of an error
    }


    //   // Redirect to SearchResultPage with the new search term

    history.push(`/SearchResultPage?search=${searchTerm}`);

    //  const dummyResults = [
    //    { id: 1, title: 'Suchergebnis 1', description: 'Beschreibung des Suchergebnisses 1' },
    //    { id: 2, title: 'Suchergebnis 2', description: 'Beschreibung des Suchergebnisses 2' },
    //    { id: 3, title: 'Suchergebnis 3', description: 'Beschreibung des Suchergebnisses 3' },
    //  ];
    //  setSearchResults(dummyResults); // Speichere die Suchergebnisse im Zustand
    //  console.log('Suchbegriff:', searchTerm, 'Ergebnis: ', dummyResults);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-row justify-center">
      <input className="hover:bg-blue-300 bg-blue-200 flex justify-center items-center ml-4 p-2 rounded-l-2xl shadow"
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Search"
        style={{ outline: "none" }}
      />
      <button className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center mr-4 p-2 w-16 rounded-r-2xl shadow"
        onClick={handleSearch}
        style={{ outline: "none" }}
      >Go</button>
    </div>
  );
};


export default SearchBar
