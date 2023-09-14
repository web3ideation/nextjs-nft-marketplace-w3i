import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';
import { Button } from 'web3uikit';

const DropDownSearch = ({ buttonText, options }) => {
    // State to track whether the dropdown is open or closed
    const [isOpen, setIsOpen] = useState(false);

    // Ref to the root element of the dropdown
    const dropdownRef = useRef(null);

    // Function to toggle the dropdown menu
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Effect to close the dropdown when a click occurs outside
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        // Add event listener to the window
        window.addEventListener('click', handleOutsideClick);

        // Cleanup by removing event listener when component unmounts
        return () => {
            window.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return (
        <div className={styles.dropDownSearchItems} ref={dropdownRef}>
            <Button
                onClick={toggleMenu}
                text={buttonText}
            />
            {isOpen && (
                <div className={styles.scrollbar}>
                    {options.map((option) => (
                        <Button
                            key={option.id}
                            text={option.label}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropDownSearch;
