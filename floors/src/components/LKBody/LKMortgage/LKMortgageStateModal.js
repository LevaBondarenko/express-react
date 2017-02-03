/**
 * LK Mortgage State Modal component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';
import {find} from 'lodash';

import {declOfNum} from '../../../utils/Helpers';
import s from './LKMortgageStateModal.scss';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
import MortgageBroker from '../../MortgageBroker';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
const ModalFooter = Modal.Footer;
const statuses = {
  approved: 'Одобрено',
  end_prepare: 'Ожидание', //eslint-disable-line camelcase
  rework: 'Отправлено на доработку',
  no_approved: 'Отказ' //eslint-disable-line camelcase
};

const LKMortgageStateModal = ({programs, programId, onDismiss, context}) => {
  const calendarImg = '//cdn-media.etagi.com/static/site/c/ca/cabf0bedf5bd658aa2c6721667de06ed4df3bfd8.png'; //eslint-disable-line max-len
  const program = find(programs, {id: programId});
  const show = !!program;
  const {
    status,
    rework_comment: reworkComment,
    percent, approved_percent: aPercent,
    years, approved_years: aYears,
    avanse, avanse_rub: avanseRub,
    approved_avanse_percent: aAvanse, approved_avanse_rub: aAvanseRub,
    credit, sum, sended_to_bank: sendedToBank
  } = program ? program : {};
  let content = null, footer = null;

  switch(status) {
  case 'rework':
    content = (
      <div className={s.content}>
        <span className={s.contentHeader}>
          Замечания, выставленные банком:
        </span>
        <span className={s.contentContent}>
          <span dangerouslySetInnerHTML={{
            __html: reworkComment ?
              reworkComment.replace(/\n/g, '<br/>') : 'не указаны'
          }}/>
        </span>
      </div>
    );
    footer = (
      <div className={s.footer}>
        <Button
          href='#/mortgage/profile/'
          bsStyle='success'
          className='form-control'>
          Перейти к анкете
        </Button>
      </div>
    );
    break;
  case 'no_approved':
    content = (
      <div className={s.content}>
        <span className={s.contentHeader}>
          Как правило, банки не раскрывают причину неодобрения.<br/>
          Наиболее популярными причинами отказа являются:
        </span>
        <span className={s.contentContent}>
          - Низкий рейтинговый балл по кредитной истории, либо ее отсутствие
          <br/>
          - Указанная сумма дохода недостаточна для совершения ежемесячных
          платежей<br/>
          - Наличие действующих кредитов<br/>
          - Наличие задолженностей по налогам<br/>
          - Недостаточный стаж на последнем месте работе
        </span>
      </div>
    );
    footer = (
      <div className={s.footer}>
        <Button
          href='#/mortgage/'
          bsStyle='success'
          className='form-control'>
          <i className='fa fa-angle-left'/>&nbsp;
          Вернуться к списку программ
        </Button>
      </div>
    );
    break;
  case 'approved':
    content = (
      <div className={classNames(
        s.content,
        {[s.wide]: status === 'approved'}
      )}>
        <span className={s.contentHeader}>
          Поздравляем, Вам одобрили ипотеку!<br/>Посмотрите, какие условия Вам
          одобрил банк:
        </span>
        <table className={s.conditionsTable}>
          <thead>
            <tr>
              <th width='36%'>&nbsp;</th>
              <th width='32%'>Вы просили</th>
              <th width='32%'>Предложение банка</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Процентная ставка</td>
              <td
                className={classNames({[s.diff]: percent !== aPercent})}>
                {percent}%
              </td>
              <td
                className={classNames({[s.diff]: percent !== aPercent})}>
                {aPercent}%
              </td>
            </tr>
            <tr>
              <td>
                Первоначальный взнос<br/>(<PriceUnit/> или
                <span className={s.percentBlock}> %</span>)
              </td>
              <td className={classNames({[s.diff]: avanse !== aAvanse})}>
                <Price price={avanseRub}>&nbsp;
                  <PriceUnit/><br/>
                  <span className={s.percentBlock}>
                    ({avanse}%)
                  </span>
                </Price>
              </td>
              <td className={classNames({[s.diff]: avanse !== aAvanse})}>
                <Price price={aAvanseRub}>&nbsp;
                  <PriceUnit/><br/>
                  <span className={s.percentBlock}>
                    ({aAvanse}%)
                  </span>
                </Price>
              </td>
            </tr>
            <tr>
              <td>Сумма кредита</td>
              <td className={classNames({[s.diff]: credit !== sum})}>
                <Price price={credit}> <PriceUnit/></Price>
              </td>
              <td className={classNames({[s.diff]: credit !== sum})}>
                <Price price={sum}> <PriceUnit/></Price>
              </td>
            </tr>
            <tr>
              <td>Срок кредита</td>
              <td className={classNames({[s.diff]: years !== aYears})}>
                {years} {declOfNum(years, ['год', 'года', 'лет'])}
              </td>
              <td className={classNames({[s.diff]: years !== aYears})}>
                {aYears} {declOfNum(aYears, ['год', 'года', 'лет'])}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
    footer = null;
    break;
  default:
    if(sendedToBank === 'yes') {
      content = (
        <div className={s.content}>
          <span className={s.contentHeader}>
            Ваша заявка на рассмотрении, обычно это занимает от 5 до 7 дней.
          </span>
          <span className={classNames(s.contentContent, s.endPrepare)}>
            <img src={calendarImg}/>
            <br/><strong>5 - 7 дней</strong>
          </span>
        </div>
      );
      footer = (
        <div className={s.footer}>
          <Button
            href='#/mortgage/'
            bsStyle='success'
            className='form-control'>
            <i className='fa fa-angle-left'/>&nbsp;
            Вернуться к списку программ
          </Button>
        </div>
      );
    }
  }
  const statusClass = s[status] ? s[status] :
    (sendedToBank === 'yes' ? s.end_prepare : null);
  const statusValue = statuses[status] ? statuses[status] : (
    (sendedToBank === 'yes' ? 'Ожидание' : null));

  return (
    <Modal
      className={classNames(s.root, {[s.wide]: status === 'approved'})}
      show={show}
      onHide={onDismiss}>
      <ModalHeader closeButton className={classNames(s.header, statusClass)}>
        <span className={s.status}>Статус - </span>
        <span className={s.statusValue}>{statusValue}</span>
      </ModalHeader>
      <ModalBody>
        <div className={s.modalBody}>
          <div className={s.info}>
            {content}
            {footer}
          </div>
          <div className={s.broker}>
            <MortgageBroker
              context={context}
              template='inLKModal'/>
          </div>
        </div>
      </ModalBody>
      <ModalFooter/>
    </Modal>
  );
};

LKMortgageStateModal.propTypes = {
  context: PropTypes.shape({
    insertCss: PropTypes.func,
  }),
  onDismiss: PropTypes.func.isRequired,
  programs: PropTypes.array.isRequired,
  programId: PropTypes.string.isRequired
};

export default withStyles(s)(LKMortgageStateModal);
