/**
 * LK Favorites Share component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {getFromBack} from '../../../utils/requestHelpers';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import WidgetsActions from '../../../actions/WidgetsActions';

class LKFavoritesShare extends Component {
  constructor(props) {
    super(props);
    this.getLink = this.getLink.bind(this);
    this.close = this.close.bind(this);
    this.closeClick = this.closeClick.bind(this);
    this.state = {
      show: false,
      link: ''
    };
  }

  getLink(newLink = false) {
    const data = {action: 'user_get_favorites_hash'};

    if(newLink) {
      data.new = 1;
    }
    getFromBack(data).then(
      response => {
        this.setState(() => ({
          link: `${window.location.protocol}//${window.location.host}/subsets/${response.data}` //eslint-disable-line max-len
        }));
      }
    );
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close);
  }

  toggleShow() {
    if(!this.state.show) {
      document.addEventListener('click', this.close);
    } else {
      document.removeEventListener('click', this.close);
    }
    if(!this.state.link.length) {
      this.getLink();
    }
    this.setState(() => ({show: !this.state.show}));
  }

  close(e) {
    let ancestor = e.target;

    while((ancestor = ancestor.parentElement) &&
          !ancestor.classList.contains('lk-popup')) {};
    if(!ancestor) {
      this.setState(() => ({show: false}));
      document.removeEventListener('click', this.close);
    }
  }

  closeClick() {
    this.setState(() => ({show: false}));
    document.removeEventListener('click', this.close);
  }

  copy() {
    ReactDOM.findDOMNode(this.refs.link).select();
    document.execCommand('copy');
    setTimeout(() => {
      this.closeClick();
    }, 1000);
    WidgetsActions.set('notify',[{
      msg: 'Ссылка скопирована в буфер обмена',
      type: 'info'
    }]);
  }

  newLink() {
    this.getLink(true);
  }

  render() {
    const {show, link} = this.state;

    return (
      <div>
        <Button
          bsStyle='default'
          bsSize='small'
          onClick={this.toggleShow.bind(this)}>
          <i className='fa fa-link' />
          <span> Отправить ссылку другу и посоветоваться</span>
        </Button>
        {show ?
          <div className='lk-popup'>
            <div className='lk-popup-header'>
              Скопируйте эту ссылку
            </div>
            <div className='lk-popup-comment'>
              и отправьте ее своим близким, чтобы они<br/>
              могли посмотреть Ваш список
            </div>
            <div className='objects--item__nomap--comment-text'>
              <textarea ref='link' readOnly rows={2} value={link} />
            </div>
            <div className='lk-popup-controls'>
              <Button
                bsStyle='link'
                bsSize='small'
                title='Старая станет не действительна!!!'
                onClick={this.newLink.bind(this)}>
                Новая ссылка
              </Button>
              <Button
                bsStyle='primary'
                bsSize='small'
                onClick={this.copy.bind(this)}>
                Скопировать
              </Button>
            </div>
          </div> : null
        }
      </div>
    );
  }
}

export default LKFavoritesShare;
