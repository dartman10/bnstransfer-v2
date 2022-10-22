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
          <i>
            Get support at <a href="https://discord.gg/rr8SzQSwkx">Discord</a>{' '}
            by dartman#1304
          </i>
        </p>
        <p>
          <i>
            Easily search BNS names at{' '}
            <a className="App-link" href="https://www.bnssearch.com">
              BNSsearch.com
            </a>
          </i>
        </p>
      </header>
    </div>
  );
}

export default App;
