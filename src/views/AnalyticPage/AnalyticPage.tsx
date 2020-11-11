import {
  Box,
  Card,
  CardActionArea,
  Avatar,
  CardHeader,
  CardMedia,
  Typography,
  makeStyles,
  CardContent,
  LinearProgress,
  CircularProgress,
} from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import Spotify from 'spotify-web-api-js'
import { spotifyHref } from '../../constants'
import { uniq } from '../../helpers'

const {
  getMySavedAlbums,
  setAccessToken,
  getArtists,
  getMyRecentlyPlayedTracks,
  getMyTopTracks,
  getMyCurrentPlaybackState,
  getMyTopArtists,
} = new Spotify()

const albumSide = '220'

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    background: theme.palette.secondary.light,
    opacity: 0,
  },
  card: {
    width: albumSide,
    position: 'relative',
    ['&:hover .MuiCardHeader-root']: {
      opacity: 1,
    },
  },
  avatar: {
    height: 60,
    width: 60,
  },
  currentPlayCard: {
    display: 'flex',
  },
  currentPlayCover: {
    height: 200,
    width: 200,
  },
  gridBox: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridGap: "10px",
  },
  cardArtistHeader: {
    background: theme.palette.secondary.light,
    height: '50px'
  }
}))

type PlayHistoryObject = {
  track: SpotifyApi.TrackObjectFull
} & Omit<SpotifyApi.PlayHistoryObject, 'track'>

export const AnalyticPage = () => {
  const [latestAlbums, setLatestAlbums] = useState<SpotifyApi.SavedAlbumObject[]>([])
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState<PlayHistoryObject[]>([])
  const [topTracks, setTopTracks] = useState<SpotifyApi.TrackObjectFull[]>([])
  const [artistsInfo, setArtistsInfo] = useState<SpotifyApi.ArtistObjectFull[]>([])
  const [topArtists, setTopArtists] = useState<SpotifyApi.ArtistObjectFull[]>([])
  const [
    currentPlayback,
    setCurrentPlayback,
  ] = useState<SpotifyApi.CurrentPlaybackResponse | null>(null)
  const [{ token }, setCookie] = useCookies(['token'])
  const [loading, setLoading] = useState(false)
  const classes = useStyles()

  useEffect(() => {
    if (!token) {
      const url = new URL(window.location.href.replace('#', '?'))
      const incomingToken = url.searchParams.get('access_token')

      if (incomingToken) {
        setCookie('token', incomingToken)
      } else {
        window.location.assign(spotifyHref)
      }
    }
  }, [])

  useEffect(() => {
    if (token) {
      setAccessToken(token)
      setLoading(true)
      Promise.all([
        getMySavedAlbums({ limit: 9 }).then((res) => {
          setLatestAlbums(res.items)
          return res
        }),
        getMyRecentlyPlayedTracks({ limit: 9 }).then((res) => {
          setRecentlyPlayedTracks(res.items as PlayHistoryObject[])
          return res
        }),
        getMyTopTracks({ limit: 9, time_range: 'short_term' }).then((res) => {
          setTopTracks(res.items)
          return res
        }),
        getMyCurrentPlaybackState().then(setCurrentPlayback),
        getMyTopArtists({ limit: 18 }).then(res => setTopArtists(res.items))
      ])
        .then(([res1, res2, res3]) =>
          getArtists(
            uniq([
              ...res1.items.map(({ album }) => album.artists[0]?.id),
              ...res2.items.map(({ track }) => track.artists[0]?.id),
              ...res3.items.map((track) => track.artists[0]?.id),
            ])
          )
        )
        .then((res) => {
          setArtistsInfo(res.artists)
          setLoading(false)
        })
        .catch(() => {
          setCookie('token', null)
          window.location.assign(spotifyHref)
        })
    }
  }, [token])

  useEffect(() => {
    const interval = setInterval(() => {
      getMyCurrentPlaybackState().then(setCurrentPlayback)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {loading ? (
        <CircularProgress />
      ) : (
          <>
            <Box display="flex" justifyContent="center" style={{ marginTop: "3vw" }}>
              {currentPlayback && (
                <Box>
                  <Box display="inline-flex" paddingBottom="50px">
                    <CardActionArea onClick={() => currentPlayback?.item?.uri && window.location.assign(currentPlayback?.item?.uri)}>
                      <Card className={classes.currentPlayCard}>
                        <Box width="300px">
                          <CardContent style={{ height: '100%' }}>
                            <Box display="flex" flexDirection="column" height="100%">
                              <Box flexGrow={1}>
                                <Typography variant="h5">
                                  Now playing: <strong>{currentPlayback.item?.name}</strong>
                                </Typography>
                                <Typography variant="subtitle1">
                                  {currentPlayback.item?.artists.map(artist => artist.name).join(', ')}
                                </Typography>
                                <Typography variant="subtitle2" color="textSecondary">
                                  {currentPlayback.item?.album.name}
                                </Typography>
                              </Box>

                              {currentPlayback.progress_ms &&
                                currentPlayback.item?.duration_ms && (
                                  <LinearProgress
                                    variant="determinate"
                                    value={
                                      (currentPlayback.progress_ms /
                                        currentPlayback.item?.duration_ms) *
                                      100
                                    }
                                  />
                                )}
                            </Box>
                          </CardContent>
                        </Box>
                        <CardMedia
                          className={classes.currentPlayCover}
                          image={currentPlayback.item?.album.images[0]?.url}
                        />
                      </Card>
                    </CardActionArea>
                  </Box>
                </Box>
              )}
            </Box>

            <Card style={{ margin: "0 3vw" }}>
              <CardHeader title="Your Top Artists" />
              <Box display="grid" gridTemplateColumns="repeat(6, 1fr)" gridGap="20px" padding="0 20px 20px">
                {topArtists.map(({ name, images, uri }) => (
                  <Card key={name}>
                    <CardActionArea onClick={() => window.location.assign(uri)}>
                      <CardMedia
                        component="img"
                        image={images[0]?.url}
                        title={name}
                        height={80}
                      />
                      <CardHeader className={classes.cardArtistHeader} subheader={name} />
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            </Card>


            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gridGap="3vw" padding="3vw">
              <Card>
                <CardHeader title="Your Latest Albums" />
                <CardContent>
                  <Box className={classes.gridBox}>
                    {latestAlbums.map(({ album: { images, name, artists, uri } }) => {
                      const artistInfo = artistsInfo.find(
                        (info) => info.id === artists[0]?.id
                      )
                      return (
                        <Card key={name} className={classes.card}>
                          <CardHeader
                            avatar={
                              artistInfo && (
                                <CardActionArea
                                  onClick={() => window.location.assign(artistInfo.uri)}
                                >
                                  <Avatar
                                    variant="rounded"
                                    src={artistInfo?.images[0]?.url}
                                    className={classes.avatar}
                                  />
                                </CardActionArea>
                              )
                            }
                            title={name}
                            subheader={artists.map((artist) => artist.name).join(', ')}
                            className={classes.cardHeader}
                          />
                          <CardActionArea onClick={() => window.location.assign(uri)}>
                            <CardMedia
                              component="img"
                              image={images[0]?.url}
                              title={name}
                            />
                          </CardActionArea>
                        </Card>
                      )
                    })}
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Your Top Tracks" />
                <CardContent>
                  <Box className={classes.gridBox}>
                    {topTracks.map(({ album: { images }, name, artists, uri }) => {
                      const artistInfo = artistsInfo.find(
                        (info) => info.id === artists[0]?.id
                      )
                      return (
                        <Card key={name} className={classes.card}>
                          <CardHeader
                            avatar={
                              artistInfo && (
                                <CardActionArea
                                  onClick={() => window.location.assign(artistInfo.uri)}
                                >
                                  <Avatar
                                    variant="rounded"
                                    src={artistInfo?.images[0]?.url}
                                    className={classes.avatar}
                                  />
                                </CardActionArea>
                              )
                            }
                            title={name}
                            subheader={artists.map((artist) => artist.name).join(', ')}
                            className={classes.cardHeader}
                          />
                          <CardActionArea onClick={() => window.location.assign(uri)}>
                            <CardMedia
                              component="img"
                              image={images[0]?.url}
                              title={name}
                            />
                          </CardActionArea>
                        </Card>
                      )
                    })}
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Latest Songs" />
                <CardContent>
                  <Box className={classes.gridBox}>
                    {recentlyPlayedTracks.map(
                      ({
                        track: {
                          album: { images },
                          name,
                          artists,
                          uri,
                        },
                        played_at,
                      }) => {
                        const artistInfo = artistsInfo.find(
                          (info) => info.id === artists[0]?.id
                        )
                        return (
                          <Card key={played_at + name} className={classes.card}>
                            <CardHeader
                              avatar={
                                artistInfo && (
                                  <CardActionArea
                                    onClick={() =>
                                      window.location.assign(artistInfo.uri)
                                    }
                                  >
                                    <Avatar
                                      variant="rounded"
                                      src={artistInfo?.images[0]?.url}
                                      className={classes.avatar}
                                    />
                                  </CardActionArea>
                                )
                              }
                              title={name}
                              subheader={artists
                                .map((artist) => artist.name)
                                .join(', ')}
                              className={classes.cardHeader}
                            />
                            <CardActionArea onClick={() => window.location.assign(uri)}>
                              <CardMedia
                                component="img"
                                image={images[0]?.url}
                                title={name}
                              />
                            </CardActionArea>
                          </Card>
                        )
                      }
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </>
        )}
    </div>
  )
}
