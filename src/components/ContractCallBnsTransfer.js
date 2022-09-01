import { useConnect } from '@stacks/connect-react';
import { useState } from 'react';
import { StacksMainnet } from '@stacks/network';
import {} from '@stacks/bns';
import {
  AnchorMode,
  PostConditionMode,
  bufferCVFromString,
  standardPrincipalCV,
  NonFungibleConditionCode,
  makeStandardNonFungiblePostCondition,
  createAssetInfo,
  tupleCV,
  someCV,
  validateStacksAddress,
  callReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';
import { userSession } from './ConnectWallet';

import ContractCallBnsResolvePrincipal, {
  BnsContext,
} from './ContractCallBnsResolvePrincipal';

const ContractCallBnsTransfer = () => {
  const { doContractCall } = useConnect();

  // useState
  const [stxAddress, setStxAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [friendlyMessage, setFriendlyMessage] = useState('');

  // useState for context Resolve Principal
  const [bnsNameContext, setBnsNameContext] = useState();
  const [bnsNamespaceContext, setBnsNamespaceContext] = useState();

  function onClickAttemptTransfer() {
    resetMessages();

    if (!validateStacksAddress(stxAddress)) {
      setErrorMessage('Try again, address not valid.');
      return;
    }

    preTransferBnsName();
  }

  // refactor this function. this is same function as in contractcallbnsresolveprincipal component. need to put them together somehow.
  function preTransferBnsName() {
    const contractAddress = 'SP000000000000000000002Q6VF78';
    const contractName = 'bns';
    const functionName = 'resolve-principal';
    const functionArgs = standardPrincipalCV(stxAddress); //check if new account address already has a BNS
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

    const result = callReadOnlyFunction(options); //result is a promise
    result.then((result) => {
      if (cvToValue(result.value).name.value != null) {
        setErrorMessage(
          'Try again, acct owns ' +
            hexify(cvToValue(result.value).name.value) +
            '.' +
            hexify(cvToValue(result.value).namespace.value)
        );
      } else {
        transferBnsName();
      }
    });
  }

  function hexify(s) {
    let r = [];
    for (let i = 0; i < s.length - 1; i += 2) {
      r.push(String.fromCharCode(parseInt(s.charAt(i) + s.charAt(i + 1), 16)));
    }
    return r.join('');
  }

  function transferBnsName() {
    const bnsContractAddress = 'SP000000000000000000002Q6VF78';
    const bnsContractName = 'bns';
    const bnsNftName = 'names'; //BNS NFT name
    const bnsFunctionNameTransfer = 'name-transfer';
    const bnsOwner = userSession.loadUserData().profile.stxAddress.mainnet;
    const bnsTransferPostConditionCode = NonFungibleConditionCode.DoesNotOwn; //DoesNotOwn = owner sent NFT (BNS)
    const bnsAssetInfo = createAssetInfo(
      bnsContractAddress,
      bnsContractName,
      bnsNftName
    );

    const bnsAssetInfoTokenID = tupleCV({
      namespace: bufferCVFromString(bnsNamespaceContext),
      name: bufferCVFromString(bnsNameContext),
    });

    const bnsTransferPostCondition = makeStandardNonFungiblePostCondition(
      bnsOwner,
      bnsTransferPostConditionCode,
      bnsAssetInfo,
      bnsAssetInfoTokenID
    );

    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: bnsContractAddress,
      contractName: bnsContractName,
      functionName: bnsFunctionNameTransfer,

      functionArgs: [
        bufferCVFromString(bnsNamespaceContext),
        bufferCVFromString(bnsNameContext),
        standardPrincipalCV(stxAddress),
        someCV(bufferCVFromString('')), //noneCV(),
      ],

      postConditionMode: PostConditionMode.Deny,
      postConditions: [bnsTransferPostCondition],

      onFinish: (data) => {
        setFriendlyMessage('Transaction submitted.');
        window //opens a new window, show transaction in Stacks Explorer
          .open(
            `https://explorer.stacks.co/txid/${data.txId}?chain=mainnet`,
            '_blank'
          )
          .focus();
      },
      onCancel: () => {
        setFriendlyMessage('Transfer cancelled.');
      },
    });
  }

  function onChangeSetter(address) {
    setStxAddress(address);
    resetMessages();
  }

  function resetMessages() {
    setErrorMessage('');
    setFriendlyMessage('');
  }

  if (!userSession.isUserSignedIn()) {
    return; // return an empty component if user has not signed-in yet.
  }

  return (
    <div>
      <BnsContext.Provider
        value={{
          bnsNameContext,
          setBnsNameContext,
          bnsNamespaceContext,
          setBnsNamespaceContext,
        }}
      >
        <ContractCallBnsResolvePrincipal />
        <p className="user-card">
          Transfer your BNS name : {bnsNameContext}.{bnsNamespaceContext}
        </p>
      </BnsContext.Provider>
      {bnsNamespaceContext && (
        <div>
          <p>Enter account address of new owner:</p>
          <input
            className="form-input"
            type="text"
            size="60"
            onChange={(e) => onChangeSetter(e.target.value)}
          />
          <p>
            <button
              className="Connect"
              onClick={() => onClickAttemptTransfer()}
            >
              Transfer Name
            </button>
          </p>
          <div className="error-message">{errorMessage}</div>
          <div className="friendly-message">{friendlyMessage}</div>
        </div>
      )}
    </div>
  );
};

export default ContractCallBnsTransfer;
