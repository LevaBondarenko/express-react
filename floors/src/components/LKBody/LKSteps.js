/**
 * LK Steps component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {size} from 'lodash';

import s from './lksteps.scss';

const LKSteps = ({
  onChange, steps, step, prefix, suffix, errorSteps
}) => {
  const blockWidth = steps > 0 ? (100 / steps) : 100;
  const width = 100 + blockWidth;
  const margin = -(blockWidth / 2);
  let stepsBlock = [];

  for(let i = 0; i < steps; i++) {
    const active = i === (step ? step : 0);
    const beforeActive = i < (step ? step : 0);
    const err = errorSteps.indexOf(i) > -1;

    stepsBlock.push(
      <span
        className={classNames(
          s.stepBlock,
          {[s.stepActive]: active},
          {[s.stepBeforeActive]: beforeActive},
          {[s.stepAfterActive]: !beforeActive}
        )}
        style={{width: `${blockWidth}%`}}>
        <span
          className={classNames(s.stepClickable, {[s.withError]: err})}
          id={i} onClick={onChange}>
          {prefix ? <span>{prefix} </span> : null}
          {i + 1}
          {suffix ? <span> {suffix}</span> : null}
          <span id={i} className={s.backdrop}/>
        </span>
      </span>
    );
  }

  stepsBlock = size(stepsBlock) > 0 ?
    createFragment({stepsBlock: stepsBlock}) :
    createFragment({stepsBlock: <div/>});

  return (
    <div
      className={s.steps}
      style={{width: `${width}%`, marginLeft: `${margin}%`}}>
      {stepsBlock}
    </div>
  );
};

LKSteps.propTypes = {
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  steps: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  errorSteps: PropTypes.array
};

export default withStyles(s)(LKSteps);
