import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link"

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
    <div className="bg-blue-100" ref={menuRef}>
      <button className="hover:bg-blue-500 bg-blue-400 mr-4 rounded-2xl shadow p-2 w-32" onClick={toggleMenu}>
        Menu
      </button>
      {isOpen && (
        <div className='absolute top-25 z-10'>
          {<Link href="/sell-nft" className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center mt-1 p-2 w-32 rounded-2xl shadow">
            <div className="">Sell NFT</div>
          </Link>}
          {<Link href="/collections" className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center mt-1 p-2 w-32 rounded-2xl shadow">
            <div className="">Collections</div>
          </Link>}
          {<Link href="" className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center mt-1 p-2 w-32 rounded-2xl shadow">
            <div className="">Create</div>
          </Link>}
          {<Link href="/my-nft" className="hover:bg-blue-500 bg-blue-400 flex justify-center items-center mt-1  p-2 w-32 rounded-2xl shadow">
            <div className="">My NFT</div>
          </Link>}
        </div>
      )}
    </div>
  );
};

export default PopupMenu;
