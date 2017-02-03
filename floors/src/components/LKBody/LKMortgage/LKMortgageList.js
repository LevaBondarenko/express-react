/**
 * LK Mortgage List component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classNames from 'classnames';
import {map, size} from 'lodash';
import {declOfNum} from '../../../utils/Helpers';
import profileSettings from './config/profileSettings';
import LKMortgageInOffice from './LKMortgageInOffice';
import CheckButton from '../../../shared/CheckButton';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';

import s from './style.scss';
import Button from 'react-bootstrap/lib/Button';

class LKMortgageList extends Component {
  static propTypes = {
    user: PropTypes.object,
    mortgage: PropTypes.object,
    selectedCity: PropTypes.object,
    profileSended: PropTypes.bool,
    isExistRefused: PropTypes.bool,
    onProgramChange: PropTypes.func
  };

  constructor(props) {
    super(props);
  }

  onChange = e => {
    const {id, checked} = e.target;
    const progId = id.indexOf('-') !== -1 ? parseInt(id.split('-')[1]) : null;

    progId && this.props.onProgramChange(
      progId,
      checked ? 'activate' : 'refuse'
    );
  }

  onDelete = e => {
    const progid = e.target.dataset.progid ? e.target.dataset.progid :
      e.target.parentElement.dataset.progid;

    this.props.onProgramChange(progid, 'delete');
  }

  get stateDescription() {
    const {profileSended} = this.props;

    return profileSended ? (
      <span>
        Вы отправили анкету, предоставленные вами данные будут отправлены в
        выбранные банки.<br/>При необходимости вы можете обновить копии
        прилагаемых документов.
      </span>
    ) : (
      <span>
        Отправляйте заявку на рассмотрение сразу во все выбранные
        Вами банки, не выходя из дома!<br/>
        <strong>Просто заполните анкету</strong> и следите за статусом
        рассмотрения заявок в режиме онлайн.
      </span>
    );
  }

  get bottomDescription() {
    const {profileSended, isExistRefused} = this.props;

    return profileSended ? (
      isExistRefused ? (
        <span>
          Вы можете отправить заявку по любой другой ипотечной программе,
          не отмеченной галочкой.<br/>Советуем отправить анкету во все банки,
          так вы увеличиваете шанс одобрения ипотеки.
        </span>
      ) : (
        <span/>
      )
    ) : (
      <span>
        Передумали отправлять анкету по определенной ипотечной программе?<br/>
        Снимите галочку возле логотипа банка.
      </span>
    );
  }

  get profileButtonByState() {
    const {profileSended} = this.props;
    const lastStep = size(profileSettings);

    return profileSended ? (
      <Button
        href={`#/mortgage/profile/${lastStep}`}
        bsStyle='success'
        className='form-control'>
        <span>Обновить документы</span>
      </Button>
    ) : (
      <Button
        href='#/mortgage/profile/'
        bsStyle='success'
        className='form-control'>
        <span>Заполнить анкету</span>
      </Button>
    );
  }

  get programs() {
    const {mortgage, profileSended} = this.props;
    const {programs} = mortgage;
    let rows = map(programs, item => {
      const checked = item.status !== 'refuse_client';
      const {bank_image: bLogo} = item.iprograms && item.iprograms.ibanks ?
        item.iprograms.ibanks : {};

      return (
        <tr key={item.id}>
          <td>
            <div className={classNames('ucheckbox-container', s.bankCheckBox)}>
              {profileSended && item.status !== 'refuse_client' ? null : (
                <CheckButton
                  itemID={`program-${item.id}`}
                  onValue={item.id}
                  radiomode={false}
                  onChange={this.onChange}
                  checked={checked} />
              )}
            </div>
            <div className={s.bankLogo}>
              <img src={`http://cdn-media.etagi.com/240160/banks/${bLogo}`}/>
            </div>
          </td>
          <td>
            {item.percent}%
          </td>
          <td>
            <Price price={item.monthly_payment}><br/><PriceUnit/></Price>/мес
          </td>
          <td>
            {item.years} {declOfNum(item.years, ['год', 'года', 'лет'])}
          </td>
          <td>
            <Price price={item.kredit}> <PriceUnit/></Price>
          </td>
          <td>
            <Price price={item.avanse_rub}> <PriceUnit/></Price>
            <br/>
            <span className={s.percentBlock}>{item.avanse} %</span>
          </td>
          <td className={s.statusCell}>
            {this.programStatus(item)}
          </td>
        </tr>
      );
    });

    rows = size(rows) > 0 ?
      createFragment({rows: rows}) :
      createFragment({rows: <div/>});

    return (
      <div className={s.programsTable}>
        <table>
          <thead>
            <tr>
              <th>
                Банк
              </th>
              <th>
                Ставка<br/>(от)
              </th>
              <th>
                Ежемесячный<br/>платеж
              </th>
              <th>
                Срок
              </th>
              <th>
                Сумма кредита
              </th>
              <th>
                Первоначальный<br/>взнос (<PriceUnit/> и&nbsp;
                <span className={s.percentBlock}>%</span>)
              </th>
              <th>
                Статус
              </th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }

  programStatus = data => {
    const {profileSended} = this.props;
    let result = null;

    switch(data.status) {
    case 'rework' :
      result = (
        <Button
          href={`#/mortgage/program/${data.id}`}
          bsStyle='success'
          className={classNames('form-control', s.rework, s.statusButton)}>
          <span>На доработку</span>
        </Button>
      );
      break;
    case 'approved':
      result = (
        <Button
          href={`#/mortgage/program/${data.id}`}
          bsStyle='success'
          className={classNames('form-control', s.approved, s.statusButton)}>
          <span>Одобрено</span>
        </Button>
      );
      break;
    case 'no_approved':
      result = (
        <Button
          href={`#/mortgage/program/${data.id}`}
          bsStyle='success'
          className={
            classNames('form-control', s.noApproved, s.statusButton)
          }>
          <span>Отказ</span>
        </Button>
      );
      break;
    case 'refuse_client':
      result = (
        <Button
          data-progid={data.id}
          onClick={this.onDelete}
          bsStyle='danger'
          className={classNames('form-control', s.deleteButton)}>
          Удалить<br/>из списка
        </Button>
      );
      break;
    case 'deal':
      result = <span>Сделка<br/>совершена</span>;
      break;
    default:
      result = data.sended_to_bank === 'yes' ? (
        <Button
          href={`#/mortgage/program/${data.id}`}
          bsStyle='success'
          className={classNames('form-control', s.wait, s.statusButton)}>
          <span>Ожидание</span>
        </Button>
      ) : (profileSended ?
        <span>Подготовка<br/>к отправке</span> :
        <span>Не заполнена<br/>анкета</span>
      );
    }

    return result;
  }

  render() {
    const {mortgage, selectedCity, profileSended, isExistRefused} = this.props;
    const {ticket} = mortgage;

    return (
      <div className={s.lkBodyMortgageList}>
        <div className={s.title}>
          <span>Заявка по вашему поисковому запросу: #</span>
          <span className={s.ticketNum}>
            {ticket.ticket_id}
          </span>
        </div>
        <div className={s.mortgageListDescr}>
          {this.stateDescription}
          {this.profileButtonByState}
        </div>
        <div className={s.programs}>
          {this.programs}
        </div>
        <div className={classNames(
          s.orangeInfo,
          {[s.white]: profileSended && !isExistRefused}
        )}>
          {this.bottomDescription}
          {this.profileButtonByState}
        </div>
        <LKMortgageInOffice selectedCity={selectedCity} />
      </div>
    );
  }
}

export default withStyles(s)(LKMortgageList);
