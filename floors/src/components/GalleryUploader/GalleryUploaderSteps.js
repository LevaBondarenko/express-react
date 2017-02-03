/**
 * Gallery Uploader Steps component
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

import s from './GalleryUploaderSteps.scss';

const GalleryUploaderSteps = ({
  steps, step
}) => {
  const blockWidth = steps > 0 ? (100 / steps) : 100;
  let stepsBlock = [];

  for(let i = 0; i < steps; i++) {
    const active = i === (step ? step : 0);
    const beforeActive = i < (step ? step : 0);

    stepsBlock.push(
      <span
        className={classNames(
          s.stepBlock,
          {[s.stepActive]: active},
          {[s.stepBeforeActive]: beforeActive},
          {[s.stepAfterActive]: !beforeActive}
        )}
        style={{width: `${blockWidth}%`}}>
        <span className={s.stepClickable}>
          <span className={s.number}>{i + 1}</span><br/>шаг
        </span>
      </span>
    );
  }

  stepsBlock = size(stepsBlock) > 0 ?
    createFragment({stepsBlock: stepsBlock}) :
    createFragment({stepsBlock: <div/>});

  return (
    <div className={s.steps}>
      {stepsBlock}
    </div>
  );
};

GalleryUploaderSteps.propTypes = {
  steps: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired
};

export default withStyles(s)(GalleryUploaderSteps);
