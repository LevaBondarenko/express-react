/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react';
import Helpers from '../../utils/Helpers';
import {reject, filter, clone} from 'lodash';
import Button from 'react-bootstrap/lib/Button';
import Modal, {Body} from 'react-bootstrap/lib/Modal';
import {sendOrder, getFromBack} from '../../utils/requestHelpers';
import withCondition from '../../decorators/withCondition';
import {findDOMNode} from 'react-dom';
import Image from '../../shared/Image';
import RieltorCloudContainer from './RieltorCloudContainer.js';
import RieltorCloudItem from './RieltorCloudItem.js';
import RieltorCloudActive from './RieltorCloudActive.js';

/* global data */

@withCondition()
class RieltorCloud extends Component {

  static defaultProps = {
    department: 'all',
    title: '',
    subtitle: 'Кликните по фотографии, чтобы узнать больше о сотруднике',
    leftBtnTitle: 'Начать сотрудничество',
    rightBtnTitle: 'Посмотреть всех риелторов',
    cityStore: 'selectedCity',
    showHref: '1'
  };

  static propTypes = {
    department: PropTypes.string,
    leftBtnTitle: PropTypes.string,
    rightBtnTitle: PropTypes.string,
    cityStore: PropTypes.string,
    defaultMottos: PropTypes.array,
    subtitle: PropTypes.string,
    title: PropTypes.string,
    showHref: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      order: {
        phone: ''
      },
      defaultMottos: props.defaultMottos,
      showModal: false,
      showHref: parseInt(props.showHref)
    };
  }

  get subtitle() {
    const {subtitle} = this.props;

    return (subtitle ? subtitle :
      'Кликните по фотографии, чтобы узнать больше о сотруднике');
  }
  get leftBtnTitle() {
    const {leftBtnTitle} = this.props;

    return leftBtnTitle ? leftBtnTitle : 'Начать сотрудничество';
  }
  get rightBtnTitle() {
    const {rightBtnTitle} = this.props;

    return rightBtnTitle ? rightBtnTitle : 'Посмотреть всех риелторов';
  }

  get title() {
    const {title} = this.props;

    return title ? title : `Наши риелторы готовы проконсультировать вас
    прямо сейчас`;
  }

  componentWillMount() {
    getFromBack({
      action: 'load_users',
      department: this.props.department,
      'city_id': data.options.cityId
    }, 'post', '/msearcher_ajax.php').then(response => {

      const {users, defaultMottos} = response;
      const activeUser = users[0];
      const defaultMotto = this.getRamdomMotto(defaultMottos);

      //wtf?
      if (!this.props.defaultMottos) {
        this.setState({
          defaultMottos: defaultMottos
        });
      }

      this.setState({
        activeUser: activeUser,
        order: {
          phone: ''
        },
        users: reject(users, u => parseInt(u.id) === parseInt(activeUser.id)),
        showModal: false,
        defaultMotto: defaultMotto
      });
    }, error => {
      console.log(`request error, status: ${error.err ? error.err.status : 'unknown'}`); //eslint-disable-line
    });
  }

  getRamdomMotto = (defaultMottos) => {
    const random = Math.floor(Math.random() * (defaultMottos.length));

    return defaultMottos[random];
  };

  close = event => {
    this.setState({showModal: false});

    event.preventDefault();
  }

  open = event => {
    this.setState({showModal: true});

    event.preventDefault();
  }

  handleChange = (event) => {
    const input = event.target;
    const value = {
      name: this.state.order.name,
      phone: this.state.order.phone
    };
    const fieldName = event.target.dataset.name;
    const fieldVal = event.target.value;

    if (input.dataset.name === 'phone') {
      value[fieldName] = Helpers.phoneFormatter(
        fieldVal,
        data.options.countryCode.current,
        data.options.countryCode.avail
      );
    } else {
      value[fieldName] = fieldVal;
    }

    this.setState(() => ({
      order: value
    }));
  }

  orderValid() {
    let phone = this.state.order.phone.replace(/\s+|\+|/g, '');

    phone = phone.replace(/^7/, '');
    return !!phone;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const orderValid = this.orderValid();

    if (orderValid) {
      const state = this.state;
      let strMessage = '';
      const order = state.order;

      strMessage += `Имя: ${order.name}, Телефон: ${order.phone}, Риелтор: ${state.activeUser.fio}`; // eslint-disable-line max-len

      const dataSend = {
        action: 'create_ticket',
        name: state.order.name,
        phone: state.order.phone,
        message: `${strMessage}${Helpers.getUtmParams()}`,
        source: 'Web',
        'city_id': data.options.cityId,
        'advanced_source': 'ticket_new_site',
        rieltor: state.activeUser.fio,
      };

      sendOrder(dataSend).then(response => {
        if (response.ajax.success) {
          let href = window.location.pathname.substr(1);

          href = href ? href.split('/')[0] : 'main';
          document.location.href = `${window.location.origin}/thank-you/?from=${href}`; // eslint-disable-line max-len
        }
      });
    } else {
      this.setState({
        error: {
          phone: true
        }
      });
    }

  }

  animateFade(user) {
    const el = findDOMNode(this.refs[`r_${user.id}`]);
    const active = findDOMNode(this.refs.activeRieltor);
    const isRight = el.className.indexOf('right') !== -1;

    el.className += !isRight ? ' setActive' : ' setActiveRight';
    active.className += ' zoomOut animated';
    return {
      el: el,
      active: active
    };
  }

  changeRieltor() {
    // через bind передаем риелтора в кач-ве параметра
    const user = arguments[0];
    let index; // нам нужно запомнить индекс риелтора в общем массиве
    let users = this.state.users;
    const self = this;

    const elements = this.animateFade(user);

    // исключаем из общего массива выбранного риелтора, но запоминаем его индекс
    users = reject(users, (u, idx) => {
      if (parseInt(user.id) === parseInt(u.id)) {
        index = idx;
        return true;
      }
    });
    // текущего риелтора (который по центру виджета) помещаем в массив на место предыдущего
    users.splice(index, 0, this.state.activeUser);

    // по завершению анимации нужно убрать лишние классы и пересохранить state
    setTimeout(() => {
      const el = elements.el;
      const state = this.state;
      const active = elements.active;
      const classesEl = el.className.split(' ');
      const classesActive = active.className.split(' ');
      const nativeClasses = filter(
        classesEl, c => c !== 'setActiveRight' && c !== 'setActive'
      );

      el.className = nativeClasses.join(' ');

      const nativeClassesActive = filter(
        classesActive, c => c !== 'zoomOut' && c !== 'animated'
      );

      active.className = nativeClassesActive.join(' ');

      const defaultMotto = this.getRamdomMotto(state.defaultMottos);

      self.setState(() => ({
        activeUser: user,
        users: users,
        defaultMotto: defaultMotto
      }));
    }, 450);
  }

  getSideBlock = (users, rightSide = false) => {
    return users.map((rieltor, key) => (
      <RieltorCloudItem
        key={`key_${rieltor.id}`}
        ref={`r_${rieltor.id}`}
        itemKey={key}
        positionRight={rightSide}
        rieltor={rieltor}
        onClick={this.changeRieltor.bind(this, rieltor)} />
    ));
  }

  splitUsers = () => {
    const users = clone(this.state.users);

    const leftSide = users.splice(0, Math.ceil(users.length) / 2);
    const rightSide = users;

    return {
      leftSide: leftSide,
      rightSide: rightSide
    };
  };

  render() {

    if (!this.state.users || !this.state.activeUser) {
      return (
        <div />
      );
    }

    const {defaultMotto, activeUser, showHref, error, order} = this.state;
    const {leftSide, rightSide} = this.splitUsers();
    const errorPhone = error ? error.phone : false;

    const activeUserPhoto = {
      image: activeUser.photo,
      visual: 'profile',
      width: 160,
      height: 160
    };

    return (
      <div className='rieltorCloudWrapper'>
        <RieltorCloudContainer title={this.title} subtitle={this.subtitle}>
          <RieltorCloudActive
            ref='activeRieltor'
            activeUser={activeUser}
            defaultMotto={defaultMotto}
            onClick={this.open}
            showHref={showHref} />
            <div className='rieltorCloud_footer'>
              <div className='rieltorCloud_buttons'
                style={showHref ? null : {textAlign: 'center'}}>
                <Button
                  ref='openOrder'
                  className='rieltorCloud_button rieltorCloud_button__order'
                  onClick={this.open}>
                  {this.leftBtnTitle}
                </Button>
                {
                showHref ?
                <a href='/agents/'
                   className='rieltorCloud_button rieltorCloud_button__showAll'>
                  {this.rightBtnTitle}
                </a> : null
                }
                <Modal
                  show={this.state.showModal}
                  className='main_page_order_modal'
                  onHide={this.close}
                  bsSize='small'>
                  <Body>
                    <div
                      className='rieltorCloud_modalClose'
                      onClick={this.close}>
                    </div>
                    <div className='rieltorCloud_modalPhoto'>
                      <Image {...activeUserPhoto} alt={activeUser.fio}/>
                    </div>
                    <div className='rieltorCloud_modalTitle'>
                      Оставьте ваши контакты и я перезвоню
                    </div>
                    <div className='rieltorCloud_modalForm'>
                      <form action='' onSubmit={this.handleSubmit}>
                        <div className='rieltorCloud_formGroup'>
                          <input
                            type='text'
                            data-name='name'
                            className='rieltorCloud_input'
                            value={order.name}
                            placeholder='Ваше имя'
                            onChange={this.handleChange}
                          />
                        </div>
                        <div className='rieltorCloud_formGroup'>
                          <input
                            type='text'
                            data-name='phone'
                            value={order.phone}
                            className={`rieltorCloud_input
                             ${(errorPhone ? ' error' : '')}`}
                            onChange={this.handleChange}
                            placeholder='Телефон'
                            />
                        </div>
                        <div className='rieltorCloud_formGroup'>
                          <input
                            type='submit'
                            className='rieltorCloud_submit'
                            value={this.leftBtnTitle}
                            />
                        </div>
                        {
                        showHref ?
                        <div className='rieltorCloud_formGroup
                          rieltorCloud_activeRieltorContactValue'>
                          <a
                            target='_blank'
                            href={`/agents/?show_person&id=${activeUser.id}`}
                            className='rieltorCloud_allObjectsLink'>
                            посмотреть все объекты
                          </a>
                        </div> : null
                        }
                      </form>
                    </div>
                  </Body>
                </Modal>
              </div>
            </div>
          {this.getSideBlock(leftSide)}
          {this.getSideBlock(rightSide, true)}
        </RieltorCloudContainer>
      </div>
    );
  }
}

export default RieltorCloud;
