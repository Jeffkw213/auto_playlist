import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { redirectToSpotifyAuthorize } from "../lib/spotify"
import { userDataQuery } from "../lib/queries"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { data: userData } = useSuspenseQuery(userDataQuery)

  async function login() {
    const href = await redirectToSpotifyAuthorize()
    navigate({ href })
  }

  if (userData === null) {
    return (
      <div>
        <h1>Welcome to the OAuth2 PKCE Example</h1>
        <button id="login-button" onClick={login}>
          Log in with Spotify
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>
        Logged in as <span>{userData.display_name}</span>
      </h1>
      {userData.images.length > 0 && (
        <img
          width="150"
          src={userData.images[0].url}
          alt={userData.display_name}
        />
      )}
      <table>
        <tr>
          <td>Display name</td>
          <td>{userData.display_name}</td>
        </tr>
        <tr>
          <td>Id</td>
          <td>{userData.id}</td>
        </tr>
        <tr>
          <td>Email</td>
          <td>{userData.email}</td>
        </tr>
        <tr>
          <td>Profile Page</td>
          <td>
            <a href={userData.external_urls.spotify}>User's Spotify Page</a>
          </td>
        </tr>
        <tr>
          <td>API Link</td>
          <td>
            <a href={userData.href}>User's API Link</a>
          </td>
        </tr>
        <tr>
          <td>Country</td>
          <td>{userData.country}</td>
        </tr>
      </table>

      <button
        id="refresh-token-button"
        data-bind-onclick="refreshTokenClick();"
      >
        Refresh Token
      </button>
      <button id="logout-button" data-bind-onclick="logoutClick();">
        Log out
      </button>
    </div>
  )
}
