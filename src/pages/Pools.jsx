import React, { useState } from 'react';
import PoolsComponent from '../components/PoolsComponent';

const Pools = () => {
  const [page, setPage] = useState(1);

  return (
    <div>
      <h2>Pools</h2>
      <PoolsComponent page={page} />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
          Previous Page
        </button>
        <span style={{ margin: '0 1rem' }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>
          Next Page
        </button>
      </div>
    </div>
  );
};

export default Pools;
