// src/components/BlockSummary.jsx
import React, { useEffect, useState } from 'react';

const BlockSummary = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = async () => {
    try {
      const statusResponse = await fetch('https://testnet-rpc.zigchain.com/status');
      const statusData = await statusResponse.json();
      const latestHeight = parseInt(statusData.result.sync_info.latest_block_height, 10);
      const minHeight = latestHeight - 10 > 0 ? latestHeight - 10 : 1;
      const response = await fetch(`https://testnet-rpc.zigchain.com/blockchain?minHeight=${minHeight}&maxHeight=${latestHeight}`);
      const data = await response.json();
      setBlocks(data.result && data.result.block_metas ? data.result.block_metas : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
    const interval = setInterval(fetchBlocks, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading latest blocks...</div>;

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };
  const thStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#2d9cdb',
    color: 'white'
  };
  const tdStyle = {
    border: '1px solid #ccc',
    padding: '8px'
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2d9cdb' }}>Latest Blocks</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Block Height</th>
            <th style={thStyle}>Time</th>
            <th style={thStyle}>Tx Count</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block, index) => (
            <tr key={index}>
              <td style={tdStyle}>
                <a style={{ color: '#2d9cdb' }} href={`/block/${block.header.height}`}>
                  {block.header.height}
                </a>
              </td>
              <td style={tdStyle}>{new Date(block.header.time).toLocaleString()}</td>
              <td style={tdStyle}>{block.header.num_txs || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlockSummary;
