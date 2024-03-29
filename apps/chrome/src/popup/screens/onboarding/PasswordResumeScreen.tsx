import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useWallet } from '@poketto/core';
import { Logo } from '../../components/Logo';
import { useStackNavigation } from '../../../navigation';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';

const formSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is mandatory')
    .min(3, 'Password length should be at least 3 characters long'),
});

export interface PasswordResumeFormState {
  password: string;
}
export const PasswordResumeScreen: React.FunctionComponent = () => {
  const { navigate } = useStackNavigation();
  const { updatePassword, passwordError } = useWallet();
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    defaultValues: {
      password: '',
    },
    resolver: yupResolver(formSchema),
    mode: 'onChange',
  });

  const onFormSubmit = (data: PasswordResumeFormState) => {
    updatePassword(data.password);
  };
  return (
    <div className="px-3">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="flex flex-col items-center space-y-4 py-8">
          <Logo className="h-16 w-16" />
          <h3 className="text-2xl text-slate-900 dark:text-slate-200">
            Welcome back
          </h3>
        </div>
        <div className="space-y-4">
          <Controller
            name="password"
            control={control}
            rules={{
              required: true,
            }}
            render={({ field }) => (
              <Input
                type="password"
                placeholder="Password"
                error={!!errors.password?.message}
                helperText={errors.password?.message}
                {...field}
              />
            )}
          />
          {passwordError}
          <Button fullWidth type="submit" disabled={!isValid}>
            Unlock
          </Button>
          <Button
            variant="link"
            fullWidth
            onClick={() => navigate('forgot_password')}
          >
            Forgot password?
          </Button>
        </div>
      </form>
    </div>
  );
};
