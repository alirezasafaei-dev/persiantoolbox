'use client';

import { useCallback } from 'react';
import Button from '@/shared/ui/Button';
import { useToast } from '@/shared/ui/toast-context';

type Props = {
  title: string;
  summary: string;
  url?: string;
};

export default function ShareResult({ title, summary, url }: Props) {
  const { showToast } = useToast();

  const handleShare = useCallback(async () => {
    const shareUrl = url ?? window.location.href;
    const shareText = `${title}\n${summary}\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: summary, url: shareUrl });
      } catch {
        // user cancelled
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      showToast('لینک کپی شد', 'success');
    } catch {
      showToast('خطا در کپی', 'error');
    }
  }, [title, summary, url, showToast]);

  return (
    <Button variant="secondary" onClick={handleShare}>
      اشتراک‌گذاری نتیجه
    </Button>
  );
}
