import React, { useState, useEffect, useRef } from 'react';
import styles from "../styles/Home.module.css";

const DropDownSearch = ({ buttonText, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    function toggleMenu() {
        setIsOpen(!isOpen);
    }

    // Schließe das Dropdown-Menü, wenn irgendwo auf der Seite geklickt wird
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        window.addEventListener('click', handleOutsideClick);

        return () => {
            window.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return (
        <div className="bg-blue-200/40 flex flex-col mb-1 rounded-2xl overflow-hidden" ref={dropdownRef}>
            <button className="hover:bg-blue-500 bg-blue-400 rounded-2xl shadow p-2 w-48" onClick={toggleMenu}>
                {buttonText}
            </button>
            {isOpen && (
                <div className={styles.scrollbar}>
                    {options.map((option) => (
                        <div className="hover:bg-blue-500 bg-blue-500/50 flex justify-center my-1 mr-1 p-2 rounded-2xl shadow"
                            key={option.id}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropDownSearch;
