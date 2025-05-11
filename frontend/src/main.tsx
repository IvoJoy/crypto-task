import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Header from './components/Header.tsx'
import {
  ReactQueryProvider,
  getReactQueryContext,
} from './context/react-query.tsx'
import reportWebVitals from './reportWebVitals.ts'
import TickerTableRoute from './routes/tickers.tsx'
import './styles.css'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </>
  ),
})

const routeTree = rootRoute.addChildren([
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: App,
  }),
  TickerTableRoute(rootRoute),
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
