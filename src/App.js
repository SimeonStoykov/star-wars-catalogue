import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Catalogue from './components/Catalogue';
import Person from './components/Person';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

function Navigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Link to="/" id="navigation-link">
          <Typography variant="h4" align="center">Star Wars Catalogue</Typography>
        </Link>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <div id="app">
      <Router>
        <Switch>
          <Route exact path="/">
            <Navigation />
            <Catalogue />
          </Route>
          <Route exact path="/person/:id">
            <Navigation />
            <Person />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
