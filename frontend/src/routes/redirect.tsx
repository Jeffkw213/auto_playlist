import { createFileRoute, redirect } from "@tanstack/react-router"
import { fetchToken } from "../lib/spotify"

export const Route = createFileRoute("/redirect")({
  validateSearch: (search) => ({ code: search.code }), // TODO: add zod
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: async ({ context: { queryClient }, deps: { code } }) => {
    if (!code) {
      throw new Error("No code")
    }

    await fetchToken(code, queryClient)
    throw redirect({ to: "/" })
  },
})
