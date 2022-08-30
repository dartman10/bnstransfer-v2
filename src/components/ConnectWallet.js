import React from 'react';
import { AppConfig, showConnect, UserSession } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

function authenticate() {
  showConnect({
    appDetails: {
      name: 'BNS Transfer',
      icon: window.location.origin + '/logo512.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

function disconnect() {
  userSession.signUserOut('/');
}

const ConnectWallet = () => {
  if (userSession.isUserSignedIn()) {
    return (
      <div>
        <p className="user-card">
          {userSession.loadUserData().profile.stxAddress.mainnet}
        </p>
        <button className="Connect" onClick={disconnect}>
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="Connect" onClick={authenticate}>
        Connect wallet
      </button>
    </div>
  );
};

export default ConnectWallet;
