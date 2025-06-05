import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MultiSearchBar from '../components/MultiSearchBar';
import Navbar from '../components/Navbar';
import LoadingIndicator from '../components/LoadingIndicator';


// Helper: Convert micro amounts to whole tokens if needed.
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

// Helper: Extract sender, receiver, and amount from tx events.
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

const WalletDetail = () => {
  const { address } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [txCount, setTxCount] = useState(0);
  const [loadingTx, setLoadingTx] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Fetch transactions from both sender and recipient queries with pagination.
  const fetchTransactions = async () => {
    try {
      const querySender = `"transfer.sender='${address}'"`;
      const queryRecipient = `"transfer.recipient='${address}'"`;
      
      const urlSender = `https://rpc.zigscan.net/tx_search?query=${encodeURIComponent(querySender)}&prove=true&page=${page}&per_page=${perPage}&order_by=%22desc%22`;
      const urlRecipient = `https://rpc.zigscan.net/tx_search?query=${encodeURIComponent(queryRecipient)}&prove=true&page=${page}&per_page=${perPage}&order_by=%22desc%22`;
      
      const [resSender, resRecipient] = await Promise.all([fetch(urlSender), fetch(urlRecipient)]);
      const dataSender = await resSender.json();
      const dataRecipient = await resRecipient.json();
  
      const txsSender = dataSender.result && dataSender.result.txs ? dataSender.result.txs : [];
      const txsRecipient = dataRecipient.result && dataRecipient.result.txs ? dataRecipient.result.txs : [];
  
      // Merge arrays and remove duplicates based on tx.hash.
      const txMap = {};
      txsSender.forEach(tx => { txMap[tx.hash] = tx; });
      txsRecipient.forEach(tx => { txMap[tx.hash] = tx; });
  
      setTransactions(Object.values(txMap));
      setLoadingTx(false);
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      setLoadingTx(false);
    }
  };

  // Fetch balance for the wallet.
  const fetchBalance = async () => {
    try {
      const balanceUrl = `https://testnet-api.zigchain.com/cosmos/bank/v1beta1/balances/${address}`;
      const response = await fetch(balanceUrl);
      const data = await response.json();
      if (data.balances && data.balances.length > 0) {
        const { amount, denom } = data.balances[0];
        setBalance({ amount, denom });
      } else {
        setBalance(null);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Fetch total transaction count for this wallet.
  const fetchTxCount = async () => {
    try {
      const querySender = `"transfer.sender='${address}'"`;
      const queryRecipient = `"transfer.recipient='${address}'"`;
      
      const urlSender = `https://rpc.zigscan.net/tx_search?query=${encodeURIComponent(querySender)}&prove=true&page=1&per_page=10&order_by=%22desc%22`;
      const urlRecipient = `https://rpc.zigscan.net/tx_search?query=${encodeURIComponent(queryRecipient)}&prove=true&page=1&per_page=10&order_by=%22desc%22`;
      
      const [resSender, resRecipient] = await Promise.all([fetch(urlSender), fetch(urlRecipient)]);
      const dataSender = await resSender.json();
      const dataRecipient = await resRecipient.json();

      const countSender = parseInt(dataSender.result.total_count)
      const countRecipient = parseInt(dataRecipient.result.total_count)
      
      
      setTxCount(countSender + countRecipient);
    } catch (error) {
      console.error('Error fetching transaction count:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
    fetchTxCount();
  }, [address, page, perPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    setPage(newPage);
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  return loadingTx ? (
    <LoadingIndicator />
  ) : (
    <div style={styles.container}>
      <Navbar />
      <h2 style={styles.title}>Wallet Details for {address}</h2>
      
      {/* Transaction Search */}
      <MultiSearchBar />
      
      {/* Balance and Transaction Count Section */}
      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>Wallet Overview</h3>
        {balance ? (
          <p style={styles.infoText}>
            <strong>Balance:</strong> {balance.denom === 'uzig' ? (parseFloat(balance.amount) / 1e6).toFixed(2) + ' ZIG' : balance.amount + ' ' + balance.denom}
          </p>
        ) : (
          <p style={styles.infoText}>No balance found.</p>
        )}
        <p style={styles.infoText}>
          <strong>Total Transactions:</strong> {txCount}
        </p>
      </div>

      {/* Transactions Table */}
      <h3 style={styles.subtitle}>Transactions</h3>
      {loadingTx ? (
        <div style={styles.loading}>Loading transactions for wallet {address}...</div>
      ) : transactions.length === 0 ? (
        <p style={styles.message}>No transactions found for this wallet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tx Hash</th>
              <th style={styles.th}>Sender</th>
              <th style={styles.th}>Receiver</th>
              <th style={styles.th}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => {
              const details = extractTxDetails(tx);
              return (
                <tr key={index}>
                  <td style={styles.td}>
                    <a style={styles.link} href={`/transaction/${tx.hash}`}>
                      {tx.hash.substring(0, 20)}...
                    </a>
                  </td>
                  <td style={styles.td}>{details.sender.substring(0, 20)}...</td>
                  <td style={styles.td}>{details.receiver.substring(0, 20)}...</td>
                  <td style={styles.td}>{details.amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
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
          disabled={transactions.length < perPage}
        >
          Next
        </button>
        <label style={styles.label}>
          Transactions per page:&nbsp;
          <select value={perPage} onChange={handlePerPageChange} style={styles.select}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
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
  title: {
    color: '#2d9cdb',
    marginBottom: '1rem'
  },
  subtitle: {
    marginTop: '1.5rem',
    color: '#2d9cdb'
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  infoTitle: {
    marginBottom: '1rem',
    color: '#2d9cdb'
  },
  infoText: {
    margin: '0.5rem 0'
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
  loading: {
    padding: '2rem'
  },
  message: {
    marginTop: '1rem'
  },
  pagination: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '1rem',
    gap: '1rem'
  },
  pageButton: {
    backgroundColor: '#2d9cdb',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  pageInfo: {
    fontFamily: 'Arial, sans-serif'
  },
  label: {
    fontFamily: 'Arial, sans-serif'
  },
  select: {
    padding: '0.5rem'
  }
};

export default WalletDetail;
