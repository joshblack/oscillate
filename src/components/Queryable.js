/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import SpectrumEnvironment from '../environment/SpectrumEnvironment';

import type {QueryConfig} from '../environment/SpectrumEnvironmentTypes';

export default function createQueryContainer(
  QueryComponent: Class<React$Component<*, *, *>>,
  config: QueryConfig,
) {
  SpectrumEnvironment.prefetch(config);

  return class QueryContainer extends React.Component {
    static contextTypes = {
      spectrum: PropTypes.object,
    };

    state = {
      data: null,
    };

    componentWillMount() {
      const {spectrum} = this.context;
      const data = spectrum.Environment.peak(config);

      this.setState({data});
    }

    render() {
      return <QueryComponent {...this.props} data={this.state.data} />;
    }
  };
}
