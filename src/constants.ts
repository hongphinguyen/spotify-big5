const clientId = 'a676f0966c324aa18b3f4a5fde51446c'
const redirectUri =
  process.env.NODE_ENV === 'production'
    ? 'https://main.d35uqst3r5ot6o.amplifyapp.com/analyze'
    : 'http://localhost:3000/analyze'
const responseType = 'token'
const scopes = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-read-recently-played',
  'user-top-read',
  'user-read-playback-state',
]
export const spotifyHref = `https://accounts.spotify.com/authorize?response_type=${responseType}&client_id=${clientId}&scope=${scopes.join(
  '%20'
)}&redirect_uri=${encodeURIComponent(redirectUri)}`
