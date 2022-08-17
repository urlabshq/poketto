import { AptosAccount, AptosClient, FaucetClient, Types } from 'aptos';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { generateMnemonic } from '../mnemonic';
import { createAccount, loadAccount } from '../account';
import { Storage } from '../storage';
import {
  defaultWalletPreference,
  WalletPreference,
  WalletStorage,
} from './storage';
import { networkConfigs, NetworkProfile } from '../network';
import { useAccountResources } from './hooks';
import { decrypt, encrypt } from '../password';
import { TransactionPayload, WalletState } from './types';
import { WalletContext } from './WalletContext';

interface Props extends PropsWithChildren {
  storage: Storage;
}
export const WalletProvider: React.FunctionComponent<Props> = ({
  children,
  storage,
}) => {
  const walletStorage = useMemo(() => new WalletStorage(storage), [storage]);
  const [accounts, setAccounts] = useState<AptosAccount[]>([]);
  const [oneTimeMnemonic, setOneTimeMnemonic] = useState<string | null>(null);
  const [walletPreference, setWalletPreference] = useState<WalletPreference>(
    defaultWalletPreference
  );
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [state, setState] = useState<WalletState>(
    'account:pending:loadAccount'
  );
  const [networkProfile, _setNetworkProfile] =
    useState<NetworkProfile>('devnet');

  const network = useMemo(
    () => networkConfigs[networkProfile],
    [networkProfile]
  );

  const faucetClient = useMemo(() => {
    return new FaucetClient(network.aptos, network.faucet);
  }, [network]);

  const aptosClient = useMemo(() => {
    return new AptosClient(network.aptos);
  }, [network]);

  const stateAccount = accounts[walletPreference.defaultAccountIndex];
  const loadWallet = async (password: string) => {
    const walletAccounts = await walletStorage.readWalletAccounts();

    if (!walletAccounts || (walletAccounts && walletAccounts.length === 0)) {
      setState('account:fulfilled:noAccount');
    } else {
      if (password) {
        try {
          const accounts = await Promise.all(
            walletAccounts.map((account) =>
              loadAccount(password, account.mnemonic)
            )
          );
          setAccounts(accounts);
          setState('account:fulfilled:activeAccount');
        } catch (e: any) {
          setPassword('');
          setPasswordError(e.message);
        }
      }
    }
  };

  const { data: resources, refetch } = useAccountResources(
    aptosClient,
    stateAccount,
    {
      refetchInterval: 5000,
    }
  );
  const coins = resources
    .filter((resource) => resource.type.startsWith('0x1::coin::CoinStore'))
    .map((resource) => {
      const segments = resource.type.split(':');
      const name = segments[segments.length - 1];
      return {
        name: name.substring(0, name.length - 1),
        balance: Number((resource.data as any).coin.value),
      };
    });

  useEffect(() => {
    loadWallet(password);
  }, [password]);

  useEffect(() => {
    const loadWalletPreference = async () => {
      const preference = await walletStorage.readWalletPreference();
      setWalletPreference(preference);
    };
    loadWalletPreference();
  }, []);

  const createNewAccount = async (password: string) => {
    try {
      setState('account:pending:createAccount');
      const mnemonic = generateMnemonic();
      const { account, encryptedMnemonic, encryptedPrivateKey } =
        await createAccount({ mnemonic, password });

      await walletStorage.addWalletAccount({
        mnemonic: encryptedMnemonic,
        privateKey: encryptedPrivateKey,
      });
      await faucetClient.fundAccount(account.address(), 0);
      setAccounts([...accounts, account]);
      setOneTimeMnemonic(mnemonic);
      setState('account:fulfilled:activeAccount');
    } catch (e) {
      console.error(e);
      setState('account:rejected:createAccount');
    }
  };

  const importAccount = async (mnemonic: string, password: string) => {
    try {
      setState('account:pending:importAccount');

      const { account, encryptedMnemonic, encryptedPrivateKey } =
        await createAccount({ mnemonic, password });

      // To test the imported account
      await aptosClient.getAccountResources(account.address());
      await walletStorage.addWalletAccount({
        mnemonic: encryptedMnemonic,
        privateKey: encryptedPrivateKey,
      });

      setAccounts([...accounts, account]);

      setState('account:fulfilled:importAccount');
    } catch (e) {
      console.error(e);
      setState('account:rejected:importAccount');
    }
  };

  const fundAccountWithFaucet = async (amount: number) => {
    if (stateAccount) {
      try {
        setState('account:pending:faucetFundAccount');
        await faucetClient.fundAccount(stateAccount.address(), amount);
        setState('account:fulfilled:faucetFundAccount');
      } catch (e) {
        console.error(e);
        setState('account:rejected:faucetFundAccount');
      }
    }
  };
  const clearOneTimeMnemonic = () => {
    setOneTimeMnemonic(null);
  };

  const submitTransaction = async (
    payload: Types.TransactionPayload,
    fromAccount?: AptosAccount
  ): Promise<string> => {
    const account = fromAccount || stateAccount;
    if (!account) {
      throw new Error('Undefined account');
    }
    try {
      setState('account:pending:submitTransaction');
      const txnRequest = await aptosClient.generateTransaction(
        account.address(),
        payload
      );

      const signedTxn = await aptosClient.signTransaction(account, txnRequest);
      const transactionRes = await aptosClient.submitTransaction(signedTxn);
      await aptosClient.waitForTransaction(transactionRes.hash);

      setState('account:fulfilled:submitTransaction');
      return transactionRes.hash;
    } catch (e) {
      setState('account:fulfilled:submitTransaction');
      throw e;
    }
  };

  const updatePassword = (password: string) => {
    setPasswordError(null);
    setPassword(password);
  };

  const logout = async () => {
    setState('account:pending:logout');
    await walletStorage.deleteWallet();
    setAccounts([]);
    setPassword('');
    setOneTimeMnemonic(null);
    setState('account:fulfilled:logout');
  };

  const lockWallet = async () => {
    setPassword('');
    setState('account:pending:loadAccount');
  };

  const revealSeedPhrase = async (password: string) => {
    setState('account:pending:revealSeedPhrase');
    const walletAccounts = await walletStorage.readWalletAccounts();

    const wallet = walletAccounts[walletPreference.defaultAccountIndex];
    if (wallet && wallet.mnemonic) {
      try {
        const mnemonic = await decrypt(password, wallet.mnemonic);
        setState('account:fulfilled:revealSeedPhrase');
        return mnemonic;
      } catch (e: unknown) {
        setState('account:rejected:revealSeedPhrase');
        throw e;
      }
    } else {
      setState('account:rejected:revealSeedPhrase');
      throw new Error('No wallet found');
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setState('account:pending:changePassword');
    const walletAccounts = await walletStorage.readWalletAccounts();
    if (walletAccounts.length > 0) {
      const updatedWalletAccounts = await Promise.all(
        walletAccounts.map(async (wallet) => {
          const mnemonic = await decrypt(currentPassword, wallet.mnemonic);
          const privateKey = await decrypt(currentPassword, wallet.privateKey);
          const encryptedMnemonic = await encrypt(newPassword, mnemonic);
          const encryptedPrivateKey = await encrypt(newPassword, privateKey);
          return {
            mnemonic: encryptedMnemonic,
            privateKey: encryptedPrivateKey,
          };
        })
      );

      await walletStorage.writeWalletAccounts(updatedWalletAccounts);
      setState('account:fulfilled:changePassword');
    } else {
      setState('account:rejected:changePassword');
      throw new Error('No wallet found');
    }
  };

  const createNewSiblingAccount = async () => {
    setState('account:pending:createNewSiblingAccount');
    try {
      const mnemonic = generateMnemonic();
      const { account, encryptedMnemonic, encryptedPrivateKey } =
        await createAccount({ mnemonic, password });

      await walletStorage.addWalletAccount({
        mnemonic: encryptedMnemonic,
        privateKey: encryptedPrivateKey,
      });
      await faucetClient.fundAccount(account.address(), 0);
      setAccounts([...accounts, account]);

      setState('account:fulfilled:createNewSiblingAccount');
      return mnemonic;
    } catch (e) {
      console.error(e);
      setState('account:rejected:createNewSiblingAccount');
    }
  };
  const changeDefaultAccountIndex = (index: number) => {
    setWalletPreference({
      ...walletPreference,
      defaultAccountIndex: index,
    });

    refetch();
  };

  const simulateTransaction = async (
    payload: TransactionPayload,
    fromAccount?: AptosAccount
  ) => {
    const account = fromAccount || stateAccount;
    if (!account) {
      throw new Error('Undefined account');
    }
    setState('account:pending:simulateTransaction');
    try {
      const txnRequest = await aptosClient.generateTransaction(
        account.address(),
        payload
      );

      const transactions = await aptosClient.simulateTransaction(
        account,
        txnRequest
      );
      if (transactions.length > 0) {
        setState('account:fulfilled:simulateTransaction');
        return {
          success: transactions[0].success,
          gasUsed: parseInt(transactions[0].gas_used, 10),
          vmStatus: transactions[0].vm_status,
        };
      }

      throw new Error('Invalid transaction');
    } catch (e) {
      setState('account:rejected:simulateTransaction');
      throw e;
    }
  };

  const totalWalletAccount = useMemo(() => accounts.length, [accounts]);

  return (
    <WalletContext.Provider
      value={{
        accounts,
        account: stateAccount,
        state,
        network,
        aptosClient,
        resources,
        coins,
        oneTimeMnemonic,
        password,
        passwordError,
        walletPreference,
        totalWalletAccount,
        changeDefaultAccountIndex,
        createNewSiblingAccount,
        updatePassword,
        createNewAccount,
        importAccount,
        fundAccountWithFaucet,
        simulateTransaction,
        submitTransaction,
        clearOneTimeMnemonic,
        logout,
        lockWallet,
        revealSeedPhrase,
        changePassword,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
