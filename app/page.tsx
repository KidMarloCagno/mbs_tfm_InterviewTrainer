import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { LoginPage } from '@/components/auth/LoginPage';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return <LoginPage />;
}
