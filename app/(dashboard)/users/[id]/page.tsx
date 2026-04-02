import { fetchUserById } from '../../../actions';
import { notFound } from 'next/navigation';
import UserDetailsView from './UserDetailsView';

export default async function UserDetailsPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const user = await fetchUserById(id);
  if (!user) notFound();

  return <UserDetailsView user={user} />;
}
