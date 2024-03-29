import { Types } from 'aptos';

export interface SimulatedTransaction {
  success: boolean;
  gasUsed: number;
  vmStatus: string;
}
export type AccountResource = Types.MoveResource;
export type WalletState =
  | 'account:pending:createAccount'
  | 'account:pending:loadAccount'
  | 'account:fulfilled:noAccount'
  | 'account:fulfilled:activeAccount'
  | 'account:rejected:createAccount'
  | 'account:pending:faucetFundAccount'
  | 'account:fulfilled:faucetFundAccount'
  | 'account:rejected:faucetFundAccount'
  | 'account:pending:importAccount'
  | 'account:fulfilled:importAccount'
  | 'account:rejected:importAccount'
  | 'account:pending:logout'
  | 'account:fulfilled:logout'
  | 'account:rejected:logout'
  | 'account:pending:revealSeedPhrase'
  | 'account:fulfilled:revealSeedPhrase'
  | 'account:rejected:revealSeedPhrase'
  | 'account:pending:revealPrivateKey'
  | 'account:fulfilled:revealPrivateKey'
  | 'account:rejected:revealPrivateKey'
  | 'account:pending:changePassword'
  | 'account:fulfilled:changePassword'
  | 'account:rejected:changePassword'
  | 'account:pending:createNewSiblingAccount'
  | 'account:fulfilled:createNewSiblingAccount'
  | 'account:rejected:createNewSiblingAccount'
  | 'account:pending:simulateTransaction'
  | 'account:fulfilled:simulateTransaction'
  | 'account:rejected:simulateTransaction'
  | 'account:pending:submitTransaction'
  | 'account:fulfilled:submitTransaction'
  | 'account:rejected:submitTransaction'
  | 'account:pending:loadPassword'
  | 'account:fulfilled:loadPassword'
  | 'account:rejected:loadPassword'
  | 'account:pending:addTrustedOrigin'
  | 'account:fulfilled:addTrustedOrigin'
  | 'account:rejected:addTrustedOrigin';

export interface CreateTokenPayload {
  collectionName: string;
  name: string;
  description: string;
  uri: string;
  supply: number;
}

export interface CreateCollectionPayload {
  name: string;
  description: string;
  uri: string;
  maxAmount?: number;
}

export interface TokenCollection {
  sequenceNumber: string;
  collectionName: string;
  creator: string;
  description: string;
  maximum: string;
  uri: string;
}

export interface Transaction {
  version: string;
  vmStatus: string;
  gasUsed: string;
  amount: string;
  timestamp: string;
  type: 'MINT' | 'RECEIVED' | 'SENT' | 'PUBLISH' | 'FUNCTION' | 'UNKNOWN';
  createdAt: Date;
  success: boolean;
  hash: string;
  destination?: string;
  sender: string;
  functionType: string;
}

export interface Token {
  collection: string;
  creator: string;
  amount: number;
  name: string;
  version: number;
}

export interface TokenDetail {
  description: string;
  name: string;
  supply: number;
  collection: string;
  creator: string;
  amount: number;
  version: number;
  uri: string;
}
