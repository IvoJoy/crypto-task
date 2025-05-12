import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import Header from './components/Header.tsx'
import {
  ReactQueryProvider,
  getReactQueryContext,
} from './context/react-query.tsx'
import reportWebVitals from './reportWebVitals.ts'
import RegisterRoute from './routes/register.tsx'
import TradeRoute from './routes/trade.tsx'
import UserAccountPage from './routes/user.tsx'
import UsersPage from './routes/users.tsx'
import UserHoldingsPage from './routes/holdings.tsx'
import './styles.css'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
})

const routeTree = rootRoute.addChildren([
 
  RegisterRoute(rootRoute),
  TradeRoute(rootRoute),
  UserAccountPage(rootRoute),
  UsersPage(rootRoute),
  UserHoldingsPage(rootRoute),

])

const router = createRouter({
  routeTree,
  context: getReactQueryContext(),
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ReactQueryProvider>
        <RouterProvider router={router} />
      </ReactQueryProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
