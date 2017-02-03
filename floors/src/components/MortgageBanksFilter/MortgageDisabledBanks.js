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
import {map, find} from 'lodash';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageDisabledBanks.scss';
/**
 * components
 */
import BankDisabled from './BankDisabled';

const MortgageDisabledBanks = ({disabledBanks, getBankImage, linkBank}) => {
  const dBanks = map(disabledBanks, (bank, key) => {
    /*global data*/
    const bankTr = find(data.collections.banks,
      b => b.id === bank.id).name_tr;
    const link = linkBank === 'oldPage' ?
      `/ipoteka_banks/${bank.id}.html` :
      `/ipoteka/${bankTr}/`;

    return (<BankDisabled
      key={`disabledBank-${key}`}
      imgSrc={getBankImage(bank.image)}
      title={bank.name}
      link={link}
    />);
  });

  return (<div className={s.disabledBanksWrapper}>
      <div className={s.disabledHeader}>
        <div className={s.headerTitle}>Хотитие работать с другим банком?</div>
        <div>
          Перейдите на страницу банка, если хотите рассчитать
          ежемесячный платеж в соответствии с его ипотечными программами
        </div>
      </div>
        <div className={s.disabledBanks}>
          {dBanks}
        </div>
    </div>
  );
};

MortgageDisabledBanks.propTypes = {
  disabledBanks: React.PropTypes.array,
  getBankImage: React.PropTypes.func,
  linkBank: React.PropTypes.string
};

export default withStyles(s)(MortgageDisabledBanks);
