/**
 * Shared FavCommentButton Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import FavCommentBlock from '../shared/FavCommentBlock';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
/**
 * React/Flux entities
 */
import userStore from '../stores/UserStore';

class FavCommentButton extends Component {
  static propTypes = {
    oid: React.PropTypes.number,
    oclass: React.PropTypes.string,
    style: React.PropTypes.object,
    className: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.close = this.close.bind(this);
    this.state = {
      show: false,
      comment: ''
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
    document.removeEventListener('click', this.close);
  }

  onChange() {
    const favorites = userStore.get('favorites');
    let object = '';

    for(const i in favorites) {
      if(favorites[i] &&
        favorites[i].id === parseInt(this.props.oid) &&
        favorites[i].class === this.props.oclass) {
        object = favorites[i];
        break;
      }
    }
    this.setState(() => ({
      object: object
    }));
  }

  toggle() {
    if(!this.state.show) {
      document.addEventListener('click', this.close);
    } else {
      document.removeEventListener('click', this.close);
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

  render() {
    const {object, show} = this.state;
    let modeClass = 'btn-fav tools ';
    const style = this.props.style;
    const title = 'Ввести комментарий';

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
            <Glyphicon glyph='pencil'/>
        </Button>
        {show ?
          <div className='lk-popup'>
            <div className='lk-popup-header'>
              Введите текст заметки
            </div>
            <div className='lk-popup-comment'>
              Кроме Вас ее никто не прочитает
            </div>
            <Row>
              <FavCommentBlock
                object={object}
                className='no-back'
                initialEdit={true} />
            </Row>
          </div> : null
        }
      </div>
    );
  }
}

export default FavCommentButton;
