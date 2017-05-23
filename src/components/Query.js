/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import areEqual from 'fbjs/lib/areEqual';

import type {URLParams} from '../url';
import type {
  CacheConfig,
  Disposable,
} from '../environment/SpectrumEnvironmentTypes';

const primitiveTypes = [PropTypes.bool, PropTypes.string, PropTypes.number];

type Props = {|
  path: string,
  params: URLParams,
  headers?: {[key: string]: string},
  render?: (value: mixed) => ?React$Element<any>,
  renderLoader?: () => ?React$Element<any>,
  renderError?: (error: Error) => ?React$Element<any>,
  children?: (value?: mixed) => ?React$Element<any>,
  cacheConfig: CacheConfig,
|};

type State = {|
  error: ?Error,
  response: ?mixed,
  isLoading: boolean,
|};

export default class Query extends React.Component<*, Props, State> {
  // eslint-disable-next-line react/sort-comp
  _handler: Disposable;

  static propTypes = {
    path: PropTypes.string.isRequired,
    params: PropTypes.objectOf(
      PropTypes.oneOfType([
        ...primitiveTypes,
        PropTypes.arrayOf(PropTypes.oneOfType(primitiveTypes)),
      ]),
    ),
    headers: PropTypes.objectOf(PropTypes.string),
    render: PropTypes.func,
    children: PropTypes.func,
    renderError: PropTypes.func,
    renderLoader: PropTypes.func,
    cacheConfig: PropTypes.objectOf(PropTypes.oneOfType(primitiveTypes)),
  };

  static contextTypes = {
    spectrum: PropTypes.object,
  };

  static defaultProps = {
    cacheConfig: {
      forceFetch: false,
    },
  };

  state = {
    error: null,
    response: null,
    isLoading: true,
  };

  componentWillMount() {
    this._enqueueRequest(
      this.props.path,
      this.props.params,
      this.props.headers,
      this.props.cacheConfig,
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    const previousRequest = {
      path: this.props.path,
      params: this.props.params,
      headers: this.props.headers,
      cacheConfig: this.props.cacheConfig,
    };
    const possibleRequest = {
      path: nextProps.path,
      params: nextProps.params,
      headers: nextProps.headers,
      cacheConfig: nextProps.cacheConfig,
    };

    if (areEqual(previousRequest, possibleRequest)) {
      return;
    }

    this.setState(
      {
        error: null,
        response: null,
        isLoading: true,
      },
      () => {
        this._enqueueRequest(
          nextProps.path,
          nextProps.params,
          nextProps.headers,
          nextProps.cacheConfig,
        );
      },
    );
  }

  componentWillUnmount() {
    if (this._handler) {
      this._handler.dispose();
    }
  }

  render() {
    const {children, render, renderError, renderLoader} = this.props;
    const {error, response, isLoading} = this.state;

    if (error && renderError !== undefined) {
      return renderError(error);
    }

    if (isLoading && renderLoader !== undefined) {
      return renderLoader();
    }

    if (response && render !== undefined) {
      return render(response);
    }

    if (children !== undefined) {
      return children(response);
    }

    return null;
  }

  _enqueueRequest = (
    path: string,
    params?: URLParams,
    headers?: {[key: string]: string},
    cacheConfig?: CacheConfig,
  ): void => {
    const {spectrum} = this.context;
    if (this._handler) {
      this._handler.dispose();
    }

    this._handler = spectrum.Environment.sendQuery({
      path,
      params,
      cacheConfig,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      onSuccess: this._handleResponse,
      onFailure: this._handleRequestError,
    });
  };

  _handleResponse = (response: mixed): void => {
    this.setState({
      response,
      error: null,
      isLoading: false,
    });
  };

  _handleRequestError = (error: Error): void => {
    this.setState({
      error,
      response: null,
      isLoading: false,
    });
  };
}
