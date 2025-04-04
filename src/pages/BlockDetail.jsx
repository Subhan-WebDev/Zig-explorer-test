import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const BlockDetail = () => {
  const { height } = useParams();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlockDetail = async () => {
    try {
      const response = await fetch(`https://testnet-rpc.zigchain.com/block?height=${height}`);
      const data = await response.json();
      setBlock(data.result ? data.result.block : null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching block details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockDetail();
  }, [height]);

  if (loading) return <div>Loading block details...</div>;
  if (!block) return <div>No block data found.</div>;

  return (
    <div>
      <h2>Block Details - Height: {height}</h2>
      <pre>{JSON.stringify(block, null, 2)}</pre>
    </div>
  );
};

export default BlockDetail;
