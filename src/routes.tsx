import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { AnalyticPage } from './Views/AnalyticPage'
import { Home } from './Views/Home'

export const Routes = () => {
  return (
    <Switch>
      <Route component={Home} path="/" exact />
      <Route component={AnalyticPage} path="/analyze/" />
    </Switch>
  )
}