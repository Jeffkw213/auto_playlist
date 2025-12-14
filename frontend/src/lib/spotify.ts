import {
  accessTokenQuery,
  refreshTokenQuery,
  expiresInQuery,
  expiresQuery,
} from "./queries"
import type { QueryClient, QueryKey } from "@tanstack/react-query"
import { queryClient } from "./queryClient"

const clientId = "767f923f785d4aaa99b9b279f48ecc49" // your clientId
// TODO: fix
const redirectUrl = "http://127.0.0.1:8080/redirect" // your redirect URL - must be localhost URL and/or HTTPS

const authorizationEndpoint = "https://accounts.spotify.com/authorize"
const tokenEndpoint = "https://accounts.spotify.com/api/token"
const scope = "user-read-private user-read-email"

export async function redirectToSpotifyAuthorize() {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const randomValues = crypto.getRandomValues(new Uint8Array(64))
  const randomString = randomValues.reduce(
    (acc, x) => acc + possible[x % possible.length],
    "",
  )

  const code_verifier = randomString
  const data = new TextEncoder().encode(code_verifier)
  const hashed = await crypto.subtle.digest("SHA-256", data)

  const code_challenge_base64 = btoa(
    String.fromCharCode(...new Uint8Array(hashed)),
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  localStorage.setItem("code_verifier", code_verifier)
  console.log(localStorage.getItem("code_verifier"))

  const authUrl = new URL(authorizationEndpoint)
  const params = {
    response_type: "code",
    client_id: clientId,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: code_challenge_base64,
    redirect_uri: redirectUrl,
  }

  authUrl.search = new URLSearchParams(params).toString()
  return authUrl.toString()
}

export async function fetchToken(code: unknown, queryClient: QueryClient) {
  if (typeof code !== "string") {
    throw new Error("Code must be a string")
  }

  const code_verifier = localStorage.getItem("code_verifier")
  console.log(code_verifier)
  if (!code_verifier) {
    throw new Error("No code verifier")
  }
  // window.localStorage.removeItem("code_verifier")

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUrl,
      code_verifier: code_verifier,
    }),
  })

  const responseText = await response.text()

  let data
  try {
    data = JSON.parse(responseText)
  } catch (_error) {
    throw new Error(data)
  }

  if (!data.access_token) {
    throw new Error("No access token")
  }
  if (!data.refresh_token) {
    throw new Error("No refresh token")
  }
  if (!data.expires_in) {
    throw new Error("No expires in")
  }

  const { access_token, refresh_token, expires_in } = data

  setLocalStorageValue(access_token, accessTokenQuery.queryKey)
  setLocalStorageValue(refresh_token, refreshTokenQuery.queryKey)
  setLocalStorageValue(expires_in, expiresInQuery.queryKey)

  const now = new Date()
  const expiry = new Date(now.getTime() + expires_in * 1000)
  setLocalStorageValue(expiry.toISOString(), expiresQuery.queryKey)

  queryClient.invalidateQueries({
    predicate: (query) => (query.meta?.isSpotifyQuery as boolean) || false,
  })
}

function setLocalStorageValue(value: string, queryKey: QueryKey) {
  if (queryKey.length !== 1 || typeof queryKey[0] !== "string") {
    throw new Error("Invalid query key")
  }
  const key = queryKey[0] as string

  localStorage.setItem(key, value)
}

export async function getUserData() {
  const accessToken = await queryClient.fetchQuery(accessTokenQuery)
  if (!accessToken) {
    return null
  }

  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: "Bearer " + accessToken },
  })

  const responseText = await response.text()

  let data
  try {
    data = JSON.parse(responseText)
  } catch (_error) {
    console.error(responseText)
    throw new Error(responseText)
  }

  return data
}
