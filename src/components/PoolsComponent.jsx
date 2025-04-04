import React from 'react';
import { usePools } from "@zigchain/zigchain-sdk";

const PoolsComponent = ({ page }) => {
  const { data: pools, isLoading, error, mutate } = usePools(page);

  if (isLoading) return <p>Loading pools...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h3>Pools</h3>
      <ul>
        {pools.map((pool, index) => (
          <li key={index}>
            <p>Pool ID: {pool.poolId}</p>
            <ul>
              {pool.tokens.map((token, i) => (
                <li key={i}>
                  {token.metadata?.symbol || token.denom}: {token.metadata?.name}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <button onClick={() => mutate()}>Refetch Pools</button>
    </div>
  );
};

export default PoolsComponent;
