import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';
import {routes} from './routes';

import './index.css';

const RouteWithSubRoutes = (route) => (
  <Route
    path={route.path}
    exact={true}
    render={(props) => (
      <route.component {...props} routes={route.routes} />
    )}
  />
);

ReactDOM.render(
  <Router>
    <div className="App">
      {routes.map((route, i) => (
        <RouteWithSubRoutes key={i} {...route} />
      ))}
    </div>
  </Router>,
  document.getElementById('root')
);

registerServiceWorker();
