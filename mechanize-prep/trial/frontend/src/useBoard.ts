import { useEffect, useRef, useState } from 'react';
import type { Action, Board } from './types';

const WS_URL = 'ws://localhost:8000/ws';
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 10000;

export function useBoard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pausedRef = useRef(false);
  const pendingRef = useRef<Board | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const backoffRef = useRef(INITIAL_BACKOFF_MS);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        backoffRef.current = INITIAL_BACKOFF_MS;
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type !== 'state') return;
        if (pausedRef.current) pendingRef.current = msg.board;
        else setBoard(msg.board);
      };

      ws.onclose = () => {
        setConnected(false);
        if (unmountedRef.current) return;
        const delay = backoffRef.current;
        backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS);
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
    };
  }, []);

  const pause = () => {
    pausedRef.current = true;
  };

  const resume = () => {
    pausedRef.current = false;
    if (pendingRef.current) {
      setBoard(pendingRef.current);
      pendingRef.current = null;
    }
  };

  const send = (action: Action) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(action));
    }
  };

  return { board, connected, send, pause, resume };
}
