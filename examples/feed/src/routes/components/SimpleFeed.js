import React from 'react';
import {
  Query,
  EnvironmentProvider,
} from '../../spectrum';
import Item from './Item';

export default class SimpleFeed extends React.Component {
  state = {
    count: 5,
  }

  render() {
    return (
      <EnvironmentProvider>
        <div className="Example">
          <h1>Simple Feed</h1>
          <p>Simple Feed looks to demonstrate a simple <code>Spectrum.Query</code> call, alongside support for <code>componentWillReceiveProps</code> when updating the number of items shown.</p>
          <div>
            <label htmlFor="item-count">Number of items</label>
            <input
              id="item-count"
              type="text"
              value={this.state.count}
              onChange={this._handleOnChange}
            />
          </div>
          <p>Showing the first {this.state.count || 5} items.</p>
          <Query
            path="/api/items"
            params={{
              first: this.state.count || 5,
            }}
            renderLoader={() => <p>Loading...</p>}>
            {(items) => (
              <div>
                {items.map((item) => (
                  <Item key={item.id} item={item} />
                ))}
              </div>
            )}
          </Query>
        </div>
      </EnvironmentProvider>
    );
  }

  _handleOnChange = (event) => {
    this.setState({
      count: event.target.value,
    });
  }
}
