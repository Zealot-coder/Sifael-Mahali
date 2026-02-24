import type { Metadata } from 'next';
import OwnerDashboard from '@/components/owner/OwnerDashboard';

export const metadata: Metadata = {
  title: 'Owner Dashboard',
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default function OwnerPage() {
  return <OwnerDashboard />;
}
