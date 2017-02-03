/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {clone, map} from 'lodash';
import {testPhone, phoneFormatter, getUtmParams} from '../../utils/Helpers';
import {phoneCleanup} from 'etagi-helpers';
import {
  getUser, rieltorCloud, postOrder, getWebOwner, getFromBack
} from '../../utils/requestHelpers';

import withCondition from '../../decorators/withCondition';

import FilterQuarterStore from '../../stores/FilterQuarterStore';
import Image from '../../shared/Image';

import userStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';
import ga from '../../utils/ga';
import Button from 'react-bootstrap/lib/Button';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

import wss from '../../stores/WidgetsStateStore';
import {findDOMNode} from 'react-dom';

const isMounted = (component) => {
  // exceptions for flow control
  try {
    findDOMNode(component);
    return true;
  } catch (e) {
    // Error
    return false;
  }
};

/* global data */
@withCondition()
class Rieltor2 extends Component {

  static propTypes = {
    position: PropTypes.string,
    staticPhone: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    rltr: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    showRLink: PropTypes.string,
    orderType: PropTypes.string,
    rieltorId: PropTypes.string,
    fio: PropTypes.string,
    departments: PropTypes.string,
    agentPhoto: PropTypes.string,
    agentPhone: PropTypes.string,
    description1: PropTypes.string,
    description2: PropTypes.string,
    description3: PropTypes.string,
    btnName: PropTypes.string,
    webOwner: PropTypes.string,
    wssSettings: PropTypes.string,
    pluses: PropTypes.string,
    googleEvent: PropTypes.string,
    showSocLink: PropTypes.string,
    placeholder: PropTypes.string
  };

  static defaultProps = {
    orderType: 'auto',
    rltr: '',
    staticPhone: '',
    departments: '-',
    wssSettings: '',
    placeholder: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      buttonLoader: false,
      phone: '',
      store: wss,
      loading: true,
      text: '',
      pluses: this.pluses()
    };

    this.onChange = this.onChange.bind(this);
    this.onChangeUserStore = this.onChangeUserStore.bind(this);
    this.onChangeWssStore = this.onChangeWssStore.bind(this);
    this.validationState = this.validationState.bind(this);
  }

  componentWillMount() {
    userStore.onChange(this.onChangeUserStore);

    if (this.props.wssSettings) {
      this.state.store.onChange(this.onChangeWssStore);
    }
  }

  componentWillUnmount() {
    userStore.offChange(this.onChangeUserStore);
    this.state.store.offChange(this.onChange);
  }

  onChangeWssStore = () => {
    const {wssSettings} = this.props;
    const {store, rieltor} = this.state;
    const wssData = store.get();

    if (wssSettings && wssData[wssSettings]) {
      if (!rieltor) {
        this.setState({
          rieltor: wssData[wssSettings],
          loading: false
        });
      } else {
        this.setState({
          rieltor: wssData[wssSettings],
          loading: false
        });
      }
    }
  }

  onChangeUserStore = () => {
    const userStoreData = userStore.get();
    const state = this.state;

    if (userStoreData.isAuthorized && !state.phone) {
      const {phone} = userStoreData.userInfo;
      const phoneNum =  phone ? phoneFormatter(
        phone,
        data.options.countryCode.current,
        data.options.countryCode.avail
      ) : '';

      this.setState(() => ({
        phone: phoneNum
      }));
    }
  }

  get rieltorDefault() {
    const {selectedCity} = data.options;
    const {staticPhone} = this.props;

    return {
      userId: -100,
      agentName: 'Консультант по новостройкам',
      photoAgentName: 'https://cdn-media.etagi.com/static/site/d/dc/dc8fe03733545f4cbdd728e5e7b461294f127c83.png',
      specifications: '',
      phoneNum: staticPhone ? staticPhone : (
        selectedCity ? selectedCity.office_phone : ''),
    };
  };

  rieltorInfo = (info) => {
    const rieltor = clone(this.rieltorDefault);
    const {staticPhone} = this.props;
    const {selectedCity} = data.options;

    rieltor.userId = info.id;
    rieltor.agentName = info.fio;
    rieltor.specifications = info.specifications ? info.specifications : '';
    rieltor.phoneNum = staticPhone ? staticPhone :
      info.phone ? phoneFormatter(
        info.phone,
        data.options.countryCode.current,
        data.options.countryCode.avail
      ) : selectedCity.office_phone;
    rieltor.photoAgentName = info.photo ? info.photo :
      '/no_photo';
    rieltor.noSite = info.no_site;
    rieltor.rate = info.rate;

    return rieltor;
  }

  getRieltor = (id) => {
    const dataUser = {
      action: 'get_user',
      userId: id
    };
    const self = this;
    let rieltor = this.rieltorDefault;

    if (!isNaN(id)) {
      getUser(dataUser).then(response => {
        if (parseInt(response.ajax.id) > 0) {
          rieltor = this.rieltorInfo(response.ajax);
        } else {
          rieltor.agentName = 'Консультант по этому объекту';
          rieltor.userId = -100;
        }
        self.setState(() => ({
          rieltor: rieltor,
          loading: false
        }));
      });
    }else {
      this.setState(() => ({
        rieltor: rieltor,
        loading: false
      }));
    }
  }

  getRieltorCloud = () => {
    const dataUser = {
      department: this.props.departments,
      cityId: data.options.cityId
    };
    let rieltor = this.rieltorDefault;

    rieltorCloud(dataUser).then(response => {
      const countUser = response.ajax.users && response.ajax.users.length > 0 ?
        response.ajax.users.length : 0;
      const randomEl = parseInt(Math.random() * (countUser - 1));

      if (countUser) {
        rieltor = this.rieltorInfo(response.ajax.users[randomEl]);
      } else {
        rieltor.agentName = 'Специалист по недвижимости';
        rieltor.userId = -100;
      }

      this.setState(() => ({
        rieltor: rieltor,
        loading: false
      }));
    });
  }

  componentDidMount() {
    const object = data.object && data.object.info;
    const {rltr, position, rieltorId, fio, agentPhoto, agentPhone,
    webOwner, wssSettings, departments} = this.props;
    // значения по умолчанию
    const rieltor = this.rieltorDefault;

    if (object && webOwner === 'show' && !isNaN(object.object_id)) {
      //Получаем данные продавца объекта недвижимости, а не риэлтора
      getWebOwner(object.object_id).then(response => {
        const ajax = response.ajax;

        if (parseInt(ajax.error) !== 1 && ajax.name && ajax.phone) {
          this.setState(() => ({
            owner: 1,
            ownerName: ajax.name,
            ownerPhone: ajax.phone
          }));
        } else {
          this.setState(() => ({owner: 0}));
        }
      });
    } else if (departments !== '-') {
      this.getRieltorCloud();
    } else if (fio && agentPhoto && agentPhone) {
      rieltor.userId = -100;
      rieltor.agentName = fio;
      rieltor.phoneNum = agentPhone;
      rieltor.photoAgentName = agentPhoto;

      this.setState(() => ({
        rieltor: rieltor,
        loading: false
      }));
    } else if (wssSettings) {
      this.onChangeWssStore();
    } else if (parseInt(rieltorId) > 0) {
      this.getRieltor(rieltorId);
    } else if (!position || position === 'builder') {
      // оставляем значения по умолчанию
      this.setState(() => ({
        rieltor: rieltor,
        loading: false
      }));
    } else if (position === 'realty' || rltr) {
      const userId = rltr ? rltr : parseInt(object.user_id);

      this.getRieltor(userId);
    } else if (position === 'jk' && !rltr) {
      FilterQuarterStore.onChange(this.onChange);
      this.onChange();
    } else {
      this.setState(() => ({
        rieltor: rieltor,
        loading: false,
        owner: 0
      }));
    }
    this.onChangeUserStore();
  }

  onChange() {
    let rieltor = clone(this.rieltorDefault);
    const agent = data.object && data.object.info.agent;

    if (FilterQuarterStore.myFlat.dolshik === 1) {
      const userId = FilterQuarterStore.myFlat.user_id;

      this.getRieltor(userId);
    } else if (agent && isMounted(this)) {
      rieltor = this.rieltorInfo(agent);

      this.setState(() => ({
        rieltor: rieltor,
        loading: false
      }));
    } else {
      rieltor = this.rieltorDefault;

      this.setState(() => ({
        rieltor: rieltor,
        loading: false
      }));
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    const state = this.state;
    const props = this.props;
    const objectData = data.object && data.object.info;
    let source;
    let orderType = props.orderType;


    /* global data */
    switch (props.position) {
    case 'builder':
      source = `страница застройщика - ${props.builder}`;
      orderType = orderType === 'auto' ? 7 : orderType;
      break;
    case 'realty':
      source = `страница объекта - ${objectData.object_id}`;
      // определяем тип заявки
      if (objectData.table && orderType === 'auto') {
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
        case 'offices':
          orderType = orderType === 'auto' ?
            (objectData.action_sl === 'sale' ? 14 : 16) : orderType;
          break;
        default:
          orderType = 3;
          break;
        }
      }
      break;
    case 'jk':
      /* global data */
      source = `страница объекта новостройки - ${objectData.info.gp}
        (${objectData.id})`;
      orderType = orderType === 'auto' ? 7 : orderType;
      break;
    default:
      source = `страница застройщика - ${props.builder}`;
      break;
    }

    source = state.rieltor.userId ?
      `${source}, ответственный риэлтор
       ${state.rieltor.agentName} (${state.rieltor.userId})` :
      source;

    const cleanedPhone = phoneCleanup(state.phone);
    const phoneFormatted = phoneFormatter(
      cleanedPhone,
      data.options.countryCode.current,
      data.options.countryCode.avail
    );
    const strMessage = `Ваш телефон: ${phoneFormatted}, ${source} `;
    const cityId = parseInt(data.options.cityId) ? data.options.cityId : '23';

    if (this.validationState()) {
      this.setState({
        buttonLoader: true,
      });

      const dataSend = {
        action: 'create_ticket',
        phone: cleanedPhone,
        message: `${strMessage} ${getUtmParams()}`, //eslint-disable-line max-len
        source: 'Web',
        advanced_source: 'ticket_new_site', //eslint-disable-line camelcase
        type_id: orderType,  //eslint-disable-line camelcase
        city_id: cityId  //eslint-disable-line camelcase
      };


      postOrder(dataSend).then(response => {
        if (response.ok) {

          getFromBack({
            action: 'user_get_all'
          }).then(response => {
            if(response.ok) {
              UserActions.fill(response.data);

              let href = window.location.pathname.substr(1);

              href = href ? href.split('/')[0] : 'main';
              document.location.href =
                `${window.location.origin}/thank-you/?from=${href}`;
            } else {
              WidgetsActions.set('notify',[{
                msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
                type: 'warn'
              }]);
            }
          });
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
            type: 'dang'
          }]);
        }

      }).catch(() => {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
          type: 'dang'
        }]);
      });
    }
    this.setState(() => ({sending: false}));
  }



  handleChange(event) {
    const phone = event.target.value;

    this.setState(() => ({
      phone: phoneFormatter(phone,
        data.options.countryCode.current,
        data.options.countryCode.avail
      )
    }));
  }

  validationState() {
    const state = this.state;
    let validation = true;

    if(testPhone(
      state.phone.replace(/[^0-9+]*/g, ''),
      true,
      data.options.countryCode.avail
    )) {
      state.style = 'success';
    } else {
      state.style = 'error';
      state.text = 'Введите телефон';
      validation = false;
    }
    this.setState(state);

    return validation ? true : false;
  }

  agentName = () => {
    const {
      owner, ownerName,
      rieltor: {
        agentName, userId, noSite
      }
    } = this.state;
    const {showRLink} = this.props;

    const agentNameArr = agentName.split(' ');
    const elseName = agentNameArr.slice(1);

    let agentFullName = (<span>
      <span className="surnameAgent">{agentNameArr[0]}</span><br/>
      <span className="elseName">{elseName.join(' ')}</span>
    </span>);

    if((showRLink === 'yes') && parseInt(userId) > 0 && (noSite !== 't')) {
      agentFullName = (<a href={`/agents/?show_person&id=${userId}`}
                          target='__blank'> {agentFullName}</a>);
    }

    return (
      <p className='text-center person-name'>
        {owner ?
          <noindex>{ownerName}</noindex> :
          agentFullName}
      </p>
    );
  }

  socialBlockLink = () => {
    const {rieltor} = this.state;
    const classButtonsVk = data.object && data.object.info.info &&
      data.object.info.info.class ===
      'newhouses' ? 'social-block-newhouse'  : 'social-block' ;

    if (rieltor.specifications != '') {
      const socialLink =  JSON.parse(rieltor.specifications);
      const socialLinkVK = socialLink[8] != null ? socialLink[8].value : '';
      const tooltip = (
        <Tooltip id="tooltip" bsClass="tooltip tooltip-rieltor-social">
          Этот номер подключен к популярным мессенджерам
        </Tooltip>
      );

      const messengersBlock = (
        <span style={{position: 'relative'}}>
           {socialLinkVK ? (
            <span className={classButtonsVk}>

            <OverlayTrigger
                bsClass='tooltip'
                 overlay={tooltip}
              placement="top"
              delayHide={0}
              animation={0}
              rootClose={true}>
              <span>
                 <span className='line'>
                   <img src="https://cdn-media.etagi.com/static/site/e/e5/e558b46d074a892da168756a73f6f0ff7d71c3a1.png" />
                 </span>
               </span>
            </OverlayTrigger>
              <OverlayTrigger
                bsClass='tooltip'
                 overlay={tooltip}
              placement="top"
              delayHide={0}
              animation={0}
              rootClose={true}>
              <span>
                <span className='line'>
                  <img src="https://s-media-cache-ak0.pinimg.com/236x/e6/85/55/e685555d3879dd2407d668086ee7208a.jpg" />
                </span>
               </span>
            </OverlayTrigger>
               <OverlayTrigger
                 bsClass='tooltip' overlay={tooltip}
              placement="top"
              delayHide={0}
              animation={0}
              rootClose={true}>
                <span className='left'>
                  <img src="http://www.saeedshayan.com/moduls/sociallink/icons/telegram.png" />
                </span>
              </OverlayTrigger>
            </span>
          ) : null}
      </span>
      );

      return messengersBlock;
    }
  }

  socialVkButton = () => {
    const {rieltor} = this.state;

    if (rieltor.specifications != '') {
      const socialLink =  JSON.parse(rieltor.specifications);
      const socialLinkVK = socialLink[8] != null ? socialLink[8].value : '';
      const vkButton = (socialLinkVK != '' ? (
        <div className='social-block'>
          <a href={socialLinkVK} target='__blank'
            className='btn socialLinkVK'
             onClick={this.trackVk}>
            <i className="fa fa-vk" aria-hidden="true"></i>
            Написать специалисту
          </a>
        </div>
      ) : null);

      return vkButton;
    }
  }

  agentPhoto = () => {
    const {
      rieltor: {
        photoAgentName,
        agentName,
        userId,
        noSite
      }
    } = this.state;
    const {showRLink} = this.props;
    const arrPath = photoAgentName.split('/');
    const photoFileName = arrPath[arrPath.length - 1];
    const imageProps = {
      image: photoFileName,
      visual: 'photo',
      width: 160,
      height: 160
    };

    const agentFace = userId === -100 ||
      agentName === 'Консультант по новостройкам' ?
      <img src={photoAgentName} alt={agentName} /> : (
      showRLink === 'yes' && userId && noSite !== 't' ?
      <a href={`/agents/?show_person&id=${userId}`} target='__blank'>
        <Image {...imageProps} alt={agentName} />
      </a> :
      <Image {...imageProps} alt={agentName} />);

    return (
      <div className='jk-avatar'>
        {
          photoFileName === 'no_photo' ?
          <img src='https://cdn-media.etagi.com/static/site/b/b3/b37e8fcd5147472ad4672754cd6a3c8be8616690.png'  alt='Собственник'/> :
          agentFace}
      </div>
    );
  }

  agentPhone = () => {
    const {
      owner,
      ownerPhone,
      rieltor: {
        phoneNum
      }
    } = this.state;
    const phoneFormat = owner ? ownerPhone : phoneNum;
    const phoneClean = phoneCleanup(phoneFormat);

    return (
      <div className='text-center'>
        <a className='jk-phone phone_number'
           href={`tel: ${phoneClean}`}>
          <i className="fa fa-mobile" aria-hidden="true" />
          <b>{owner ? <noindex>{ownerPhone}</noindex> : phoneNum}</b>
        </a>
      </div>
    );
  }

  descriptionFirst = () => {
    const {description1} = this.props;

    return (description1 === '-' ? null :
      <p className='text-center person-data'>
        {description1 ? description1 : 'Об этой квартире все знает:'}
      </p>);
  }

  descriptionSecond = () => {
    const {description2} = this.props;

    return description2 === '-' ? null :
      <div className='text-center person-data'>
        {description2 ? description2 : 'Связаться со мной!'}</div>;
  }

  descriptionLast = () => {
    const {owner} = this.state;
    const {description3} = this.props;

    return owner || description3 === '-' ? null :
      <p className='text-center person-data person-data-last'>
        {description3 ? description3 :
          'или оставьте Ваш номер, и я перезвоню в течение 5 минут'}
      </p>;
  }

  pluses = () => {
    const {pluses} = this.props;
    let ul;
    let plusesArr = pluses ? pluses.split('\n') : [];

    if (plusesArr.length > 1) {
      plusesArr = plusesArr.sort(() => {
        return 0.5 - Math.random();
      });
      plusesArr = plusesArr.splice(0, 3);
      ul = map(plusesArr, (val, key) => {
        return (<li key={key}>
          <i className="fa fa-check colorGreen" />
          {val}
        </li>);
      });
    }

    return plusesArr.length ? <ul className="rieltor2-list">{ul}</ul> : null;
  }

  trackVk = () => {
    ga('button', 'vk_me');
  }

  trackRieltor = () =>{
    this.props.googleEvent ?
    this.props.googleEvent === 'pageview' ? ga('pageview', '/virtual/' +
        'thank-you/?from=zastr_popup_podrobnee_o_kvartire_' +
        'rieltor_zhdu_zvonka') : ga('click',
        this.props.googleEvent) : null;
  }



  form = () => {
    const {btnName, showSocLink, placeholder} = this.props;
    const {owner, phone, style, text, buttonLoader} = this.state;
    const rieltorSocial = 'order-form clearfix form-social ' + `${(showSocLink ?
          'rieltor2-social' : null)}`;
    const classInput = `${style === 'error' ? 'input-error' : ''} form-etagi col-md-12`; //eslint-disable-line max-len

    return owner ? null : (showSocLink === 'yes' ? (
      <form className={rieltorSocial}
            onSubmit={this.handleSubmit.bind(this)} >
        <div className='form-group'>
          <div className="margin3 clearfix">
            <input type='text' data-name='phone'
              onChange={this.handleChange.bind(this)}
              className={classInput}
              value={phone}
              placeholder={placeholder}/>
            <div className="input-group-addon orderImportant">*</div>
          </div>
        </div>
        <Button
            type='submit'
            onClick={this.trackRieltor}
            disabled={buttonLoader}
            className='btn btn-rieltorGreen'>
          {buttonLoader ?
              (<div className="loader-inner ball-pulse">
                <div />
                <div />
                <div />
              </div>) :
          btnName ? btnName : 'Жду звонка'
          }
        </Button>
      </form>) : (
      <form className='order-form clearfix'
            onSubmit={this.handleSubmit.bind(this)}>
        <div className="form-group">
          <div className="margin3 clearfix">
            <input type='text' data-name='phone'
              onChange={this.handleChange.bind(this)}
              className={classInput}
              value={phone}
              placeholder={placeholder} />
            <div className="input-group-addon orderImportant">*</div>
            <p className='errorText'>
              {style === 'error' ? text : ''}
            </p>
          </div>
        </div>
        <Button
            type='submit'
            onClick={this.trackRieltor}
            disabled={buttonLoader}
            className='btn btn-rieltorGreen'>
          {buttonLoader ?
              (<div className="loader-inner ball-pulse">
                <div />
                <div />
                <div />
              </div>) :
          btnName ? btnName : 'Жду звонка'
          }
        </Button>
      </form>));
  }

  render() {
    const {loading, pluses} = this.state;
    const {showSocLink} = this.props;
    const htmlData = !loading ? (<div className='jk-person'>
        {this.descriptionFirst()}
        {this.agentPhoto()}
        {this.agentName()}
        {pluses}
        {this.descriptionSecond()}
        {this.agentPhone()}
        {showSocLink === 'yes' ? this.socialVkButton() : null}
        {this.descriptionLast()}
        {this.form()}
      </div>) : null;

    return (!loading ?
      <div className='rieltor2-block'>{htmlData}</div> :
      <div className="r2-loader text-center">
        <i className="fa fa-spinner fa-spin" aria-hidden="true" />
      </div>);
  }
}

export default Rieltor2;
