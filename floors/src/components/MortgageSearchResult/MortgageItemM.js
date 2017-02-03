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
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import {find} from 'lodash';
import s from './MortgageItemM.scss';

const MortgageItemM = ({program, getBankImage, linkBank, linkProgram,
  hideBankLogo}) => {
  const title = program.program_title;
  /*global data*/
  const bankTr = find(data.collections.banks,
    bank => bank.id === program.bank_id).name_tr;
  const linkP = linkProgram === 'oldPage' ?
  `/ipoteka-programs/${program.program_id}.html` :
  `/ipoteka/${bankTr}/${program.program_id}`;
  const linkB = linkBank === 'oldPage' ?
    `/ipoteka_banks/${program.bank_id}.html` :
    `/ipoteka/${bankTr}/`;

  return (
    <div className={s.item}>
      {!hideBankLogo ? (<a className={s.bankImage} href={linkB}
         target='_blank'>
        <img src={getBankImage(program.bank_image)} alt=""/>
      </a>) : null}
      <div className={s.programTitle}>{title}</div>
      <div className={s.programParams}>
        <div>
          <div>Ставка с банком</div>
          <div>{`${program.percent.toString().replace('.', ',')}%`}</div>
        </div>
        {program.pref && <div className={s.paramCompany}>
          <div>Ставка с Этажами</div>
          <div>{`${(program.deltaPercent).toString().replace('.', ',')}%`}</div>
        </div>}
        <div>
          <div>Платеж с банком</div>
          <div>
            <Price price={program.monthPayment}> <PriceUnit/></Price>/мес
          </div>
        </div>
        {program.pref && <div className={s.paramCompany}>
          <div>Платеж с Этажами</div>
          <div>
            <Price price={program.monthPaymentPref}> <PriceUnit/></Price>/мес
          </div>
        </div>}
      </div>
      <a className={s.linkProgram} href={linkP}>Посмотреть программу</a>
    </div>
  );
};

MortgageItemM.propTypes = {
  hidden: React.PropTypes.bool,
  program: React.PropTypes.object,
  linkBank: React.PropTypes.string,
  linkProgram: React.PropTypes.string,
  getBankImage: React.PropTypes.func,
  hideBankLogo: React.PropTypes.number
};

export default withStyles(s)(MortgageItemM);
