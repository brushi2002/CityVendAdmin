import { fetchBusinessById } from '../../../actions';
import { notFound } from 'next/navigation';
import BusinessDetailsView from './BusinessDetailsView';

export default async function BusinessDetailsPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) notFound();

  const business = await fetchBusinessById(id);
  if (!business) notFound();

  return <BusinessDetailsView business={business} />;
}
