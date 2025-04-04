import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// import Navbar from './components/Navbar';
import Home from './pages/Home';
import BlockDetail from './pages/BlockDetail';
import Transaction from './pages/Transaction';
import LatestTx from './pages/LatestTx';
import Tokens from './pages/Tokens';
import Wallets from './pages/Wallets';
import WalletDetail from './pages/WalletDetail';
// import Pools from './pages/Pools';

const App = () => {
  return (
      <Router>
        {/* <Navbar /> */}
        <div style={{ padding: "1rem" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/block/:height" element={<BlockDetail />} />
            <Route path="/transaction/:hash" element={<Transaction />} />
            <Route path="/latest-tx" element={<LatestTx />} />
            <Route path="/tokens" element={<Tokens />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/wallet/:address" element={<WalletDetail />} />
            {/* <Route path="/pools" element={<Pools />} /> */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>
      </Router>
  );
};

export default App;
