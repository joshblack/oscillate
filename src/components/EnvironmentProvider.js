/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import Environment from '../environment/Environment';

type Props = {|
  environment?: Environment,
  children?: React$Element<*>,
|};

export default class EnvironmentProvider extends React.Component<*, Props, *> {
  // eslint-disable-next-line react/sort-comp
  _environment: Environment;

  static childContextTypes = {
    oscillate: PropTypes.object,
  };

  constructor(props: Props) {
    super();
    const environment = props.environment || new Environment();
    this._environment = environment;
  }

  getChildContext() {
    return {
      oscillate: {
        Environment: this._environment,
      },
    };
  }

  render() {
    return this.props.children;
  }
}
