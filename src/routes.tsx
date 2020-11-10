import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { AnalyticPage } from './views/AnalyticPage'
import { Home } from './views/Home'

export const Routes = () => {
  return (
    <Switch>
      <Route component={Home} path="/" exact />
      <Route component={AnalyticPage} path="/analyze/" />
    </Switch>
  )
}
