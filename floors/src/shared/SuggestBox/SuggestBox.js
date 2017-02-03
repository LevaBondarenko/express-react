/**
 * SuggestBox stateless component
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {PropTypes} from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './SuggestBox.scss';
import {priceFormatter} from '../../utils/Helpers';
import classNames from 'classnames';

const SuggestBox = (props) => {
  const classSet = classNames({
    [s.helpBlock]: true,
    'active': props.suggestActive
  });

  return (
    <div className={`${s.root} ${props.className}`}>
      <div
        style={{display: props.showSuggest ? 'block' : 'none'}}
        className={classSet}
        onClick={props.setSuggestValue} >
        {priceFormatter(props.suggestValue)}
      </div>
    </div>
  );
};

SuggestBox.propTypes = {
  className: PropTypes.string,
  showSuggest: PropTypes.bool,
  suggestValue: PropTypes.number,
  suggestActive: PropTypes.bool,
  setSuggestValue: PropTypes.func
};

export default withStyles(s)(SuggestBox);
