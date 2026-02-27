import type { Metadata } from 'next';
import OwnerLoginForm from '@/components/owner/OwnerLoginForm';

export const metadata: Metadata = {
  title: 'Owner Login',
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

interface OwnerLoginPageProps {
  searchParams?: {
    next?: string | string[];
  };
}

export default function OwnerLoginPage({ searchParams }: OwnerLoginPageProps) {
  const nextValue = searchParams?.next;
  const nextPath = Array.isArray(nextValue) ? nextValue[0] : nextValue;

  return <OwnerLoginForm nextPath={nextPath} />;
}
