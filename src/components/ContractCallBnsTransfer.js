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
} from '@stacks/transactions';
import { userSession } from './ConnectWallet';
import ContractCallBnsResolvePrincipal, {
  BnsContext,
} from './ContractCallBnsResolvePrincipal';

const ContractCallBnsTransfer = () => {
  const { doContractCall } = useConnect();

  // useState
  const [stxAddress, setStxAddress] = useState('');

  // state for Resolve Principal context
  const [bnsNameContext, setBnsNameContext] = useState();
  const [bnsNamespaceContext, setBnsNamespaceContext] = useState();

  function transferBnsName() {
    // To Do : before proceeding, check valid stxAddress, bns name and namespace. then display UI error message.

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
        window //opens a new window, show transaction in Stacks Explorer
          .open(
            `https://explorer.stacks.co/txid/${data.txId}?chain=mainnet`,
            '_blank'
          )
          .focus();
        // need to do more fancy stuff here, like a pending txn spinning wheel
      },
      onCancel: () => {
        console.log('onCancel:', 'Transaction was canceled');
      },
    });
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

      <p>Enter account address of new owner:</p>
      <input
        className="form-input"
        type="text"
        size="60"
        onChange={(e) => setStxAddress(e.target.value)}
      />
      <p>
        <button className="Connect" onClick={() => transferBnsName()}>
          Transfer Name
        </button>
      </p>
    </div>
  );
};

export default ContractCallBnsTransfer;
