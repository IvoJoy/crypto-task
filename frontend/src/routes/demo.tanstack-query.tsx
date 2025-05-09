import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import type { RootRoute } from '@tanstack/react-router'

function TanStackQueryDemo() {
  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: async ({queryKey}) => {
      const res = await fetch(
        `http://localhost:8080/${queryKey[0]}`,
      )
      return await res.text()
    },
    initialData: "Nobody there",
  })

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Response from API</h1>
      <ul>
        {data}
      </ul>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/demo/tanstack-query',
    component: TanStackQueryDemo,
    getParentRoute: () => parentRoute,
  })
