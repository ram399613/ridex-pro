import React from 'react';
import { useSocket } from '../context/SocketContext';

const LiveBadge = () => {
  const { connected } = useSocket();
  return (
    <div className="fixed bottom-5 left-5 z-40 pointer-events-none flex items-center gap-1.5 bg-ink-800 border border-ink-700 text-muted-faint text-xs font-semibold px-3 py-1.5 rounded-full shadow-card opacity-90" data-testid="live-badge">
      <span
        className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulseDot shadow-[0_0_6px_theme(colors.green.500)]' : 'bg-red-500'}`}
      />
      {connected ? 'Live' : 'Reconnecting…'}
    </div>
  );
};

export default LiveBadge;
