import Box from '@mui/material/Box';
import { useWallet } from '@poketto/core';
import { useEffect, useState } from 'react';
import { Types } from 'aptos';

import { TitleHeader } from '../components/TitleHeader';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import get from 'lodash.get';

interface DepositTransaction {
  amount: number;
  type: string;
  sequenceNumber: string;
}
interface SendTransaction {
  version: string;
  vmStatus: string;
  gasUsed: string;
  amount: string;
}
export const ActivityScreen: React.FunctionComponent = () => {
  const { account, resources, aptosClient } = useWallet();
  const [depositTransactions, setDepositTransactions] = useState<
    DepositTransaction[]
  >([]);

  const [sentTransactions, setSendTransactions] = useState<SendTransaction[]>(
    []
  );

  const fetchDepositTransactions = async (coin: Types.AccountResource) => {
    const counter = (coin?.data as any).deposit_events.counter;
    const data = await aptosClient.getEventsByEventHandle(
      account!.address().toString(),
      coin.type,
      'deposit_events',
      { start: counter <= 25 ? 0 : counter - 25 }
    );
    setDepositTransactions(
      data.map((event) => ({
        amount: event.data.amount,
        sequenceNumber: event.sequence_number,
        type: event.type,
      }))
    );
  };

  const fetchSendTransactions = async () => {
    const currentAddress = account!.address().toString();
    const currentAccount = await aptosClient.getAccount(currentAddress);
    const sequence = parseInt(currentAccount.sequence_number);
    const data = await aptosClient.getAccountTransactions(
      currentAddress,
      sequence <= 25 ? undefined : { start: sequence - 25, limit: 25 }
    );

    setSendTransactions(
      data.map((event) => ({
        version: event.version,
        gasUsed: event.gas_used,
        vmStatus: event.vm_status,
        amount: get(event, 'payload.arguments[1]'),
      }))
    );
  };

  useEffect(() => {
    const coin = resources.find((resource) =>
      resource.type.startsWith('0x1::coin::CoinStore')
    );
    fetchSendTransactions();
    if (coin) {
      fetchDepositTransactions(coin);
    }
  }, [resources]);
  return (
    <>
      <Box px={2}>
        <TitleHeader title="Activities" />
      </Box>
      <Stack px={2} spacing={2}>
        {depositTransactions.map((transaction) => (
          <Paper
            key={`deposit-${transaction.sequenceNumber}`}
            sx={{ px: 2, py: 2 }}
          >
            <Typography
              fontWeight="600"
              fontSize="small"
              textTransform="uppercase"
            >
              {transaction.type}
            </Typography>
            <Typography>+{transaction.amount}</Typography>
          </Paper>
        ))}
        {sentTransactions.map((transaction) => (
          <Paper key={`send-${transaction.version}`} sx={{ px: 2, py: 2 }}>
            <Typography
              fontWeight="600"
              fontSize="small"
              textTransform="uppercase"
            >
              Version: {transaction.version}
            </Typography>
            <Typography>-{transaction.amount}</Typography>
          </Paper>
        ))}
      </Stack>
    </>
  );
};
