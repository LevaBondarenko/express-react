/**
 * LK Review Thumbs component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, size, reject} from 'lodash';
import {getTitle} from '../../../utils/Helpers';
import {getApiMediaUrl} from '../../../utils/mediaHelpers';
import createFragment from 'react-addons-create-fragment';

/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';
/* global data */

class LKReviewThumbs extends Component {
  static propTypes = {
    forReview: React.PropTypes.array,
    objects: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    this.state = {
      forReview: props.forReview,
      objects: props.objects
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      forReview: nextProps.forReview,
      objects: nextProps.objects
    }));
  }

  remove(e) {
    const {oclass, id} = e.target.dataset;
    let {forReview} = this.state;
    const notifyBlock =
      (
        <div>
          <div className='notify-header'>Запись на просмотр</div>
          <div className='notify-body'>
            <span>Объект </span>
            <span><b>{id}</b></span><br/>
            <span>удален из списока объектов на просмотр</span><br/>
            <span>
              Для отправки заявки на просмотр, после выбора всех интересующих
              Вас объектов, нажмите кнопку "Записаться на просмотр", в
              правом нижнем блоке
            </span>
          </div>
        </div>
      );

    WidgetsActions.set('notify',[{
      msg: notifyBlock,
      type: 'custom',
      time: 30
    }]);
    forReview = reject(forReview, item => {
      return item.id === parseInt(id) && item.class === oclass;
    });
    UserActions.set(null, {forReview: forReview});
  }

  render() {
    const {forReview, objects} = this.state;

    let thumbsBlock = map(forReview, item => {
      const object = objects[item.class] ? objects[item.class][item.id] : {};
      const mainPhotoType = object.visual === 'layout' ? 'layouts' : 'photos';
      const title = getTitle(object.rooms, object.type_ru);
      const photo = (!object.main_photo || object.main_photo === '0' ||
        object.main_photo === null) ?
        getApiMediaUrl(
        'content',
        'no_photo',
        'photos.png',
        data.options.mediaSource) :
        getApiMediaUrl(
          '300267',
          mainPhotoType,
          object.main_photo,
          data.options.mediaSource);

      return(
        <div
          key={`${item.class}${item.id}`}
          className='lkbody-forreview-thumbs-item'
          title={title}>
          <img src={photo}/>
          <span
            data-id={item.id}
            data-oclass={item.class}
            onClick={this.remove.bind(this)}
            title='Удалить из списка на просмотр'
            className='lkbody-forreview-thumbs-item-remove'>
            &times;
          </span>
        </div>
      );
    });

    thumbsBlock = createFragment({thumbsBlock: thumbsBlock});

    return (
      <div>
        {size(forReview) ? (
          <div className='lkbody-forreview-thumbs-title'>
            Вы выбрали:
          </div>
        ) : null}
        {thumbsBlock}
      </div>
    );
  }
}

export default LKReviewThumbs;
