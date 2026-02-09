'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudyPlansRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/study-plans');
  }, [router]);

  return null;
}
