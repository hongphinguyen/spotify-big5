import { Button } from '@material-ui/core'
import React from 'react'
import { useCookies } from 'react-cookie'
import { Redirect } from 'react-router'
import { spotifyHref } from '../../constants'
import spotify from '../../assets/spotify.png'

export const Home = () => {
  const [{ token }] = useCookies(['token'])

  if (token) {
    return <Redirect to={'/analyze'} />
  }

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<img src={spotify} style={{ height: 20, width: 20 }} />}
        href={spotifyHref}
      >
        Authorize Spotify
      </Button>
    </div>
  )
}
