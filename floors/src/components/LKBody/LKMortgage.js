/**
 * LK Mortgage component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, isEqual, find} from 'lodash';
//import {getFromBack} from '../../utils/requestHelpers';
import emptyFunction from 'fbjs/lib/emptyFunction';
import HelpIcon from '../../shared/HelpIcon';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

import s from './LKMortgage/style.scss';
import LKMortgageMain from './LKMortgage/LKMortgageMain';
import LKMortgageList from './LKMortgage/LKMortgageList';
import LKMortgageStateModal from './LKMortgage/LKMortgageStateModal';
import LKMortgageModal from './LKMortgage/LKMortgageModal';
import LKMortgageProfile from './LKMortgage/LKMortgageProfile';
import LKManager from '../LKManager/LKManager';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
import wss from '../../stores/WidgetsStateStore';

class LKMortgage extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    user: PropTypes.object,
    mortgage: PropTypes.object,
    subPage: PropTypes.string,
    subId: PropTypes.string,
    requestBankProfileSettings: PropTypes.func,
    onBankProfileUpdate: PropTypes.func
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      isExistRefused: this.checkForRefused(props.mortgage),
      event: null,
      course: 1,
      unit: 'руб.'
    };
  }

  componentWillReceiveProps(nextProps) {
    const newIsExistsRefused = this.checkForRefused(nextProps.mortgage);

    this.state.isExistRefused !== newIsExistsRefused &&
      this.setState(() => ({isExistRefused: newIsExistsRefused}));
  }

  componentWillMount() {
    this.removeCss = s._insertCss();

    this.wssChange();
    wss.onChange(this.wssChange);
  }

  componentDidMount() {
    UserActions.forceMortgageUpdate();
  }

  componentWillUnmount() {
    this.removeCss();
    wss.offChange(this.wssChange);
  }

  checkForRefused = mortgage => {
    const {programs} = mortgage ? mortgage : {};
    const refused = find(programs, item => {
      return item.status === 'refuse_client';
    });

    return !!refused;
  }

  wssChange = () => {
    const {selectedCity, currency} = wss.get();
    const state = {};

    if(selectedCity) {
      state.selectedCity = selectedCity;
    }
    if(currency) {
      state.currency = {
        course: currency.nominal / currency.value,
        unit: currency.symbol
      };
    }
    if(size(state) && (
      !isEqual(state.selectedCity, this.state.selectedCity) ||
      !isEqual(state.currency, this.state.currency))) {
      this.setState(() => (state));
    }
  };

  dismiss = () => {
    window.location.hash = '/mortgage/';
  };

  confirmedAction = () => {
    const {event} = this.state;

    this.setState(() => ({event: null}));
    UserActions.updateMortgage(event.progId, event.action);
  };

  cancelAction = () => {
    this.setState(() => ({event: null}));
  };

  onProgramChange = (id, action) => {
    if(['refuse', 'delete'].indexOf(action) !== -1) {
      this.setState(() => ({
        event: {progId: id, action: action}
      }));
    } else {
      UserActions.updateMortgage(id, action);
    }
  };

  onProfileError = () => {
    this.setState(() => ({
      event: {action: 'profileError'}
    }));
  }

  get header() {
    const {subPage} = this.props;

    return (
      <Row>
        <Col xs={5}>
          <div className='lkbody-pagetitle'>
            Ипотека-онлайн
            <HelpIcon
              placement='top'
              className='help-text-left'
              helpText={(
                <span>
                  Мы запустили сервис "Ипотека онлайн", который позволит
                  оформить ипотеку не выходя из дома
                </span>
              )}/>
          </div>
        </Col>
        {size(subPage) ? (
          <Col xs={7}>
            <div className='lkbody-pagetitle'>
              <Button
                bsStyle='link'
                bsSize='small'
                href='#/mortgage/'>
                <i className='fa fa-angle-left' />
                <span> Вернуться к списку программ</span>
              </Button>
            </div>
          </Col>
        ) : null}
      </Row>
    );
  };

  render() {
    const {
      mortgage, subPage, subId, requestBankProfileSettings, context, user
    } = this.props;
    const lkTicket = size(user) && size(mortgage) ?
      find(user.tickets, {riesId: mortgage.ticket.ticket_id}) : null;
    const detail = lkTicket ? JSON.parse(lkTicket.detail) : {};
    const {event} = this.state;
    const body = subPage === 'profile' ? (
      <LKMortgageProfile
        {...this.props}
        {...this.state}
        profileSended={detail.profileSended}
        requestBankProfileSettings={requestBankProfileSettings}
        onProfileChange={this.props.onBankProfileUpdate}
        onProfileError={this.onProfileError} />
    ) : (
      <LKMortgageList
        {...this.props}
        {...this.state}
        profileSended={detail.profileSended}
        onProgramChange={this.onProgramChange} />
    );

    return mortgage ? (
      <Row>
        <Col xs={10} className='lkbody-mainblock'>
          <div className={s.lkBodyMortgage}>
            {this.header}
            <Row className={s.lkBodyMortgageWrapper}>
              {body}
            </Row>
            {subPage === 'program' && subId ? (
              <LKMortgageStateModal
                context={context}
                programs={mortgage.programs}
                programId={subId}
                onDismiss={this.dismiss}/>
            ) : null}
            {event ? (
              <LKMortgageModal
                action={event.action}
                onOk={this.confirmedAction}
                onClear={this.cancelAction}/>
            ) : null}
          </div>
        </Col>
        <Col xs={2} className='lkbody-sideblock'>
          <LKManager relation='6'/>
        </Col>
      </Row>
    ) : (
      <div className={s.lkBodyMortgage}>
        {this.header}
        <LKMortgageMain {...this.state} />
      </div>
    );
  }
}

export default LKMortgage;
