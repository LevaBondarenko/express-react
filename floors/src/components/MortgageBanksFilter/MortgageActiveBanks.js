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
import {map, indexOf} from 'lodash';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageActiveBanks.scss';
/**
 * components
 */
import BankActive from './BankActive';

const MortgageActiveBanks = ({checkedBanks, activeBanks, getBankImage,
  toggleCheck, showDisabledBanks, showDisabled}) => {
  const aBanks = map(activeBanks, (bank, key) => {
    const checked = indexOf(checkedBanks, bank.id) > -1 ?
      true : false;

    return (<BankActive
      key={`activeBank-${key}`}
      id={bank.id}
      imgSrc={getBankImage(bank.image)}
      title={bank.name}
      checked={checked}
      toggleCheck={toggleCheck}
    />);
  });

  return (<div className={s.activeBanks}>
      {aBanks}
      <div className={s.showDisabledWrapper}>
        <a onClick={showDisabledBanks}
          className={s.showDisabled}>
          {showDisabled ?
            <span>
              <span>Скрыть остальные банки</span>
              <i className='fa fa-angle-up'/>
            </span> :
            <span>
              <span>Показать остальные банки</span>
              <i className='fa fa-angle-down'/>
            </span>}
        </a>
      </div>
    </div>
  );
};

MortgageActiveBanks.propTypes = {
  activeBanks: React.PropTypes.array,
  checkedBanks: React.PropTypes.array,
  getBankImage: React.PropTypes.func,
  toggleCheck: React.PropTypes.func,
  showDisabledBanks: React.PropTypes.func,
  showDisabled: React.PropTypes.bool
};

export default withStyles(s)(MortgageActiveBanks);