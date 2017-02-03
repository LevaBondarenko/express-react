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
 * components
 */
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import {cutText} from '../../utils/Helpers';
/**
 * styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MortgageItemExtended.scss';

const MortgageItemExtended = ({bankImage, program, toggleCheck, ...props}) => {

  let classNames = props.checked ?
    `${s.mortgageItemExtended} ${s.mortgageItemActive}` :
    s.mortgageItemExtended;

  classNames += props.hidden ? ` ${s.mortgageItemExtendedWrapperHidden}` :
    ` ${s.mortgageItemExtendedWrapper}`;

  return (
    <tr className={classNames}
      onClick={toggleCheck}
      data-program={program.program_id}
      data-payment={program.monthPaymentPref}
      data-percent={program.deltaPercent}>
        <td className={`${s.checkMortgage} form-group`}>
          <input type='checkbox'
            id={`program_${program.program_id}`}
            data-program={program.program_id}
            data-payment={program.monthPaymentPref}
            data-percent={program.deltaPercent}
            onChange={toggleCheck}
            checked={props.checked}
            className='form-etagi input_arrow'/>
          <label
            htmlFor={`program_${program.program_id}`}
            className='checkbox_arrow arrow_extend'>
            <i className='icon_arrow'> </i>
          </label>
        </td>

        {!props.hideBankLogo ? (
          <td className={s.bankImage}>
            <a href={props.bankLink}
               target='_blank'>
              <img src={bankImage} alt=""/>
            </a>
          </td>
        ) : null}

        <td className={s.programTitle} title={program.program_title}>
          <a href={props.programLink}
             target='_blank'>
            {
              program.program_title.length > 35 ?
                `${cutText(program.program_title, 35)[0]} ...` :
                program.program_title
            }
          </a>
        </td>

        <td className={s.percent}>
          {`${program.percent.toString().replace('.', ',')}%`}
        </td>

        <td className={program.pref ? s.greenPercent : s.percent}>
          <span className={program.pref && s.greenPercentWrapper}>
            {`${(program.deltaPercent).toString().replace('.', ',')}%`}
          </span>
        </td>

        <td className={s.monthPayment}>
          <Price price={program.monthPayment}> <PriceUnit/></Price>
        </td>

        <td className={program.pref ? s.monthPaymentCompany : s.monthPayment}>
          <span className={s.paymentPref}>
            <Price price={program.monthPaymentPref}> <PriceUnit/></Price>
          </span>
        </td>

        <td className={s.greenMonthPayment}>
        {program.deltaPref > 0 &&
          <Price price={program.deltaPref}> <PriceUnit/></Price>}
        </td>

        <td className={s.toggleInfo}>
          <a href={props.programLink}
             target='_blank'
             className={s.moreLink}>
            Подробнее
          </a>
        </td>
    </tr>
  );
};

MortgageItemExtended.propTypes = {
  hidden: React.PropTypes.bool,
  program: React.PropTypes.object,
  bankImage: React.PropTypes.string,
  programLink: React.PropTypes.string,
  bankLink: React.PropTypes.string,
  toggleCheck: React.PropTypes.func,
  hideBankLogo: React.PropTypes.number,
  checked: React.PropTypes.bool
};

export default withStyles(s)(MortgageItemExtended);
