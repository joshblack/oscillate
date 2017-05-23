import React from 'react';
import {Link} from 'react-router-dom';

const links = [
  {
    to: '/simple',
    title: 'Simple Feed',
  },
];

const App = () => (
  <div className="App">
    <h1>Examples</h1>
    <ul>
      {links.map((link, i) => (
        <li key={i}>
          <Link to={link.to}>{link.title}</Link>
        </li>
      ))}
    </ul>
  </div>
);

export default App;
