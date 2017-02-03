/**
 * LK LKFavoritesDeletedItem component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import FavButton from '../../../shared/FavButton';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';

class LKFavoritesDeletedItem extends Component {
  static propTypes = {
    object: React.PropTypes.object,
    favorites: React.PropTypes.bool
  };
  constructor(props) {
    super(props);
  }

  render() {
    const {object} = this.props;
    const title = `Объект ${object.object_id}`;
    const favButton =
      (<FavButton
        key={object.class + object.object_id}
        className='btn-fav-insearchlayout'
        oclass={object.class}
        oid={object.object_id}
      />);

    return (
      <Col xs={12}>
        <div className='objects--item__nomap clearfix' ref={object.object_id}>
          <Col xs={9}>
            <div className='objects--item__nomap--title clearfix'>
              <h3 className='pull-left col-xs-8'>
                <span><b>{title}</b></span>
                {favButton}
              </h3>
            </div>
          </Col>
          <Col xs={3}>
            <div className='objects--item__nomap--content clearfix'>
              <div className='item--controls'>
                <span className='item--controls__more sold'>
                  Объект удален!!
                </span>
              </div>
            </div>
          </Col>
        </div>
      </Col>
    );
  }
}

export default LKFavoritesDeletedItem;