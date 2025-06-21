import { useState, useEffect, useRef, useCallback } from 'react';

// Pyth Network price feed IDs for our supported cryptocurrencies
const PYTH_PRICE_FEEDS = {
  'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD
  'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD
  'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', // SOL/USD
  'BNB': '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', // BNB/USD
  'XRP': '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8'  // XRP/USD
};

interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
  confidence: number;
  status: 'trading' | 'halted' | 'auction';
}

interface UsePythWebSocketReturn {
  prices: Record<string, PriceData>;
  connected: boolean;
  error: string | null;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
  getPrice: (symbol: string) => PriceData | null;
}

export const usePythWebSocket = (): UsePythWebSocketReturn => {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedSymbolsRef = useRef<Set<string>>(new Set());
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      console.log('🔌 Connecting to Pyth WebSocket...');
      
      // Use Pyth's WebSocket endpoint
      const ws = new WebSocket('wss://hermes.pyth.network/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Pyth WebSocket connected');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Resubscribe to previously subscribed symbols
        if (subscribedSymbolsRef.current.size > 0) {
          const symbols = Array.from(subscribedSymbolsRef.current);
          subscribeToFeeds(symbols);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types from Pyth
          if (data.type === 'price_update') {
            const priceUpdate = data.price_feed;
            
            // Find the symbol for this price feed ID
            const symbol = Object.keys(PYTH_PRICE_FEEDS).find(
              key => PYTH_PRICE_FEEDS[key as keyof typeof PYTH_PRICE_FEEDS] === priceUpdate.id
            );

            if (symbol && priceUpdate.price) {
              const priceData: PriceData = {
                symbol,
                price: priceUpdate.price.price * Math.pow(10, priceUpdate.price.expo),
                timestamp: priceUpdate.price.publish_time * 1000, // Convert to milliseconds
                confidence: priceUpdate.price.conf * Math.pow(10, priceUpdate.price.expo),
                status: priceUpdate.price.status === 1 ? 'trading' : 'halted'
              };

              setPrices(prev => ({
                ...prev,
                [symbol]: priceData
              }));

              console.log(`📊 ${symbol} price update:`, priceData.price);
            }
          }
        } catch (err) {
          console.error('❌ Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 Pyth WebSocket disconnected:', event.code, event.reason);
        setConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Failed to connect to price feed after multiple attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Pyth WebSocket error:', error);
        setError('WebSocket connection error');
      };

    } catch (err) {
      console.error('❌ Error creating WebSocket connection:', err);
      setError('Failed to create WebSocket connection');
    }
  }, []);

  const subscribeToFeeds = useCallback((symbols: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, cannot subscribe');
      return;
    }

    const priceIds = symbols
      .map(symbol => PYTH_PRICE_FEEDS[symbol as keyof typeof PYTH_PRICE_FEEDS])
      .filter(Boolean);

    if (priceIds.length === 0) {
      console.warn('⚠️ No valid price feed IDs found for symbols:', symbols);
      return;
    }

    const subscribeMessage = {
      type: 'subscribe',
      ids: priceIds
    };

    console.log('📡 Subscribing to price feeds:', symbols);
    wsRef.current.send(JSON.stringify(subscribeMessage));
  }, []);

  const subscribe = useCallback((symbols: string[]) => {
    symbols.forEach(symbol => subscribedSymbolsRef.current.add(symbol));
    subscribeToFeeds(symbols);
  }, [subscribeToFeeds]);

  const unsubscribe = useCallback((symbols: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const priceIds = symbols
      .map(symbol => PYTH_PRICE_FEEDS[symbol as keyof typeof PYTH_PRICE_FEEDS])
      .filter(Boolean);

    if (priceIds.length === 0) {
      return;
    }

    const unsubscribeMessage = {
      type: 'unsubscribe',
      ids: priceIds
    };

    console.log('📡 Unsubscribing from price feeds:', symbols);
    wsRef.current.send(JSON.stringify(unsubscribeMessage));

    symbols.forEach(symbol => subscribedSymbolsRef.current.delete(symbol));
  }, []);

  const getPrice = useCallback((symbol: string): PriceData | null => {
    return prices[symbol] || null;
  }, [prices]);

  // Initialize connection on mount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  return {
    prices,
    connected,
    error,
    subscribe,
    unsubscribe,
    getPrice
  };
};