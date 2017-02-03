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
import {simulateClick} from '../core/DOMUtils';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import UserActions from '../actions/UserActions';
import WidgetsActions from '../actions/WidgetsActions';

class FavCommentBlock extends Component {
  static propTypes = {
    object: React.PropTypes.object,
    className: React.PropTypes.string,
    initialEdit: React.PropTypes.bool,
    onEditStateChange: React.PropTypes.func
  };
  static defaultProps = {
    initialEdit: false
  };
  constructor(props) {
    super(props);
    this.state = {
      edit: props.initialEdit,
      comment: props.object.comment ? props.object.comment : ''
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      comment: nextProps.object.comment ? nextProps.object.comment : ''
    }));
  }

  save() {
    const {comment, edit} = this.state;
    const {object} = this.props;
    const {id} = object;
    const oclass = object.class;

    if(edit) {
      const notifyBlock =
        (
          <div>
            <div className='notify-header'>Заметка изменена</div>
            <div className='notify-body'>
              <span>Заметка для объекта </span>
              <span><b>{this.props.object.id}</b></span><br/>
              <span>сохранена.</span><br/>
            </div>
          </div>
        );

      WidgetsActions.set('notify',[{
        msg: notifyBlock,
        type: 'custom',
        time: 10
      }]);
      object.comment = comment;
      this.setState(() => ({edit: false}));
      this.props.onEditStateChange(false);
      UserActions.updateFavorites('add', id, oclass, object);
    } else {
      this.setState(() => ({edit: true}));
      this.props.onEditStateChange(true);
      setTimeout(() => {
        ReactDOM.findDOMNode(this.refs.editor).focus();
      }, 100);
    }
    simulateClick();
  }

  remove() {
    const {edit} = this.state;
    const {object} = this.props;
    const {id} = object;
    const oclass = object.class;

    if(edit) {
      this.setState(() => ({edit: false, comment: this.props.object.comment}));
      this.props.onEditStateChange(false);
    } else {
      const notifyBlock =
        (
          <div>
            <div className='notify-header'>Заметка удалена</div>
            <div className='notify-body'>
              <span>Заметка для объекта </span>
              <span><b>{this.props.object.id}</b></span><br/>
              <span>удалена.</span><br/>
            </div>
          </div>
        );

      WidgetsActions.set('notify',[{
        msg: notifyBlock,
        type: 'custom',
        time: 10
      }]);
      object.comment = '';
      UserActions.updateFavorites('add', id, oclass, object);
    }
    simulateClick();
  }

  handleChange(e) {
    const value = e.target.value;

    this.setState(() => ({comment: value}));
  }

  render() {
    const {comment, edit} = this.state;

    return (
      <div className={classNames(
          'objects--item__nomap--comment',
          this.props.className
        )}>
        <div className='objects--item__nomap--comment-text'>
          {edit ?
            <textarea
              ref='editor'
              placeholder='Введите текст'
              rows={2}
              value={comment}
              onChange={this.handleChange.bind(this)} /> :
            (comment.length ?
              <span onClick={this.save.bind(this)}>{comment}</span> :
              <span className='empty-comment' onClick={this.save.bind(this)}>
                Добавьте заметку. Кроме Вас и тех, кому Вы можете отправить
                эту подборку, заметку никто не увидит.
              </span>
            )}
        </div>
        <div className='objects--item__nomap--comment-controls'>
          <Button
            bsStyle='link'
            bsSize='small'
            style={{display: !comment.length && !edit ? 'none' : null}}
            onClick={this.remove.bind(this)}>
            {edit ? 'Отменить' : 'Удалить'}
          </Button>
          <Button
            className='btn-gray'
            bsSize='small'
            onClick={this.save.bind(this)}>
            {edit ? 'Сохранить' :
              (comment.length ? 'Редактировать' : 'Добавить')}
          </Button>
        </div>
      </div>
    );
  }
}

export default FavCommentBlock;
