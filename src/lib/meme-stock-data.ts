
export interface StockDataPoint {
  time: number;
  price: number;
}

export interface MemeStock {
  symbol: string;
  name: string;
  imageUrl: string;
  initialPrice: number;
  volatility: number;
  data: StockDataPoint[];
}

export const memeStocks: Omit<MemeStock, 'data'>[] = [
  {
    symbol: 'DOGE',
    name: 'Doge Coin',
    imageUrl: 'https://i.imgur.com/o7q64zD.png', // Placeholder
    initialPrice: 69.42,
    volatility: 0.2,
  },
  {
    symbol: 'STONKS',
    name: 'Stonks Guy',
    imageUrl: 'https://i.imgur.com/bO3a3mG.png',
    initialPrice: 420.69,
    volatility: 0.1,
  },
  {
    symbol: 'DISTBF',
    name: 'Distracted Boyfriend',
    imageUrl: 'https://i.imgur.com/M0E3S9d.png',
    initialPrice: 123.45,
    volatility: 0.05,
  },
  {
    symbol: 'GRUMPC',
    name: 'Grumpy Cat',
    imageUrl: 'https://i.imgur.com/wOfy3aE.png',
    initialPrice: 99.99,
    volatility: 0.08,
  },
  {
    symbol: 'WIFHAT',
    name: 'Doge Wif Hat',
    imageUrl: 'https://i.imgur.com/sDEtQEW.png',
    initialPrice: 310.50,
    volatility: 0.3,
  },
  {
    symbol: 'PEPE',
    name: 'Pepe the Frog',
    imageUrl: 'https://i.imgur.com/zWbLhYq.png',
    initialPrice: 88.88,
    volatility: 0.15,
  },
];
