/**
 * DemoDescription stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';

import GeminiScrollbar from 'react-gemini-scrollbar';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './DemoDescription.scss';

const DemoDescription = ({data}) => {
  return (<div className={s.demoDescription}>
      <GeminiScrollbar className={s.demoScroll}>
        {data}
      </GeminiScrollbar>
    </div>);
};

DemoDescription.propTypes = {
  data: React.PropTypes.string
};

export default withStyles(s)(DemoDescription);
