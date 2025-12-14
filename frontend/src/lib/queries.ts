import { queryOptions } from "@tanstack/react-query"
import { getUserData } from "./spotify"

export const accessTokenQuery = queryOptions({
  queryKey: ["access_token"],
  queryFn: () => localStorage.getItem("access_token") || null,
  staleTime: 3600 * 1000,
  meta: {
    isSpotifyQuery: true,
  },
})

export const refreshTokenQuery = queryOptions({
  queryKey: ["refresh_token"],
  queryFn: () => localStorage.getItem("refresh_token") || null,
  //   staleTime: 3600 * 1000,
  meta: {
    isSpotifyQuery: true,
  },
})

export const expiresInQuery = queryOptions({
  queryKey: ["expires_in"],
  queryFn: () => localStorage.getItem("expires_in") || null,
  //   staleTime: 3600 * 1000,
  meta: {
    isSpotifyQuery: true,
  },
})

export const expiresQuery = queryOptions({
  queryKey: ["expires"],
  queryFn: () => {
    const expiresIn = localStorage.getItem("expires")
    if (!expiresIn) {
      return null
    }
    return new Date(expiresIn)
  },
  meta: {
    isSpotifyQuery: true,
  },
  //   staleTime: 3600 * 1000,
})

export const userDataQuery = queryOptions({
  queryKey: ["user_data"],
  queryFn: async () => {
    const userData = await getUserData()
    return userData
  },
  //   staleTime: 3600 * 1000,
  meta: {
    isSpotifyQuery: true,
  },
})
