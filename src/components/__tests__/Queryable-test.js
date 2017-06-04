/* @noflow */

import React from 'react';
import {renderToString} from 'react-dom/server';

describe('Queryable HOC', () => {
  let fetch;
  let Provider;
  let Environment;
  let Queryable;
  let Feed;
  let env;

  beforeEach(() => {
    fetch = require('fbjs/lib/fetchWithRetries');
    Provider = require('../EnvironmentProvider').default;
    Environment = require('../../environment/Environment').default;
    Queryable = require('../Queryable').default;

    /* eslint-disable react/prop-types */
    class FeedComponent extends React.Component {
      render() {
        return (
          <div>
            {this.props.data.map((item, i) => <div key={i}>{item.name}</div>)}
          </div>
        );
      }
    }
    /* eslint-enable react/prop-types */

    Feed = Queryable(FeedComponent, {
      path: '/api/items',
    });
    env = new Environment();
  });

  it('should renderToString with the given data', async () => {
    const App = () => (
      <Provider environment={env}>
        <Feed />
      </Provider>
    );

    const promise = env.preload();

    fetch.mock.deferreds[0].resolve({
      status: 200,
      json: () =>
        Promise.resolve([{name: 'item 1'}, {name: 'item 2'}, {name: 'item 3'}]),
    });

    await promise;

    expect(renderToString(<App />)).toMatchSnapshot();
  });
});
