/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import Environment from '../environment/Environment';

import type {QueryConfig} from '../environment/EnvironmentTypes';

export default function createQueryContainer(
  QueryComponent: Class<React$Component<*, *, *>>,
  config: QueryConfig,
) {
  Environment.prefetch(config);

  return class QueryContainer extends React.Component {
    static contextTypes = {
      oscillate: PropTypes.object,
    };

    state = {
      data: null,
    };

    componentWillMount() {
      const {oscillate} = this.context;
      const data = oscillate.Environment.peak(config);

      this.setState({data});
    }

    render() {
      return <QueryComponent {...this.props} data={this.state.data} />;
    }
  };
}
