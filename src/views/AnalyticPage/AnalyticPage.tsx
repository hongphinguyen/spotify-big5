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
} = new Spotify()

const albumSide = 220

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
    margin: 10,
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
}))

type PlayHistoryObject = {
  track: SpotifyApi.TrackObjectFull
} & Omit<SpotifyApi.PlayHistoryObject, 'track'>

export const AnalyticPage = () => {
  const [latestAlbums, setLatestAlbums] = useState<SpotifyApi.SavedAlbumObject[]>([])
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState<PlayHistoryObject[]>([])
  const [topTracks, setTopTracks] = useState<SpotifyApi.TrackObjectFull[]>([])
  const [artistsInfo, setArtistsInfo] = useState<SpotifyApi.ArtistObjectFull[]>([])
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
        getMySavedAlbums({ limit: 10 }).then((res) => {
          setLatestAlbums(res.items)
          return res
        }),
        getMyRecentlyPlayedTracks({ limit: 10 }).then((res) => {
          setRecentlyPlayedTracks(res.items as PlayHistoryObject[])
          return res
        }),
        getMyTopTracks({ limit: 10 }).then((res) => {
          setTopTracks(res.items)
          return res
        }),
        getMyCurrentPlaybackState().then(setCurrentPlayback),
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
    }
  }, [token])

  useEffect(() => {
    const interval = setInterval(() => {
      getMyCurrentPlaybackState().then(setCurrentPlayback)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    console.log(currentPlayback)
  }, [currentPlayback])

  return (
    <div>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {currentPlayback && (
            <Box>
              <Typography variant="h2" gutterBottom>
                Now Playing
              </Typography>

              <Box display="inline-flex" paddingBottom="50px">
                <Card className={classes.currentPlayCard}>
                  <Box width="300px">
                    <CardContent style={{ height: '100%' }}>
                      <Box display="flex" flexDirection="column" height="100%">
                        <Box flexGrow={1}>
                          <Typography component="h5" variant="h5">
                            {currentPlayback.item?.name}
                          </Typography>
                          <Typography variant="subtitle1" color="textSecondary">
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
              </Box>
            </Box>
          )}

          <Typography variant="h2">Latest Albums</Typography>

          <Box display="flex" flexWrap="wrap">
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
                      height={albumSide}
                    />
                  </CardActionArea>
                </Card>
              )
            })}
          </Box>

          <Typography variant="h2" style={{ marginTop: 50 }}>
            Top Tracks
          </Typography>
          <Box display="flex" flexWrap="wrap">
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
                      height={albumSide}
                    />
                  </CardActionArea>
                </Card>
              )
            })}
          </Box>

          <Typography variant="h2" style={{ marginTop: 50 }}>
            Latest Songs
          </Typography>
          <Box display="flex" flexWrap="wrap">
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
                        height={albumSide}
                      />
                    </CardActionArea>
                  </Card>
                )
              }
            )}
          </Box>
        </>
      )}
    </div>
  )
}
