/**
 * BuilderPromo Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import Helpers from '../../utils/Helpers';
import {getUser, sendOrder, getWebOwner} from '../../utils/requestHelpers';
import mediaHelpers from '../../utils/mediaHelpers';
import withCondition from '../../decorators/withCondition';
import FilterQuarterStore from '../../stores/FilterQuarterStore';

@withCondition()
class Rieltor extends Component {

  static propTypes = {
    position: React.PropTypes.string,
    staticPhone: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.bool,
      React.PropTypes.number
    ]),
    rltr: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.bool,
      React.PropTypes.number
    ]),
    showRLink: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      loading: true,
      text: ''
    };

    this.onChange = this.onChange.bind(this);
    this.validationState = this.validationState.bind(this);
  }

  componentWillMount() {
    if (data.object && data.object.info) {
      //делаем ajax запрос на получение данных по id объекту
      const object = data.object.info;
      const objectId = object.object_id;

      /* eslint react/prop-types: 0 */
      if(this.props.webOwner === 'show' && (!isNaN(objectId))) {

        getWebOwner(objectId).then(response => {

          if (parseInt(response.ajax.error) != '1') {

            if (response.ajax.name && response.ajax.phone)  {
              this.setState(() => ({
                owner: 1,
                ownerName: response.ajax.name,
                ownerPhone: response.ajax.phone
              }));
            } else {
              this.setState(() => ({owner: 0}));
            }
          } else {
            this.setState(() => ({owner: 0}));
          }
        });

      } else {
        this.setState(() => ({owner: 0}));
      }
    } else {
      this.setState(() => ({owner: 0}));
    }
  }

  // TODO: рефакторинг
  componentDidMount() {
    /* global data */
    const position = this.props.position;
    const object = data.object && data.object.info;
    const officePhone = object ?
      object.officePhone :
      null;
    const self = this;
    const {rltr, staticPhone} = this.props;
    //const phone = this.props.staticPhone;

    // значения по умолчанию
    const rieltor = {
      agentName: 'Консультант по новостройкам',
      phoneNum: staticPhone ? staticPhone : officePhone,
      photoAgentName: 'https://cdn-media.etagi.com/static/site/d/dc/dc8fe03733545f4cbdd728e5e7b461294f127c83.png'
    };

    if (!position || position === 'builder') {
      // оставляем значения по умолчанию
      this.setState(() => ({
        rieltor: rieltor,
        loading: false
      }));
    } else if (position === 'realty' || position === 'commerce' || rltr) {
      const userId = rltr ? rltr : parseInt(object.user_id);
      const dataUser = {
        action: 'get_user',
        userId: userId
      };

      if (!isNaN(userId)) {
        getUser(dataUser).then(response => {
          if (parseInt(response.ajax.id) > 0) {
            rieltor.userId = userId;
            rieltor.agentName = response.ajax.fio;
            rieltor.phoneCode = '';
            rieltor.phoneNum = staticPhone ? staticPhone :
              Helpers.phoneFormatter(
                response.ajax.phone,
                data.options.countryCode.current,
                data.options.countryCode.avail
              );
            rieltor.photoAgentName = response.ajax.photo ? response.ajax.photo :
            '/no_photo';
            rieltor.noSite = response.ajax.no_site;

            const arr = rieltor.photoAgentName.split('/');
            const photoFileName = arr[arr.length - 1];

            rieltor.photoAgentName = (data.options.mediaSource ?
                mediaHelpers.getApiMediaUrl(
                '160160',
                'profile',
                rieltor.photoAgentName,
                data.options.mediaSource) :
            `http://agava.etagi.com/profile/108/108/1/0/0/0/0/10/4/${photoFileName}`);
          } else {
            rieltor.agentName = 'Консультант по этому объекту';
          }
          self.setState(() => ({
            rieltor: rieltor,
            loading: false
          }));
        });
      }
    } else if (position === 'jk' && !rltr) {
      FilterQuarterStore.onChange(this.onChange);
      this.onChange();
    } else {
      this.setState(() => ({
        rieltor: rieltor,
        loading: false
      }));
    }
  }

  onChange() {
    const position = this.props.position;
    const self = this;

    if (position === 'jk') {
      const staticPhone = this.props.staticPhone;
      /* global data */
      const officePhone = data.object.info ?
          data.object.info.officePhone :
          null;

      // значения по умолчанию
      const rieltor = {
        agentName: 'Консультант по новостройкам',
        phoneNum: staticPhone ? staticPhone : officePhone,
        photoAgentName:
          'https://cdn-media.etagi.com/static/site/d/dc/' +
          'dc8fe03733545f4cbdd728e5e7b461294f127c83.png'
      };

      const agent = data.object.info ? data.object.info.agent : null;

      if (FilterQuarterStore.myFlat.dolshik === 1) {
        const userId = FilterQuarterStore.myFlat.user_id;
        const dataUser = {
          action: 'get_user',
          userId: userId
        };

        getUser(dataUser).then(response => {
          if (parseInt(response.ajax.id) > 0) {
            rieltor.userId = userId;
            rieltor.agentName = response.ajax.fio;
            rieltor.phoneCode = '';
            rieltor.phoneNum = staticPhone ?
              staticPhone :
              Helpers.phoneFormatter(
                response.ajax.phone,
                data.options.countryCode.current,
                data.options.countryCode.avail
              );
            rieltor.photoAgentName = response.ajax.photo ? response.ajax.photo :
              '/no_photo';

            const arr = rieltor.photoAgentName.split('/');
            const photoFileName = arr[arr.length - 1];

            rieltor.photoAgentName = (data.options.mediaSource ?
              mediaHelpers.getApiMediaUrl(
                '160160',
                'profile',
                rieltor.photoAgentName,
                data.options.mediaSource) :
             `http://agava.etagi.com/profile/108/108/1/0/0/0/0/10/4/${photoFileName}`);
          } else {
            rieltor.agentName = 'Консультант по этому объекту';
          }
          self.setState(() => ({
            rieltor: rieltor,
            loading: false
          }));
        });

      } else {
        if (agent) {

          rieltor.userId = agent.id;
          rieltor.agentName = agent.fio;
          rieltor.phoneCode = '';
          rieltor.phoneNum = staticPhone ? staticPhone :
            Helpers.phoneFormatter(
              agent.phone,
              data.options.countryCode.current,
              data.options.countryCode.avail
            );
          rieltor.photoAgentName = agent.photo;

          const arr = rieltor.photoAgentName.split('/');
          const photoFileName = arr[arr.length - 1];

          rieltor.photoAgentName = (data.options.mediaSource ?
            mediaHelpers.getApiMediaUrl(
              '160160',
              'profile',
              rieltor.photoAgentName,
              data.options.mediaSource) :
           `http://agava.etagi.com/profile/108/108/1/0/0/0/0/10/4/${photoFileName}`);
        }

        self.setState(() => ({
          rieltor: rieltor,
          loading: false
        }));
      }
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    const self = this;
    const state = this.state;
    const props = this.props;
    const objectData = data.object && data.object.info;
    let source;
    let orderType = props.orderType;

    /* global data */
    switch (props.position) {
    case 'builder':
      source = `страница застройщика - ${self.props.builder}`;
      orderType = orderType === 'auto' ? 7 : orderType;
      break;
    case 'realty':
      source = `страница объекта - ${data.object.info.object_id}`;
      // определяем тип заявки
      if (objectData.table && self.props.orderType === 'auto') {
        switch (objectData.table) {
        case 'flats':
          orderType = 3;
          break;
        case 'rent':
          orderType = 5;
          break;
        case 'cottages':
          orderType = 11;
          break;
        default:
          orderType = 3;
          break;
        }
      }
      break;
    case 'jk':
      /* global data */
      source = `страница объекта новостройки -
        ${data.object.info.info.gp}
        (${data.object.info.id})`;
      orderType = orderType === 'auto' ? 7 : orderType;
      break;
    case 'commerce':
      source = `страница объекта коммерческой -
       ${data.object.info.object_id}`;
      orderType = orderType === 'auto' ?
       (objectData.action_sl === 'sale' ? 14 : 16) : orderType;
      break;
    default:
      source = `страница застройщика - ${self.props.builder}`;
      break;
    }

    source = state.rieltor.userId ?
      `${source}, ответственный риэлтор
       ${state.rieltor.agentName} (${state.rieltor.userId})` :
      source;

    const phoneVal = Helpers.phoneCleanup(state.phone);

    const phoneFormatted = Helpers.phoneFormatter(
      phoneVal,
      data.options.countryCode.current,
      data.options.countryCode.avail
    );
    const strMessage = `Ваш телефон: ${phoneFormatted}, ${source}`;
    const cityId = parseInt(self.props.cityId) ? self.props.cityId : '23';

    if (self.validationState()) {

      const dataSend = {
        action: 'create_ticket',
        phone: phoneVal,
        message: `${strMessage}${Helpers.getUtmParams()}`,
        source: 'Web',
        'advanced_source': 'ticket_new_site',
        'type_id': orderType,
        'city_id': cityId
      };

      sendOrder(dataSend).then(response => {
        if (response.ajax.success) {
          self.setState(() => ({phone: ''}));

          let href = window.location.pathname.substr(1);

          href = href ? href.split('/')[0] : 'main';
          document.location.href =
            `${window.location.origin}/thank-you/?from=${href}`;
        }
      });
    }
    this.setState(() => ({sending: false}));
  }

  handleChange(event) {
    const phone = event.target.value;

    this.setState(() => ({
      phone: Helpers.phoneFormatter(phone,
        data.options.countryCode.current,
        data.options.countryCode.avail
      )
    }));
  }

  validationState() {
    const state = this.state;
    let validation = true;

    if(state.phone) {
      const phone = state.phone ? state.phone.toString() : '';

      if(Helpers.testPhone(
        phone.replace(/[^0-9+]*/g, ''),
        true,
        data.options.countryCode.avail
      )) {
        state.style = 'success';
      } else {
        state.style = 'error';
        state.text = 'Введите телефон';
        validation = false;
      }
    } else {
      state.style = 'error';
      state.text = 'Введите телефон';
      validation = false;
    }
    this.setState(state);

    return validation ? true : false;
  }

  getDataOwner = (type) => {
    if (typeof(this.state.owner) != 'undefined') {
      const {
        agentName,
        photoAgentName,
        phoneCode,
        phoneNum,
        userId,
        noSite
        } = this.state.rieltor;

      let agentFace = <img src={photoAgentName} alt=''/>;
      let agentFullName = <i>{agentName}</i>;

      if((this.props.showRLink === 'yes') && (userId !== undefined) &&
      (noSite !== 't')) {
        agentFace = (<a href={`/agents/?show_person&id=${userId}`}
          target='__blank'>{agentFace}</a>);
        agentFullName = (<a href={`/agents/?show_person&id=${userId}`}
          target='__blank'> {agentFullName}</a>);
      }

      switch (type) {
      case 'agentName':
        if (parseInt(this.state.owner) === 1) {
          return (
            <p className='text-center person-name'>
              <i><noindex>{this.state.ownerName}</noindex></i>
            </p>
          );
        } else {
          return (
            <p className='text-center person-name'>
              {agentFullName}
            </p>
          );
        }
        break;
      case 'ring':
        if (parseInt(this.state.owner) === 1) {
          return (
            <p className='text-center person-data'>
              <div className='text-center person-data'>
                <a className='jk-phone phone_number'
                  href={`tel: ${Helpers.phoneCleanup(this.state.ownerPhone)}`}>
                  <b><noindex>{this.state.ownerPhone}</noindex></b>
                </a>
              </div>
            </p>
          );
        } else {
          return (
            <p className='text-center person-data'>Звоните, я на связи!<br/>
              <span className='jk-phone'>{phoneCode}</span>
              <a className='jk-phone phone_number'
                href={`tel: ${Helpers.phoneCleanup(phoneNum)}`}>
                <b>{phoneNum}</b>
              </a>
            </p>
          );
        }
        break;
      case 'reRing':
        if (parseInt(this.state.owner) === 1) {
          return '';
        } else {
          return (
            <p className='text-center'>или оставьте Ваш номер, я перезвоню в
            течение 5 минут</p>
          );
        }
        break;
      case 'form':
        if (parseInt(this.state.owner) === 1) {
          return '';
        } else {
          return (
            <form className='order-form clearfix'
              onSubmit={this.handleSubmit.bind(this)}>
              <div className='simple-form'>
                <input type='text' data-name='phone'
                  onChange={this.handleChange.bind(this)}
                  className='simple-form-input'
                  value={this.state.phone}
                  placeholder='Введите номер телефона' />
                <button type='submit' className='envelope-green'></button>
              </div>
              <p className='errorText'>
                {this.state.style === 'error' ? this.state.text : ''}
              </p>
            </form>
          );
        }
        break;
      case 'photo':
        if (parseInt(this.state.owner) === 1) {
          return (
            <div className='jk-avatar'>
            <img src='https://cdn-media.etagi.com/static/site/b/b3/b37e8fcd5147472ad4672754cd6a3c8be8616690.png'  alt='Собственник'/>
            </div>
          );
        } else {
          return (
            <div className='jk-avatar'>
            {agentFace}
            </div>
          );
        }
      default:
      }
    }
  }
  render() {
    const state = this.state;

    if (state.loading !== false) {
      return (
        <div className='rieltor-block rieltor-flat mg-left-20'>Загрузка...</div>
      );
    }
    return (
      <div className='rieltor-block rieltor-flat mg-left-20'>
        <div className='jk-person'>
            {this.getDataOwner('agentName')}
            {this.getDataOwner('photo')}
            {this.getDataOwner('ring')}
            {this.getDataOwner('reRing')}
            {this.getDataOwner('form')}
        </div>
      </div>
    );
  }
}



Rieltor.defaultProps = {
  orderType: 2,
  rltr: false,
  staticPhone: false
};

export default Rieltor;
