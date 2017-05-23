/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import SpectrumEnvironment from '../environment/SpectrumEnvironment';

type Props = {|
  environment?: SpectrumEnvironment,
  children?: React$Element<*>,
|};

export default class EnvironmentProvider extends React.Component<*, Props, *> {
  // eslint-disable-next-line react/sort-comp
  _environment: SpectrumEnvironment;

  static childContextTypes = {
    spectrum: PropTypes.object,
  };

  constructor(props: Props) {
    super();
    const environment = props.environment || new SpectrumEnvironment();
    this._environment = environment;
  }

  getChildContext() {
    return {
      spectrum: {
        Environment: this._environment,
      },
    };
  }

  render() {
    return this.props.children;
  }
}
