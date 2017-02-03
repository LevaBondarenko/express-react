/**
 * UProgressBarForm widget class
 *
 * @ver 0.0.1
 */

import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './UProgressBarForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';


const UProgressBarForm = ({percentage, labelText}) => {

  return (
    <div className={style.uProgressBar}>
			<div className={style.uProgressBar__label}>
				{labelText}
			</div>
			<div className={style.uProgressBar__percentage}>
				{percentage}%
			</div>
			<div className={style.uProgressBar__barContainer}>
				<div
					className={style.uProgressBar__bar}
					style={{width: `${percentage}%`}} />
			</div>
    </div>
  );
};

export default withStyles(style)(UProgressBarForm);

UProgressBarForm.propTypes = {
  labelText: PropTypes.string,
  percentage: PropTypes.number
};