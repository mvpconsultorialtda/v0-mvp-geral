'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function GoBackButton({ label = 'Voltar' }: { label?: string }) {
  const router = useRouter();

  return (
    <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0">
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
