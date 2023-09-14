import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link"
import styles from'../styles/Home.module.css'

const PopupMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOutsideClick = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };

  }, []);

  return (
    <div className={styles.popupMenuWrapper} ref={menuRef}>
      <button className={styles.popupMenuButton} onClick={toggleMenu}>
        Menu
      </button>
      {isOpen && (
        <div className={styles.popupMenuLinksWrapper}>
          {<Link href="/sell-nft" className={styles.popupMenuLinks}>
            <div className={styles.menuLink}>Sell NFT</div>
          </Link>}
          {<Link href="/collections" className={styles.popupMenuLinks}>
            <div className={styles.menuLink}>Collections</div>
          </Link>}
          {<Link href="" className={styles.popupMenuLinks}>
            <div className={styles.menuLink}>Create</div>
          </Link>}
          {<Link href="/my-nft" className={styles.popupMenuLinks}>
            <div className={styles.menuLink}>My NFT</div>
          </Link>}
        </div>
      )}
    </div>
  );
};

export default PopupMenu;
