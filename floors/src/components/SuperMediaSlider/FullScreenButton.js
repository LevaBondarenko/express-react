/**
 * FullScreenButton stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FullScreenButton.scss';

const FullScreenButton = ({isFullScreen, toggleFullScreen, buttonFloat}) => {
  return (<div className={buttonFloat ? s.fullScreenButtonFloat :
    s.fullScreenButton}
      onClick={toggleFullScreen}>
    {isFullScreen ? <Glyphicon glyph='resize-small'/> :
      <Glyphicon glyph='resize-full'/>}
    <span className={s.title}>
      {isFullScreen ? 'свернуть' : 'на весь экран'}
    </span>
  </div>);
};

FullScreenButton.propTypes = {
  toggleFullScreen: React.PropTypes.func,
  isFullScreen: React.PropTypes.bool,
  buttonFloat: React.PropTypes.bool
};

export default withStyles(s)(FullScreenButton);
