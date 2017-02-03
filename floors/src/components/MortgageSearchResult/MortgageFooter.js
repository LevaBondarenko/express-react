/**
 * Mortgage Header stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React from 'react';
import {declOfNum} from '../../utils/Helpers';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageFooter.scss';

const MortgageFooter = ({programsCount, ...props}) => {
  const countWithoutRec = programsCount - props.recomendedCount;
  const load = countWithoutRec - props.showMore < props.howMuchToAdd ?
    countWithoutRec - props.showMore : props.howMuchToAdd;

  const programNames = [
    'ипотечная программа',
    'ипотечные программы',
    'ипотечных программ'
  ];
  const verbNames = [
    'подобрана',
    'подобраны',
    'подобрано'
  ];
  const buttonClass = props.isMobile ? s.showMoreProgramsM :
    s.showMorePrograms;

  return (<div className={s.mortgageFooter}>
    {props.showBtn && props.hidePrograms ?
      <a onClick={props.addMorePrograms}
        className={`${buttonClass} btn`}>
        Загрузить еще
        <span className={s.addMore}>
          {` ${load} ${declOfNum(load, programNames)}. `}
        </span>
        {`Всего подобрано ${programsCount}.`}
      </a> :
      programsCount ?
        !props.hidePrograms || countWithoutRec <= props.defaultCount ?
          <span className={s.textCenter}>
            {`Всего ${declOfNum(programsCount, verbNames)}`}
            <span className={s.addMore}>
              {` ${programsCount}
              ${declOfNum(programsCount, programNames)}.`}
            </span>
          </span> :
          <a onClick={props.turnPrograms}
            className={`${buttonClass} btn`}>
              {`Это весь список ипотечных программ. Свернуть список до первых
              ${props.defaultCount + props.recomendedCount} программ.`}
          </a> :
        <span className={s.textCenter}>
          Ипотечных программ не подобрано,
          попробуйте изменить введенные параметры.
        </span>}
    </div>
  );
};

MortgageFooter.propTypes = {
  addMorePrograms: React.PropTypes.func,
  turnPrograms: React.PropTypes.func,
  showBtn: React.PropTypes.bool,
  hidePrograms: React.PropTypes.number,
  howMuchToAdd: React.PropTypes.number,
  programsCount: React.PropTypes.number,
  defaultCount: React.PropTypes.number,
  showMore: React.PropTypes.number,
  recomendedCount: React.PropTypes.number,
  isMobile: React.PropTypes.bool
};

export default withStyles(s)(MortgageFooter);
