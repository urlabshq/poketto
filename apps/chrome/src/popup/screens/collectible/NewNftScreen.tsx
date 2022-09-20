import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import * as Yup from 'yup';
import IconButton from '@mui/material/IconButton';
import { IoArrowBackOutline } from 'react-icons/io5';
import { yupResolver } from '@hookform/resolvers/yup';
import Stack from '@mui/material/Stack';
import toast from 'react-hot-toast';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../../../ui/Input';
import { TitleHeader } from '../../../ui/TitleHeader';
import { useStackNavigation } from '../../../navigation';
import { useWallet } from '@poketto/core';
import { useBoolean } from '../../hooks/use-boolean';
import InputLabel from '@mui/material/InputLabel';

const formSchema = Yup.object().shape({
  name: Yup.string().required('NFT name is a required field'),
  description: Yup.string().required('NFT description is a required field'),
  uri: Yup.string().required('NFT data is a required field'),
});

export interface CreateNftFormState {
  name: string;
  description: string;
  uri: string;
}

interface Props {
  collectionName?: string;
}
export const NewNftScreen: React.FunctionComponent<Props> = ({
  collectionName,
}) => {
  const { goBack } = useStackNavigation();
  const { createToken } = useWallet();
  const { value: loading, setValue: setLoading } = useBoolean();
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      uri: '',
    },
    resolver: yupResolver(formSchema),
    mode: 'onChange',
  });

  const onFormSubmit = async (data: CreateNftFormState) => {
    setLoading(true);
    try {
      const tokenHash = await createToken({
        ...data,
        collectionName: collectionName || 'MyCollection',
        supply: 1,
      });
      console.info(tokenHash);

      goBack();
      toast.success('Your NFT is created');
    } catch (e: unknown) {
      console.error(e);
      toast.error('Error');
    }
    setLoading(false);
  };

  return (
    <>
      <Box px={1} display="flex" alignItems="center">
        <IconButton onClick={goBack}>
          <IoArrowBackOutline />
        </IconButton>
        <TitleHeader title="Create NFT" />
      </Box>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Stack px={1} spacing={2}>
          <Box>
            <InputLabel shrink>Collection</InputLabel>
            <Typography>{collectionName}</Typography>
          </Box>

          <Controller
            name="name"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <Input
                label="NFT Name"
                placeholder="NFT Name"
                error={!!errors.name?.message}
                helperText={errors.name?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <Input
                label="NFT Description"
                placeholder="NFT Description"
                error={!!errors.name?.message}
                helperText={errors.name?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="uri"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <Input
                label="NFT Data (URI)"
                placeholder="NFT URI"
                error={!!errors.uri?.message}
                helperText={errors.uri?.message}
                {...field}
              />
            )}
          />
          <Button
            variant="contained"
            type="submit"
            disabled={!isValid || loading}
          >
            Create NFT
          </Button>
        </Stack>
      </form>
    </>
  );
};
