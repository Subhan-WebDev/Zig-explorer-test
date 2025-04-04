import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images.png';  // Importing the logo.svg file

const Navbar = () => (
  <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
      <img src={logo} alt="Logo" style={{ width: '150px', height: 'auto', mixBlendMode: 'darken' }} /> {/* Display the logo */}
      <ul style={{ display: 'flex', listStyle: 'none', gap: '1rem' }}>
        <li><Link style={{ textDecoration: 'none', color: "#144876" }} to="/">Home</Link></li>
        <li><Link style={{ textDecoration: 'none', color: "#144876" }} to="/latest-tx">Transactions</Link></li>
        {/* <li><Link style={{ textDecoration: 'none', color: "#144876" }} to="/tokens">Tokens</Link></li> */}
        <li><Link style={{ textDecoration: 'none', color: "#144876" }} to="/wallets">Wallets</Link></li>
        {/* <li><Link style={{ textDecoration: 'none', color: "#144876" }} to="/pools">Pools</Link></li> */}
      </ul>
    </div>
  </nav>
);

export default Navbar;
