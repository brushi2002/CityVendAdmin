import { getSession } from '../actions';
import { redirect } from 'next/navigation';
import DashboardLayout from './DashboardLayout';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <DashboardLayout email={session.Email}>
      {children}
    </DashboardLayout>
  );
}
