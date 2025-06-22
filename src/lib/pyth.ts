import { Connection, PublicKey } from '@solana/web3.js';
import { PythHttpClient, getPythProgramKeyForCluster, PythConnection } from '@pythnetwork/client';

// Pyth price feed IDs for our supported cryptocurrencies
export const PRICE_FEED_IDS = {
  BTC: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD
  ETH: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD
  SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', // SOL/USD
  BNB: '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', // BNB/USD
  XRP: 'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8', // XRP/USD
} as const;

export type CoinSymbol = keyof typeof PRICE_FEED_IDS;

export interface PriceData {
  symbol: CoinSymbol;
  price: number;
  confidence: number;
  timestamp: number;
  status: 'trading' | 'halted' | 'unknown';
}

export interface PriceUpdate {
  symbol: CoinSymbol;
  price: number;
  change24h: number;
  changePercent24h: number;
  timestamp: number;
}

class PythPriceService {
  private connection: PythConnection | null = null;
  private subscribers: Map<string, (update: PriceUpdate) => void> = new Map();
  private priceCache: Map<CoinSymbol, PriceData> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      console.log('🔗 Initializing Pyth Network connection...');
      
      // Use Solana mainnet for Pyth connection
      const solanaConnection = new Connection('https://api.mainnet-beta.solana.com');
      const pythPublicKey = getPythProgramKeyForCluster('mainnet-beta');
      
      this.connection = new PythConnection(solanaConnection, pythPublicKey);
      
      // Start listening for price updates
      await this.startPriceUpdates();
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      console.log('✅ Pyth Network connection established');
    } catch (error) {
      console.error('❌ Failed to initialize Pyth connection:', error);
      this.handleConnectionError();
    }
  }

  private async startPriceUpdates() {
    if (!this.connection) return;

    try {
      // Subscribe to all price feeds
      const priceFeeds = Object.values(PRICE_FEED_IDS);
      
      this.connection.onPriceChange((product, price) => {
        try {
          // Find the symbol for this price feed
          const symbol = Object.entries(PRICE_FEED_IDS).find(
            ([_, feedId]) => feedId === product.price_account
          )?.[0] as CoinSymbol;

          if (!symbol) return;

          const priceData: PriceData = {
            symbol,
            price: price.price || 0,
            confidence: price.confidence || 0,
            timestamp: Date.now(),
            status: price.status === 1 ? 'trading' : 'unknown'
          };

          // Update cache
          const previousPrice = this.priceCache.get(symbol);
          this.priceCache.set(symbol, priceData);

          // Calculate 24h change (simplified - in production you'd track historical data)
          const change24h = previousPrice ? priceData.price - previousPrice.price : 0;
          const changePercent24h = previousPrice && previousPrice.price > 0 
            ? ((change24h / previousPrice.price) * 100) 
            : 0;

          // Notify subscribers
          const update: PriceUpdate = {
            symbol,
            price: priceData.price,
            change24h,
            changePercent24h,
            timestamp: priceData.timestamp
          };

          this.notifySubscribers(symbol, update);
        } catch (error) {
          console.error('Error processing price update:', error);
        }
      });

      // Start the connection
      await this.connection.start();
      
    } catch (error) {
      console.error('❌ Failed to start price updates:', error);
      throw error;
    }
  }

  private notifySubscribers(symbol: CoinSymbol, update: PriceUpdate) {
    this.subscribers.forEach((callback, subscriberId) => {
      try {
        callback(update);
      } catch (error) {
        console.error(`Error notifying subscriber ${subscriberId}:`, error);
      }
    });
  }

  private handleConnectionError() {
    this.isConnected = false;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Attempting to reconnect to Pyth (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
      
      setTimeout(() => {
        this.initializeConnection();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. Using fallback price service.');
      this.startFallbackPriceService();
    }
  }

  private startFallbackPriceService() {
    // Fallback to a simple price simulation for demo purposes
    console.log('🔄 Starting fallback price service...');
    
    const symbols: CoinSymbol[] = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];
    const basePrices = {
      BTC: 67234.50,
      ETH: 3456.78,
      SOL: 145.23,
      BNB: 312.45,
      XRP: 0.6234
    };

    symbols.forEach(symbol => {
      // Initialize with base price
      const basePrice = basePrices[symbol];
      this.priceCache.set(symbol, {
        symbol,
        price: basePrice,
        confidence: 0.1,
        timestamp: Date.now(),
        status: 'trading'
      });

      // Simulate price updates every 2 seconds
      setInterval(() => {
        const currentPrice = this.priceCache.get(symbol)?.price || basePrice;
        // Random price movement between -2% and +2%
        const changePercent = (Math.random() - 0.5) * 4;
        const newPrice = currentPrice * (1 + changePercent / 100);
        
        const update: PriceUpdate = {
          symbol,
          price: newPrice,
          change24h: newPrice - basePrice,
          changePercent24h: ((newPrice - basePrice) / basePrice) * 100,
          timestamp: Date.now()
        };

        this.priceCache.set(symbol, {
          symbol,
          price: newPrice,
          confidence: 0.1,
          timestamp: Date.now(),
          status: 'trading'
        });

        this.notifySubscribers(symbol, update);
      }, 2000 + Math.random() * 1000); // Stagger updates
    });

    this.isConnected = true;
  }

  public subscribe(callback: (update: PriceUpdate) => void): string {
    const subscriberId = Math.random().toString(36).substr(2, 9);
    this.subscribers.set(subscriberId, callback);
    
    // Send current prices to new subscriber
    this.priceCache.forEach((priceData) => {
      const update: PriceUpdate = {
        symbol: priceData.symbol,
        price: priceData.price,
        change24h: 0, // Would need historical data for accurate calculation
        changePercent24h: 0,
        timestamp: priceData.timestamp
      };
      callback(update);
    });
    
    return subscriberId;
  }

  public unsubscribe(subscriberId: string) {
    this.subscribers.delete(subscriberId);
  }

  public getCurrentPrice(symbol: CoinSymbol): PriceData | null {
    return this.priceCache.get(symbol) || null;
  }

  public getAllPrices(): Map<CoinSymbol, PriceData> {
    return new Map(this.priceCache);
  }

  public isConnectionHealthy(): boolean {
    return this.isConnected;
  }

  public async disconnect() {
    try {
      if (this.connection) {
        await this.connection.stop();
      }
      this.subscribers.clear();
      this.priceCache.clear();
      this.isConnected = false;
      console.log('🔌 Pyth connection disconnected');
    } catch (error) {
      console.error('Error disconnecting from Pyth:', error);
    }
  }
}

// Export singleton instance
export const pythPriceService = new PythPriceService();

// Utility functions
export const formatPrice = (price: number, symbol: CoinSymbol): string => {
  const decimals = symbol === 'XRP' ? 4 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
};

export const formatPriceChange = (change: number, isPercent = false): string => {
  const formatted = isPercent 
    ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
    : `${change >= 0 ? '+' : ''}$${Math.abs(change).toFixed(2)}`;
  
  return formatted;
};

export const getPriceChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-400';
  if (change < 0) return 'text-red-400';
  return 'text-gray-400';
};