import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Wallets = () => {
  const [searchAddress, setSearchAddress] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchAddress.trim() !== '') {
      navigate(`/wallet/${searchAddress.trim()}`);
    }
  };

  return (
    <>
      <Navbar />
    <div style={styles.container}>
      <h2 style={styles.title}>Wallets</h2>
      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          placeholder="Enter wallet address"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          style={styles.input}
          />
        <button type="submit" style={styles.button}>
          Search Wallet
        </button>
      </form>
      {/* Optionally, you can add a list of known wallets here */}
    </div>
</>
  );
};

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  title: {
    color: '#2d9cdb',
    marginBottom: '1.5rem'
  },
  form: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  input: {
    padding: '0.75rem',
    width: '300px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '0.5rem',
    fontSize: '1rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2d9cdb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  }
};

export default Wallets;
