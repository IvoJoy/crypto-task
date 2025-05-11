import { useQuery } from '@tanstack/react-query'
import { useTickerUpdates } from '../hooks/use-ticker-updates'
import { type TickerUpdate } from '../validation/ticker-update'
import { createRoute, RootRoute } from '@tanstack/react-router'

const fetchTickers = async (): Promise<Record<string, TickerUpdate>> => {
  const apiHost = import.meta.env.VITE_API_HOST || 'localhost'
  const res = await fetch(`http://${apiHost}:8080/api/v1/tickers`)
  return res.json()
}

function TickerTable() {
  useTickerUpdates()

  const { data, isLoading } = useQuery({
    queryKey: ['tickers'],
    queryFn: fetchTickers,
    initialData: {},
  })

  if (isLoading) return <p>Loading...</p>

  return (
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Bid</th>
          <th>Ask</th>
          <th>Last</th>
          <th>Volume</th>
          <th>Change (%)</th>
        </tr>
      </thead>
      <tbody>
        {Object.values(data!).map((symbolData) => (
          <tr key={symbolData.symbol}>
            <td>{symbolData.symbol}</td>
            <td>{symbolData.bid}</td>
            <td>{symbolData.ask}</td>
            <td>{symbolData.last}</td>
            <td>{symbolData.volume}</td>
            <td>{symbolData.change_pct}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/tickers',
    component: TickerTable,
    getParentRoute: () => parentRoute,
  })
