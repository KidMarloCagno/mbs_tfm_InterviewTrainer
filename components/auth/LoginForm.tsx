"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    const result = await signIn('credentials', {
      redirect: false,
      username: data.username,
      password: data.password,
    });

    if (result?.error) {
      setFormError('Invalid credentials.');
      return;
    }

    router.replace('/dashboard');
  };

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-1">
        <label htmlFor="username" className="text-sm text-[#8b949e]">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          className="login-input"
          {...register('username')}
          aria-invalid={Boolean(errors.username)}
        />
        {errors.username ? <p className="text-xs login-error">{errors.username.message}</p> : null}
      </div>

      <div className="grid gap-1">
        <label htmlFor="password" className="text-sm text-[#8b949e]">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="login-input"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? <p className="text-xs login-error">{errors.password.message}</p> : null}
      </div>

      {formError ? (
        <p className="text-sm login-error" role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="login-button" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
