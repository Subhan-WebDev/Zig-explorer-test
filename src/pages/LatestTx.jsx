import React, { useEffect, useState } from 'react';
import MultiSearchBar from '../components/MultiSearchBar';
import Navbar from '../components/Navbar';
import LoadingIndicator from '../components/LoadingIndicator';

const convertMicroAmount = (amountStr) => {
  const match = amountStr.match(/^([\d.]+)([a-zA-Z]+)$/);
  if (match) {
    let value = parseFloat(match[1]);
    const denom = match[2];
    if (denom === "uzig") {
      return { value: value / 1e6, denom: "ZIG" };
    }
    return { value, denom };
  }
  return { value: amountStr, denom: "" };
};

const extractTxDetails = (tx) => {
  let sender = 'N/A';
  let receiver = 'N/A';
  let amountStr = 'N/A';

  if (tx.tx_result && tx.tx_result.events) {
    const transferEvents = tx.tx_result.events.filter(event => event.type === 'transfer');
    if (transferEvents.length >= 2) {
      const secondTransfer = transferEvents[1];
      secondTransfer.attributes.forEach(attr => {
        if (attr.key === "sender") sender = attr.value;
        if (attr.key === "recipient") receiver = attr.value;
        if (attr.key === "amount") {
          const { value, denom } = convertMicroAmount(attr.value);
          amountStr = `${value} ${denom}`;
        }
      });
    } else if (transferEvents.length === 1) {
      transferEvents[0].attributes.forEach(attr => {
        if (attr.key === "sender") sender = attr.value;
        if (attr.key === "recipient") receiver = attr.value;
        if (attr.key === "amount") {
          const { value, denom } = convertMicroAmount(attr.value);
          amountStr = `${value} ${denom}`;
        }
      });
    }
  }
  return { sender, receiver, amount: amountStr };
};

const LatestTx = () => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const POLL_INTERVAL = 10000;

  const fetchTxs = async () => {
    try {
      const txSearchUrl = `https://testnet-rpc.zigchain.com/tx_search?query=%22tx.height%3E0%22&prove=true&page=${page}&per_page=${perPage}&order_by=%22desc%22`;
      const response = await fetch(txSearchUrl);
      const data = await response.json();
      if (data.result && data.result.txs) {
        setTxs(data.result.txs);
      } else {
        setTxs([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTxs([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
    const interval = setInterval(fetchTxs, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [page, perPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setPage(newPage);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  if (loading) return <LoadingIndicator/>;

  return (
    <div style={styles.container}>
       <Navbar />
       <MultiSearchBar />
      <h2 style={styles.title}>Latest Transactions</h2>
      <div style={styles.paginationControls}>
        <label style={styles.label}>
          Transactions per page:&nbsp;
          <select value={perPage} onChange={handlePerPageChange} style={styles.select}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Tx Hash</th>
            <th style={styles.th}>Block Height</th>
            <th style={styles.th}>Sender</th>
            <th style={styles.th}>Receiver</th>
            <th style={styles.th}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {txs.map((tx, index) => {
            const details = extractTxDetails(tx);
            return (
              <tr key={index}>
                <td style={styles.td}>
                  <a style={styles.link} href={`/transaction/${tx.hash}`}>
                    {tx.hash.substring(0, 10)}...
                  </a>
                </td>
                <td style={styles.td}>{tx.height}</td>
                <td style={styles.td}>{details.sender.substring(0,10)}...</td>
                <td style={styles.td}>{details.receiver.substring(0,10)}...</td>
                <td style={styles.td}>{details.amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={styles.pagination}>
        <button 
          style={styles.pageButton} 
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>
        <span style={styles.pageInfo}>Page {page}</span>
        <button 
          style={styles.pageButton} 
          onClick={() => handlePageChange(page + 1)}
          disabled={txs.length < perPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh'
  },
  loading: {
    fontFamily: 'Arial, sans-serif',
    padding: '2rem'
  },
  title: {
    color: '#2d9cdb',
    marginBottom: '1rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '1rem'
  },
  th: {
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#2d9cdb',
    color: '#fff'
  },
  td: {
    border: '1px solid #ccc',
    padding: '8px'
  },
  link: {
    color: '#2d9cdb',
    textDecoration: 'none'
  },
  paginationControls: {
    marginBottom: '1rem'
  },
  label: {
    fontFamily: 'Arial, sans-serif'
  },
  select: {
    padding: '0.5rem'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1rem'
  },
  pageButton: {
    backgroundColor: '#2d9cdb',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    margin: '0 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  pageInfo: {
    fontFamily: 'Arial, sans-serif'
  }
};

export default LatestTx;
