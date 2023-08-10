import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DropDownSearch from '../components/DropDownSearch';
import SearchBar from '../components/SearchBar';

const SearchResultPage = ({ searchResults = [] }) => {
  const [sortingOption, setSortingOption] = useState('default');
  const [showDropdowns, setShowDropdowns] = useState(true); // Zustand für Dropdown-Anzeige

  // ... (other filtering states and logic can be added here)

  // Function to handle sorting option change
  const handleSortingChange = (event) => {
    setSortingOption(event.target.value);
    let sortedResults = [...searchResults]; // Create a new array to avoid modifying the original
    switch (event.target.value) {
      case 'Active Items':
        sortedResults.sort((a, b) => a.activeItems - b.activeItems);
        break;
      case 'Recently Sold':
        sortedResults.sort((a, b) => b.recentlySoldCount - a.recentlySoldCount);
        break;
      case 'Most Sold':
        sortedResults.sort((a, b) => b.mostSoldCount - a.mostSoldCount);
        break;
      // Add more options and corresponding sorting logic as needed
      default:
        // Use default sorting logic here
        break;
    }
    // Set the sorted results to the state or do any further processing
  };

  const toggleDropdowns = () => {
    setShowDropdowns(!showDropdowns);
  };

  return (
    <div className='relative'>
      <div className='flex flex-col justify-col items-start p-5'>
        <button className="hover:bg-blue-500 mb-1 bg-blue-400 flex justify-center items-center p-2 w-48 rounded-2xl shadow cursor-pointer"
          onClick={toggleDropdowns} // Hier wird der Status umgekehrt, wenn "Filters" geklickt wird 
        >
          Filters
        </button>
        <div className=" relative flex flex-col rounded-2xl">
          <div className=''>
            {showDropdowns && (
              <div className="">
                <DropDownSearch
                  buttonText="Sort by"
                  options={[
                    { id: 'active', label: 'Active Items' },
                    { id: 'recent', label: 'Recently Sold' },
                    { id: 'most', label: 'Most Sold' },
                    { id: 'oldest', label: 'Oldest' },
                    { id: 'youngest', label: 'Youngest' },
                    { id: 'highest Price', label: 'Highest Price' }
                  ]}
                  onChange={handleSortingChange}
                  value={sortingOption}
                />
              </div>)}
          </div>
          <div className=''>
            {showDropdowns && (
              <div className="">
                <DropDownSearch
                  buttonText="Categories"
                  options={[
                    { id: 'music', label: 'Music' },
                    { id: 'art', label: 'Art' },
                    { id: 'dao', label: 'DAO' },
                    { id: 'wearables', label: 'Wearables' },
                    { id: 'utillities', label: 'Utillities' },
                    { id: 'more', label: 'More' },
                    { id: 'and more', label: 'And More' },
                    { id: 'and morer', label: 'And Morer' }
                  ]}
                  onChange={handleSortingChange}
                  value={sortingOption}
                />
              </div>)}
          </div>
          <div className=''>
            {showDropdowns && (
              <div className="">
                <DropDownSearch
                  buttonText="Collections"
                  options={[
                    { id: 'sun', label: 'Sun' },
                    { id: 'moon', label: 'Moon' },
                    { id: 'earth', label: 'Earth' },
                    { id: 'venus', label: 'Venus' },
                    { id: 'jupiter', label: 'Jupiter' },
                    { id: 'saturn', label: 'Saturn' }
                  ]}
                  onChange={handleSortingChange}
                  value={sortingOption}
                />
              </div>)}
          </div>
        </div>
      </div>
      <ul>
        {searchResults.map((searchResults) => (
          <li key={searchResults.id}>
            <h3>{searchResults.art}</h3>
            <p>{searchResults.music}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

SearchResultPage.propTypes = {
  searchResults: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    art: PropTypes.string.isRequired,
    music: PropTypes.string.isRequired,
  })).isRequired,
};

export default SearchResultPage;
