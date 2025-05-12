// The info is not available in the Kraken WebSocket API, so we hardcode it here for demonstration purposes.
// In a real-world application, you would fetch this data from the Kraken REST API.
export const symbolToName: Record<string, string> = {
  'BTC/USD': 'Bitcoin',
  'USDT/USD': 'Tether',
  'ETH/USD': 'Ethereum',
  'XRP/USD': 'Ripple',
  'ADA/USD': 'Cardano',
  'SOL/USD': 'Solana',
  'DOGE/USD': 'Dogecoin',
  'DOT/USD': 'Polkadot',
  'LTC/USD': 'Litecoin',
  'LINK/USD': 'Chainlink',
  'BCH/USD': 'Bitcoin Cash',
  'XLM/USD': 'Stellar',
  'FIL/USD': 'Filecoin',
  'EOS/USD': 'EOS',
  'TRX/USD': 'TRON',
  'ETC/USD': 'Ethereum Classic',
  'UNI/USD': 'Uniswap',
  'MATIC/USD': 'Polygon',
  'AAVE/USD': 'Aave',
  'ALGO/USD': 'Algorand',
}