/**
 * MobileRieltor widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {size} from 'lodash';
import ga from '../../utils/ga';
import {phoneFormatter} from '../../utils/Helpers';
import RieltorOrderForm from './RieltorOrderForm';
import Image from '../../shared/Image';
import s from './MobileRieltor.scss';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

const ticketModes = [
  {id: 'bid', title: 'Предложить свою цену'},
  {id: 'qst', title: 'Задать вопрос'}
];

class MobileRieltor extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    title: PropTypes.string,
    objectPrice: PropTypes.oneOfType([
      PropTypes.string, PropTypes.number
    ]),
    objectId: PropTypes.oneOfType([
      PropTypes.string, PropTypes.number
    ]),
    actions: PropTypes.object,
    defaultQuestion: PropTypes.string,
    realtor: PropTypes.object,
    countryCode: PropTypes.object,
    ticketType: PropTypes.string,
    sendedRedirect: PropTypes.string,
    gaTelTap: PropTypes.string,
    mode: PropTypes.string
  };

  static defaultProps = {
    mode: '2'
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.ticketModes = ticketModes[props.mode] ?
      [ticketModes[props.mode]] : ticketModes;
    this.state = {
      ticketMode: ticketModes[props.mode] ? ticketModes[props.mode].id : 'bid'
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentDidMount() {
    const {objectId} = this.props;

    this.props.actions.updateInObjectsState(['realtorTicket', 'object_id'],
      () => (objectId));
  }

  ticketModeSwitch = e => {
    const {mode} = e.target.dataset || {};
    const {defaultQuestion} = this.props;
    const question = mode === 'qst' ? defaultQuestion : '';

    mode && this.setState(() => ({
      ticketMode: mode
    }));

    this.props.actions.updateInObjectsState(['realtorTicket', 'question'],
      () => (question));
  }

  telClick = () => {
    const {gaTelTap} = this.props;

    size(gaTelTap) && ga('link', gaTelTap);
  }

  render() {
    const {
      realtor, title, countryCode, ticketType, context, objectPrice,
      sendedRedirect
    } = this.props;
    const {ticketMode} = this.state;
    const {fio, photo, phone} = realtor;
    const arrPath = photo ? photo.split('/') : null;
    const photoFileName = arrPath ? arrPath[arrPath.length - 1] :
      'https://cdn-media.etagi.com/static/site/d/dc/dc8fe03733545f4cbdd728e5e7b461294f127c83.png'; //eslint-disable-line max-len
    const imageProps = {
      image: photoFileName,
      visual: 'profile',
      width: 100,
      height: 100
    };
    const agentPhone = size(phone) ? phoneFormatter(
      phone, countryCode.current, countryCode.avail
    ) : null;
    const orderTitle = this.ticketModes.find(item => {
      return item.id === ticketMode;
    }).title;

    return (
      <div className={s.root}>
        <div className={s.title}>
          {title}
        </div>
        <div className={s.avatar}>
          <Image {...imageProps} alt={fio} className='img-circle' />
        </div>
        <div className={s.fio}>
          {fio}
        </div>
        <div className={s.position}>
          Специалист по недвижимости
        </div>
        <div className={s.phone} onClick={this.telClick}>
          <a href={`tel:${phone}`}>{agentPhone}</a>
        </div>
        {size(this.ticketModes) > 1 ? <div className={s.ticketModeSwitcher}>
          {this.ticketModes.map(item => {
            return (
              <button
                key={`ticketMode-${item.id}`}
                className={classNames(
                  s.ticketModeButton,
                  {[s.active]: ticketMode === item.id}
                )}
                data-mode={item.id}
                onClick={this.ticketModeSwitch}>
                {item.title}
              </button>
            );
          })}
        </div> : null}
        <RieltorOrderForm
          context={context}
          ticketType={ticketType}
          ticketMode={ticketMode}
          objectPrice={objectPrice}
          orderTitle={orderTitle}
          sendedRedirect={sendedRedirect}/>
      </div>
    );
  }

}

export default connect(
  state => {
    const {info: objectInfo, realtor} = state.objects.get('object') ?
        state.objects.get('object').toJS() : {};

    return {
      objectId: objectInfo ? objectInfo.object_id : null,
      objectPrice: objectInfo ? objectInfo.price : null,
      realtor: realtor,
      realtorTicket: state.objects.get('realtorTicket') ?
        state.objects.get('realtorTicket').toJS() : null,
      mediaSource: state.settings.get('mediaSource'),
      countryCode: state.settings.get('countryCode').toJS()
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({
        updateInUiState, updateInObjectsState
      }, dispatch)
    };
  }
)(MobileRieltor);
