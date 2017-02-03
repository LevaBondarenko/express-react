/**
 * o.e.kurgaev@it.etagi.com
 * simple wrapper on react render
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import {extend} from 'lodash';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import {Provider} from 'react-redux';
const env = canUseDOM ? require('./Helpers.js').getEnv() : 'production';

/**
 * @param {Object} object reactjs widget object
 * @param {Object} props reactjs widget props object
 * @param {Object} global glodal props object
 * @param {Object} node html node object
 * @return {void}
 */
const renderClient = (object, props, global, node) => {
  if (node && object) {
    const {store} = global;

    extend(props, global);
    const component = React.createElement(object, props);

    try {
      ReactDOM.render(<Provider store={store}>{component}</Provider>, node);
    } catch (error) {
      if(env === 'dev') {
        /* eslint-disable no-console */
        console.groupCollapsed('An error occurred in component render');
        console.error(`Component: ${props.mountNode}`);
        console.error(error);
        console.groupEnd();
      }
    }
  }
};

/**
 * @param  {Object} object reactjs widget object
 * @param  {Object} props reactjs widget props object
 * @param  {Object} global glodal props object
 * @return {string} return rendered reactjs component
 */
const renderServer = (object, props, global) => {

  if (object) {
    const {store} = global;

    extend(props, global);
    const component = React.createElement(object, props);

    return ReactDOMServer.renderToString(
      <Provider store={store}>{component}</Provider>
    );

  }
};

export default {renderClient, renderServer};
