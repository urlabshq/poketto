import { useStackNavigation } from '../../../navigation';
import { IoArrowBackOutline } from 'react-icons/io5';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useWallet } from '@poketto/core';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ForgotPasswordForm,
  ForgotPasswordFormState,
} from './components/ForgotPasswordForm';

export const ForgotPasswordScreen: React.FunctionComponent = () => {
  const { goBack } = useStackNavigation();
  const { importAccount, state } = useWallet();
  const handleImportWallet = async (form: ForgotPasswordFormState) => {
    importAccount(form.mnemonic, form.password);
  };
  useEffect(() => {
    if (state === 'account:rejected:importAccount') {
      toast.error('Invalid mnemonic or the account is not found');
    }
  }, [state]);
  return (
    <Box pb={4}>
      <Box py={1} px={2}>
        <IconButton onClick={goBack}>
          <IoArrowBackOutline />
        </IconButton>
      </Box>
      <Divider />
      <ForgotPasswordForm
        loading={state === 'account:pending:importAccount'}
        onSubmit={handleImportWallet}
      />
    </Box>
  );
};