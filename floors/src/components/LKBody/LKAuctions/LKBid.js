/**
 * LKBid component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, filter, max} from 'lodash';
import CheckButton from '../../../shared/CheckButton';
import {getFromBack} from '../../../utils/requestHelpers';
import {priceFormatter, priceCleanup, phoneFormatter, testPhone}
  from '../../../utils/Helpers';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import {FormControl, FormGroup, ControlLabel,
        HelpBlock} from 'react-bootstrap/lib/';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';
import ga from '../../../utils/ga';

/*global data*/

class LKBid extends Component {
  static propTypes = {
    close: PropTypes.func,
    show: PropTypes.bool,
    bidOnObject: PropTypes.object,
    objects: PropTypes.object,
    myauctions: PropTypes.array,
    user: PropTypes.object,
    path: PropTypes.string,
    profilePath: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.getAuction = this.getAuction.bind(this);
    this.state = {
      auction: false,
      bid: 0,
      bidCash: 0,
      mortgage: false,
      socProg: false,
      comment: '',
      phone: ''
    };
  }

  trackTypes = (key) => {
    const {path, profilePath} = this.props;

    const types = {
      change: {
        mortgage: 'lk_torgi_popup_change_rate_zaym_ipoteka',
        soc: 'lk_torgi_popup_change_rate_soc_program',
        send: 'lk_torgi_popup_change_rate'
      },
      offer: {
        mortgage: 'lk_torgi_popup_offer_rate_zaym_ipoteka',
        soc: 'lk_torgi_popup_offer_rate_soc_program',
        send: 'lk_torgi_popup_offer_rate'
      }
    };

    return path === profilePath ? types.change[key] : types.offer[key];
  };

  componentDidMount() {
    this.getAuction();
  }

  getAuction() {
    const {bidOnObject, myauctions, objects} = this.props;
    const id = parseInt(bidOnObject.id);
    const oclass = bidOnObject.class;
    let auction = false;

    if(!objects[oclass] || !objects[oclass][id]) {
      UserActions.cacheObjects(oclass, id);
    }
    for(const i in myauctions) {
      if(myauctions[i] && myauctions[i].object.ries_id === id) {
        auction = myauctions[i];
        break;
      }
    }
    if(auction) {
      this.setState(() => ({auction: auction}));
    } else {
      getFromBack({
        action: 'user_get',
        what: 'lots',
        filter: `["=","object.ries_id","${id}"]`
      }).then(response => {
        if(response && response.ok && size(response.data.objects)) {
          this.setState(() => ({auction: response.data.objects[0]}));
        }
      });
    }
  }

  send = (event) => {
    const {
      bid, bidCash, mortgage, socProg, auction, comment, phone
    } = this.state;
    const {bidOnObject, user} = this.props;
    const cleanedPhone = phone.replace(/[^0-9+]*/g, '');

    ga('link', this.trackTypes('send'));
    event.preventDefault();
    if(bid && (user.phone || (phone && testPhone(cleanedPhone, true))) &&
      parseInt(bidCash) <= parseInt(bid)) {
      const bidParams = {
        price: bid,
        price_custom: bid !== bidCash ? JSON.stringify({ //eslint-disable-line camelcase
          cash: bidCash,
          mortgage: mortgage ? 1 : 0,
          social_cert: socProg ? 1 : 0 //eslint-disable-line camelcase
        }) : null,
        description: comment
      };

      UserActions.closeForm();
      cleanedPhone && UserActions.updateUser({phone: cleanedPhone});
      if(auction) {
        UserActions.create(
          bidParams,
          `lot/${auction.id}/bid`
        );
        UserActions.create(
          {
            type: 3,
            subj: ' ',
            body:
              `**Новая ставка:** *${priceFormatter(bid)}* руб.\n\n${comment}`,
            to_id: auction.object.client_id //eslint-disable-line camelcase
          },
          'message'
        );
      } else {
        bidParams.ries_id = bidOnObject.id; //eslint-disable-line camelcase
        UserActions.create(
          bidParams,
          'bid'
        );
      }
      WidgetsActions.set('notify',[{
        msg: 'Ставка отправлена',
        type: 'info'
      }]);
    }
  }

  handleChange(e) {
    const {field} = e.target.dataset;
    const {value} = e.target;
    const newState = {
      [field]: field !== 'bid' && field !== 'bidCash' ?
        value : priceCleanup(value)
    };

    if(field === 'bid' && !this.state.mortgage && !this.state.socProg) {
      newState.bidCash = priceCleanup(value);
    }
    this.setState(() => (newState));
  }

  requireValidation(ref, help = 1) {
    const results = {
      success: ['success', ''],
      error: ['error', 'Это поле обязательно к заполнению']
    };
    let result;
    const length = this.state[ref] ? this.state[ref].length : 0;

    if(length < 1) {
      result = results.error[help];
    } else if(ref === 'bidCash' &&
      parseInt(this.state.bidCash) > parseInt(this.state.bid)) {
      result = help ? 'Не может быть больше, чем ставка' : 'error';
    } else {
      result = results.success[help];
    }

    return result;
  }

  toggleMortgage = () => {
    const newState = {mortgage: !this.state.mortgage};
    const event = this.state.mortgage ? 'off' : 'on';

    if(this.state.mortgage && !this.state.socProg) {
      newState.bidCash = this.state.bid;
    }
    this.setState(() => (newState));

    ga('checkbox', this.trackTypes('mortgage'), event);
  }

  toggleSocProg = () => {
    const newState = {socProg: !this.state.socProg};
    const event = this.state.socProg ? 'off' : 'on';

    if(!this.state.mortgage && this.state.socProg) {
      newState.bidCash = this.state.bid;
    }
    this.setState(() => (newState));

    ga('checkbox', this.trackTypes('soc'), event);
  }

  render() {
    const {bidOnObject, objects, user} = this.props;
    const {bid, bidCash, mortgage, socProg, auction, comment, phone} =
      this.state;
    const phoneFormatted = phone && phone.length ?
      phoneFormatter(
        phone,
        data.options.countryCode.current,
        data.options.countryCode.avail
      ) : '';
    const id = parseInt(bidOnObject.id);
    const oclass = bidOnObject.class;
    const object = objects[oclass] && objects[oclass][id] ?
      objects[oclass][id] : false;

    const lastBid = max(
      filter(auction.bids, {user_id: user.id}), bid => bid.id //eslint-disable-line camelcase
    );


    return (
      <form
        className="auth-form form-horizontal lkform-bid"
        autoComplete='off'
        onSubmit={this.send}>
        <Row className='lkform-bid-header'>
          <Col xs={12} className='lkform-bid-header-title'>
            <div>
              <span className='text-bold'>Текущая цена: </span>
              <span className='price red'>
                {object ? `${priceFormatter(object.price)} руб.` : 'нет'}
              </span>
            </div>
            {lastBid ? (
              <div>
                <span className='text-bold'>Текущая ставка: </span>
                <span className='price'>
                  {`${priceFormatter(lastBid.price)} руб.`}
                </span>
              </div>) : null
            }
          </Col>
        </Row>
        <Row>
          { !user.phone ? (
            <Col xs={10}>
              <FormGroup style={{marginBottom: '0.1rem'}}>
                <Col xs={4}>
                  <ControlLabel>
                      <p style={{textAlign: 'left'}}>
                        Номер Вашего телефона
                      </p>
                  </ControlLabel>
                </Col>
                <Col xs={8}>
                  <FormControl type='text'
                    value={phoneFormatted}
                    data-field='phone'
                    onChange={this.handleChange.bind(this)}/>
                  <HelpBlock>{this.requireValidation('phone')}</HelpBlock>
                </Col>
              </FormGroup>
            </Col>) : null
          }
          <Col xs={10}>
            <FormGroup >
              <Col xs={4} style={{textAlign: 'left'}}>
                <ControlLabel >
                    <p>Новая ставка</p>
                </ControlLabel>
              </Col>
              <Col xs={8}>
                <FormControl type='text'
                  value={priceFormatter(bid)}
                  data-field='bid'
                  onChange={this.handleChange.bind(this)}/>
                <HelpBlock>{this.requireValidation('bid')}</HelpBlock>
              </Col>
            </FormGroup>
          </Col>
          <Col xs={2} className='unit text-left'>руб.</Col>
          <Col xs={10}>
            <FormGroup>
              <Col xs={4}>
              <ControlLabel>
                <p style={{textAlign: 'left'}}>
                  Собственные средства
                </p>
              </ControlLabel>
              </Col>
              <Col xs={8}>
                <FormControl type='text'
                  disabled={!mortgage && !socProg}
                  className='col-xs-12'
                  value={priceFormatter(bidCash)}
                  data-field='bidCash'
                  onChange={this.handleChange.bind(this)} />
                <HelpBlock>{this.requireValidation('bidCash')}</HelpBlock>
              </Col>
            </FormGroup>
          </Col>
          <Col xs={2} className='unit text-left'>руб.</Col>
        </Row>
        <Row className='form-group'>
          <Col xsOffset={2} xs={5} className="lkbid-checkbtn">
              <CheckButton
                itemID='lkbid-mortgage'
                onValue={true}
                offValue={false}
                onChange={this.toggleMortgage}
                dataModel={{}}
                mode='0'
                checked={mortgage ? 'checked' : false}
              />
            <span className='lkbid-checkbtn-title'>
              Займ/Ипотека</span>
          </Col>
          <Col xs={5} className="lkbid-checkbtn">
              <CheckButton
                itemID='lkbid-socProg'
                onValue={true}
                offValue={false}
                onChange={this.toggleSocProg}
                dataModel={{}}
                mode='0'
                checked={socProg ? 'checked' : false}
              />
              <span className='lkbid-checkbtn-title'>
                Соц. Программа</span>
          </Col>
        </Row>
        {auction ? (
          <Row className='form-group'>
            <Col xs={6}>
              <label>
                Сообщение владельцу
              </label>
            </Col>
            <Col xsOffset={1} xs={10}>
              <textarea
                placeholder='Введите Ваше сообщение'
                rows={3}
                data-field='comment'
                value={comment}
                onChange={this.handleChange.bind(this)} />
            </Col>
          </Row>) : null
        }
        <Row>
          <Col xsOffset={3} xs={6}>
            <Button type='submit' bsStyle='primary'>
              {lastBid ? 'Новая ставка' : 'Предложить цену'}
            </Button>
          </Col>
        </Row>
      </form>
    );
  }
}

export default LKBid;
