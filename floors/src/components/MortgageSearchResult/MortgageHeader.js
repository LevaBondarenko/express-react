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
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageHeader.scss';

const MortgageHeader = () => {
  return (
    <div className={s.mortgageHeader}>
      <div className={s.percentHeader}>
        Ставка
      </div>

      <div className={s.percentHeader}>
        Ставка с «Этажами»
      </div>

      <div className={s.progTitleHeader}>
        Название программы
      </div>

      <div className={s.moreHeader}>
        Подробнее
      </div>
    </div>
  );
};

export default withStyles(s)(MortgageHeader);
