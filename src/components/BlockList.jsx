import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BlockList = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocks = async () => {
    try {
      // Get latest block height
      const statusResponse = await fetch('https://testnet-rpc.zigchain.com/status');
      const statusData = await statusResponse.json();
      const latestHeight = parseInt(statusData.result.sync_info.latest_block_height, 10);

      // Define a range (last 10 blocks)
      const minHeight = latestHeight - 10 > 0 ? latestHeight - 10 : 1;

      // Fetch blocks using numeric minHeight and maxHeight
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
    fetchBlocks(); // initial load
    const interval = setInterval(fetchBlocks, 10000); // poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading blocks...</div>;

  return (
    <div>
      <h2>Recent Blocks</h2>
      <ul>
        {blocks.map((block) => (
          <li key={block.header.height}>
            <a href={`/block/${block.header.height}`}>Block #{block.header.height}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlockList;
