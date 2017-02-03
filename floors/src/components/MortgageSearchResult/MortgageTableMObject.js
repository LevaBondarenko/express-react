/**
 * Mortgage Table Extended stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React from 'react';
import {map} from 'lodash';
import {declOfNum} from '../../utils/Helpers';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageTableMObject.scss';
/**
 * components
 */
import MortgageItemM from './MortgageItemM';

const MortgageTableMObject = ({...props}) => {
  const countTitle = declOfNum(props.count,
    [' программа', ' программы', ' программ']);

  return (
    <div>
      <div className={s.mortgageContent}>
        {map(props.recomendedPrograms, (program, key) => {
          return (
            <MortgageItemM
              key={key}
              getBankImage={props.getBankImage}
              linkProgram={props.linkProgram}
              linkBank={props.linkBank}
              program={program} />
          );
        })}
      </div>
      {props.count > 0 ?
        <a onClick={props.showPrograms}
          href='/ipoteka/'
          className='mobile-primary-button'>
          Посмотреть {props.count} {countTitle}
        </a> :
        <div className={s.zeroPrograms}>Ипотечные программы не найдены</div>}
    </div>
  );
};

MortgageTableMObject.propTypes = {
  recomendedPrograms: React.PropTypes.array,
  linkBank: React.PropTypes.string,
  linkProgram: React.PropTypes.string,
  count: React.PropTypes.number,
  showPrograms: React.PropTypes.func
};

export default withStyles(s)(MortgageTableMObject);
