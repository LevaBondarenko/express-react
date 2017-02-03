/**
 * Shared FavButton Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import ga from '../utils/ga';
/**
 * React/Flux entities
 */
import userStore from '../stores/UserStore';
import UserActions from '../actions/UserActions';
import WidgetsActions from '../actions/WidgetsActions';

const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
const ModalFooter = Modal.Footer;

class FavButton extends Component {
  static propTypes = {
    oid: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.string,
    ]),
    oclass: React.PropTypes.string,
    style: React.PropTypes.object,
    className: React.PropTypes.string,
    needConfirm: React.PropTypes.bool,
    withTitle: React.PropTypes.bool,
    titles: React.PropTypes.array,
  };
  static defaultProps = {
    style: null,
    className: null,
    needConfirm: false,
    withTitle: false,
    titles: [' В избранном', ' В избранное']
  };
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
  }

  componentWillMount() {
    this.onChange();
  }

  componentDidMount() {
    userStore.onChange(this.onChange);
  }

  componentWillUnmount() {
    userStore.offChange(this.onChange);
  }

  onChange = () => {
    this.setState(() => ({
      inFavorites: UserActions.inFavorite(this.props.oid, this.props.oclass)
    }));
  }

  toggle() {
    if(userStore.get('isAuthorized')) {
      if(!this.state.inFavorites || !this.props.needConfirm ||
        this.state.show) {

        // google analytics event
        /* global data */
        ga('button', data.object && data.object.info ?
          'site_favorites_object_add' :
          'site_favorites_search_card_add');

        const notifyBlock =
          (
            <div>
              <div className='notify-header'>Избранное</div>
              <div className='notify-body'>
                <span>Объект </span>
                <span><b>{this.props.oid}</b></span><br/>
                <span>
                  {(this.state.inFavorites ?
                    'удален из избранного' : 'добавлен в избранное')}.
                </span><br/>
                <a className='notify-link' href='/my/#/favorites/'>
                  Перейти к избранному
                </a>
              </div>
            </div>
          );

        WidgetsActions.set('notify',[{
          msg: notifyBlock,
          type: 'custom',
          time: 15
        }]);
        UserActions.updateFavorites(
          this.state.inFavorites ? 'del' : 'add',
          this.props.oid,
          this.props.oclass,
          {subscribe: 1}
        );
      } else {
        // google analytics event
        ga('button', data.object && data.object.info ?
          'site_favorites_object_delete' :
          'site_favorites_search_card_delete');
        this.setState(() => ({show: true}));
      }
    } else {
      const invite = userStore.get('invite');

      WidgetsActions.set('notify',[{
        msg: 'Для добавления объекта в избранное Вы должны быть авторизованы',
        type: 'info'
      }]);
      if(invite.enabled) {
        UserActions.showInvite();
      } else {
        UserActions.showLogin();
      }
    }
  }

  close() {
    this.setState(() => ({show: false}));
  }

  render() {
    const {inFavorites, show} = this.state;
    let modeClass = inFavorites ? 'btn-fav toggle in-fav ' : 'btn-fav toggle ';
    const style = this.props.style;
    const title = inFavorites ?
      'Удалить из избранного' : 'Добавить в избранное';

    if(this.props.className) {
      modeClass += this.props.className;
    }
    return (
      <div className={modeClass} style={style}>
        <Button
          title={title}
          bsStyle='default'
          bsSize='large'
          onClick={this.toggle.bind(this)}>
            <i className={inFavorites ? 'fa fa-heart' : 'fa fa-heart-o'} />
            {this.props.withTitle ?
              (inFavorites ?
                <span> В избранном</span> :
                <span> В избранное</span>) :
              null}
        </Button>
        {show ?
          <Modal
            className='lkform'
            show={show}
            onHide={this.close.bind(this)}>
              <ModalHeader closeButton></ModalHeader>
              <ModalBody>
                <div
                  className="auth-form form-horizontal lkform-compose">
                  <Row>
                    <Col xs={12}>
                      <Row className='lkform-header'>
                        <Col xs={12} className='lkform-header-title'>
                          <span>Удалить объект из избранного?</span>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <Button
                        bsStyle='danger'
                        onClick={this.close.bind(this)}>
                        Нет, я случайно!
                      </Button>
                      <Button
                        bsStyle='default'
                        onClick={this.toggle.bind(this)}>
                        Да, удалить
                      </Button>
                    </Col>
                  </Row>
                </div>
              </ModalBody>
              <ModalFooter>
              </ModalFooter>
          </Modal> : null
        }
      </div>
    );
  }
}

export default FavButton;
