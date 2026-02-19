'use client';

import { useState, useCallback } from 'react';
import { useConfigStore } from '@/store/useConfigStore';
import { serializeConfig } from '@/lib/url-state';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  const store = useConfigStore();

  const handleShare = useCallback(() => {
    const query = serializeConfig(store);
    const url = `${window.location.origin}${window.location.pathname}?${query}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [store]);

  const handleScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'lambo-config.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="flex-1 px-3 py-2 text-[10px] tracking-wider uppercase rounded-sm
          border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20
          transition-all duration-200"
        aria-label="Copy share link"
      >
        {copied ? 'Copied!' : 'Share Link'}
      </button>
      <button
        onClick={handleScreenshot}
        className="flex-1 px-3 py-2 text-[10px] tracking-wider uppercase rounded-sm
          border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20
          transition-all duration-200"
        aria-label="Download screenshot"
      >
        Screenshot
      </button>
    </div>
  );
}
