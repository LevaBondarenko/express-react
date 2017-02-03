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
import s from './MortgageHeaderExtended.scss';
import HelpIcon from '../../shared/HelpIcon';
import MortgageBanksFilter from '../MortgageBanksFilter/';

const MortgageHeaderExtended = ({context, linkBank, hideBanksFilter,
  hideBankLogo}) => {

  const help = (
    <p>
      Банки предоставляют клиентам<br/>
      компании "Этажи" ипотеку на специальных<br/> условиях.
      Обычно процент по ипотеке через "Этажи" ниже, чем в банке, на на 0,2 - 1%
    </p>
  );

  return (
    <thead>
      <tr className={s.mortgageHeaderExtended}>
        <th />
        {!hideBankLogo ? (
          <th className={s.bankHeader}>
            Банк {!hideBanksFilter ? (
            <br />
          ) : null}
            {!hideBanksFilter ? (
              <MortgageBanksFilter linkBank={linkBank} context={context} />
            ) : null}
          </th>
        ) : null}

        <th className={s.progTitleHeader}>
          Название программы
        </th>

        <th className={s.percentHeader}>
          Ставка c банком
        </th>

        <th className={s.percentHeader}>
          Ставка с «Этажами»
          <HelpIcon
            id='helpText'
            closeButton={true}
            className='help-text-left'
            placement='top'
            helpText={help}/>
        </th>

        <th className={s.monthPaymentHeader}>
          Ежемесячный платеж с банком
        </th>

        <th className={s.monthPaymentCompanyHeader}>
          Ежемесячный платеж с «Этажами»
        </th>

        <th className={s.economyHeader}>
          Ваша экономия с «Этажами»
        </th>

        <th className={s.moreHeader}>
          Подробнее
        </th>
      </tr>
    </thead>
  );
};

MortgageHeaderExtended.propTypes = {
  context: React.PropTypes.shape({
    insertCss: React.PropTypes.func,
  }),
  linkBank: React.PropTypes.string,
  hideBanksFilter: React.PropTypes.number,
  hideBankLogo: React.PropTypes.number,
};

export default withStyles(s)(MortgageHeaderExtended);
