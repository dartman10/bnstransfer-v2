import { StacksMainnet } from '@stacks/network';
import {
  standardPrincipalCV,
  callReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';
import { userSession } from './ConnectWallet'; //needs refactoring here
import { useContext, createContext } from 'react';

export const BnsContext = createContext(''); //user of this component needs context provider for BnsContext

const ContractCallBnsResolvePrincipal = () => {
  const { setBnsNameContext } = useContext(BnsContext); // only the setter is needed in this case, not the value
  const { setBnsNamespaceContext } = useContext(BnsContext); // only the setter is needed in this case, not the value

  function resolvePrincipal() {
    const contractAddress = 'SP000000000000000000002Q6VF78';
    const contractName = 'bns';
    const functionName = 'resolve-principal';
    const functionArgs = standardPrincipalCV(
      userSession.loadUserData().profile.stxAddress.mainnet
    );
    const network = new StacksMainnet();
    const senderAddress = userSession.loadUserData().profile.stxAddress.mainnet;

    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs: [functionArgs],
      network,
      senderAddress,
    };

    const result = callReadOnlyFunction(options);

    result.then((result) => {
      if (cvToValue(result.value).name.value != null) {
        setBnsNamespaceContext(
          Buffer.from(
            cvToValue(result.value).namespace.value.substr(2),
            'hex'
          ).toString('ascii')
        );
        setBnsNameContext(
          Buffer.from(
            cvToValue(result.value).name.value.substr(2),
            'hex'
          ).toString('ascii')
        );
      } else {
        setBnsNameContext('This account has no BNS name');
      }
    });
  }

  if (!userSession.isUserSignedIn()) {
    return 'user not signed in'; // nothing to render if not signed-in. what's good to return here for caller consumption?
  }

  resolvePrincipal();
  return; //return nothing here. the context returns desired result via setter.
};

export default ContractCallBnsResolvePrincipal;
