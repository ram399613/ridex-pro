import React from 'react';
import { useSocket } from '../context/SocketContext';

const LiveBadge = () => {
  const { connected } = useSocket();
  const style = {
    position: 'fixed', bottom: 18, left: 18, zIndex: 9997,
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600,
    padding: '6px 12px', borderRadius: 50, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    pointerEvents: 'none', opacity: 0.9,
  };
  const dot = {
    width: 7, height: 7, borderRadius: '50%',
    background: connected ? 'var(--success)' : 'var(--error)',
    boxShadow: connected ? '0 0 6px var(--success)' : 'none',
    animation: connected ? 'ridexPulse 1.5s infinite' : 'none',
  };
  return (
    <div style={style} data-testid="live-badge">
      <style>{`@keyframes ridexPulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <span style={dot}></span>{connected ? 'Live' : 'Reconnecting…'}
    </div>
  );
};

export default LiveBadge;
