import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { LoginPage } from '@/components/auth/LoginPage';

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return <LoginPage />;
}
