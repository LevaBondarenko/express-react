/**
 * Mortgage Item stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React from 'react';
/**
 * styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageItem.scss';

const MortgageItem = ({hidden, program, link}) => {
  return (
    <div className={hidden ? s.mortgageItemWrapperHidden :
    s.mortgageItemWrapper}>
      <div className={s.mortgageItem}>

        <div className={s.percent}>
          {`${program.percent.toString().replace('.', ',')}%`}
        </div>

        <div className={s.percent}>
          <span className={program.pref && s.greenPercentWrapper}>
            {`${(program.deltaPercent).toString().replace('.', ',')}%`}
          </span>
        </div>

        <div className={s.programTitleWrapper}>
          <div className={s.programTitle} title={program.program_title}>
            <a href={link}>{program.program_title}</a>
          </div>
          <div className={s.dateUpdate}>
            {`(Обновлено: ${program.date_update})`}
          </div>
        </div>

        <div className={s.toggleInfo}>
          <a href={link}
             target="_blank"
             className={s.moreLink}>
            Подробнее
          </a>
        </div>
      </div>
    </div>
  );
};

MortgageItem.propTypes = {
  hidden: React.PropTypes.bool,
  program: React.PropTypes.object,
  link: React.PropTypes.string
};

export default withStyles(s)(MortgageItem);
