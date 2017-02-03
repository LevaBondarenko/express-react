import React, {PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import style from './MortgageAgregatorForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import classNames from 'classnames';


const MortgageAgregatorForm = ({alignmentPadding, alignMode, beginning, ending,
 mortgageCount, zeroCountMessage, hideCount}) => {
  const paddingStyle = alignMode === 'right' ?
    {'marginRight': `${alignmentPadding - 15}px`} :
    {'marginLeft': `${alignmentPadding - 15}px`};

  return (
    <div
     className={classNames({
       [style.mortgageAgregator]: true,
       'mortgageagregator__centered': alignMode === 'center',
       'pull-left': alignMode === 'left',
       'pull-right': alignMode === 'right'
     })}
     style={alignMode !== 'center' ? paddingStyle : null}>
      {mortgageCount === '0' && zeroCountMessage ?
        (<div>
          {zeroCountMessage}
        </div>) :
        (<div>
          <div className={style.mortgageAgregator__start}>
            {beginning}&nbsp;
          </div>
          {hideCount === 'off' || hideCount === undefined ? (
            <div className={style.mortgageAgregator__counter}>
              {mortgageCount}
            </div>
          ) : false }
          <div className={style.mortgageAgregator__end}>
            &nbsp;{ending}
          </div>
        </div>)
      }
    </div>
  );
};

export default withStyles(style)(MortgageAgregatorForm);

MortgageAgregatorForm.propTypes = {
  alignmentPadding: PropTypes.string,
  alignMode: PropTypes.string,
  beginning: PropTypes.string,
  ending: PropTypes.string,
  mortgageCount: PropTypes.string,
  zeroCountMessage: PropTypes.string,
  hideCount: PropTypes.string,
};
