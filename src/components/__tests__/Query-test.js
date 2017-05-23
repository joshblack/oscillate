/* @noflow */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

describe('Query Component', () => {
  let context;
  let fetch;
  let Query;
  let Environment;
  let SpectrumEnvironment;

  const genResponse = data => ({
    json: () => Promise.resolve(data),
    status: 200,
  });

  const genFailureResponse = data => ({
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    status: 500,
  });

  beforeEach(() => {
    jest.resetModules();
    // jest.mock('../../environment/SpectrumEnvironment');

    Query = require('../Query').default;
    Environment = require('../EnvironmentProvider').default;
    SpectrumEnvironment = require('../../environment/SpectrumEnvironment')
      .default;
    fetch = require('fbjs/lib/fetchWithRetries');
    context = {
      spectrum: {
        Environment: new SpectrumEnvironment(),
      },
    };
  });

  describe('renderLoader prop', () => {
    it('should render', () => {
      const render = jest.fn(() => <div />);
      const loader = jest.fn(() => <div>Loader</div>);
      const tree = renderer
        .create(
          <Environment>
            <Query
              path="/api/resources"
              renderLoader={loader}
              render={render}
            />
          </Environment>,
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
      expect(loader).toHaveBeenCalled();
      expect(render).not.toHaveBeenCalled();
    });
  });

  describe('render prop', () => {
    it('should render', done => {
      const response = {
        foo: 'bar',
      };
      const render = jest.fn(data => <div>foo: {data.foo}</div>);
      const loader = jest.fn(() => <div>Loader</div>);
      const tree = mount(
        <Environment>
          <Query path="/api/resources" renderLoader={loader} render={render} />
        </Environment>,
      );

      fetch.mock.deferreds[0].resolve(genResponse(response));

      setTimeout(() => {
        expect(tree).toMatchSnapshot();
        done();
      });
    });
  });

  describe('render children', () => {
    it('should render', done => {
      const response = {
        foo: 'bar',
      };
      const render = jest.fn(data => <div>foo: {data.foo}</div>);
      const loader = jest.fn(() => <div>Loader</div>);
      const tree = mount(
        <Environment>
          <Query path="/api/resources" renderLoader={loader}>
            {render}
          </Query>
        </Environment>,
      );

      fetch.mock.deferreds[0].resolve(genResponse(response));

      setTimeout(() => {
        expect(tree).toMatchSnapshot();
        done();
      });
    });
  });

  describe('renderError prop', () => {
    it('should render', done => {
      const render = jest.fn(data => <div>foo: {data.foo}</div>);
      const loader = jest.fn(() => <div>Loader</div>);
      const error = jest.fn(() => <div>Error</div>);
      const tree = mount(
        <Environment>
          <Query
            path="/api/resources"
            render={render}
            renderError={error}
            renderLoader={loader}
          />
        </Environment>,
      );

      fetch.mock.deferreds[0].resolve(
        genFailureResponse({
          error: 'Error',
        }),
      );

      setTimeout(() => {
        expect(tree).toMatchSnapshot();
        done();
      });
    });
  });

  describe('receiving props', () => {
    const scenarios = [
      [
        'should not update with identical requests',
        {
          path: '/api/v1.0/resources',
          params: {
            include: 5,
          },
          cacheConfig: {
            forceFetch: false,
          },
        },
        {
          path: '/api/v1.0/resources',
          params: {
            include: 5,
          },
          cacheConfig: {
            forceFetch: false,
          },
        },
        false,
      ],
      [
        'should update with different paths',
        {
          path: '/api/1',
        },
        {
          path: '/api/2',
        },
        true,
      ],
      [
        'should update with different params',
        {
          path: '/api/1',
          params: {
            include: 5,
          },
        },
        {
          path: '/api/1',
          params: {
            include: 50,
          },
        },
        true,
      ],
      [
        'should update with different headers',
        {
          path: '/api/1',
          headers: {
            Accept: 'application/json',
          },
        },
        {
          path: '/api/1',
          headers: {
            Accept: '*/*',
          },
        },
        true,
      ],
      [
        'should update when the cache config specifies forceFetch',
        {
          path: '/api/1',
          cacheConfig: {
            forceFetch: false,
          },
        },
        {
          path: '/api/1',
          cacheConfig: {
            forceFetch: true,
          },
        },
        true,
      ],
    ];

    scenarios.forEach(scenario => {
      const [
        behavior,
        initialProps,
        nextProps,
        shouldEnqueueRequest,
      ] = scenario;

      it(behavior, () => {
        const render = jest.fn(data => <div>foo: {data.foo}</div>);
        const wrapper = mount(<Query {...initialProps} render={render} />, {
          context,
        });
        const inst = wrapper.instance();
        const spy = jest.spyOn(inst, '_enqueueRequest');

        wrapper.setProps(nextProps);

        const requestCalls = shouldEnqueueRequest ? 1 : 0;
        expect(spy).toHaveBeenCalledTimes(requestCalls);
      });
    });
  });
});
