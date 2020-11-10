import { Button } from '@material-ui/core'
import React from 'react'
import { useCookies } from 'react-cookie'
import { Redirect } from 'react-router'
import { spotifyHref } from '../../constants'

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
        href={spotifyHref}
      >
        Authorize Spotify
      </Button>
    </div>
  )
}
