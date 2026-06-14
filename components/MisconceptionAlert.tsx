'use client';

import { useEffect } from 'react';

interface MisconceptionAlertProps {
  alert: string;
  onDismiss: () => void;
}

export default function MisconceptionAlert({ alert, onDismiss }: MisconceptionAlertProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Strip leading decorative symbols from alert text.
  const cleanAlert = alert.replace(/^[^\w\s]*/, '').trim();

  return (
    <div className="animate-alert-slide flex items-start gap-3 px-4 py-3 bg-[#F59E0B08] border border-[#F59E0B30] rounded-xl text-sm text-[#F59E0B]">
      <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border border-[#F59E0B50] flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
      </div>
      <span className="leading-snug">{cleanAlert}</span>
    </div>
  );
}
