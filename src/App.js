import './App.css';
import ConnectWallet from './components/ConnectWallet';
import ContractCallBnsTransfer from './components/ContractCallBnsTransfer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src="logo512.png" height="50" alt="No logo" />
        <h1>BNS Transfer</h1>
        <ConnectWallet />
        <ContractCallBnsTransfer />
        <p>
          <i>https://github.com/dartman10/bnstransfer-v2</i>
        </p>
      </header>
    </div>
  );
}

export default App;
