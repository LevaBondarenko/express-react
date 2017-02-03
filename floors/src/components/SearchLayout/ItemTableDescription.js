/**
 * Searchform house component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Rating from '../../shared/Rating';

class ItemTableDescription extends Component {
  static propTypes = {
    house: PropTypes.object.isRequired,
    location: PropTypes.string,
    context: PropTypes.object
  };

  get location() {
    const {location} = this.props;

    return location ? (
      <Col xs={3} className='item--description clearfix'>
        <div className='item--controls'>
          <a href={location} className='item--controls__more'
          target='_blank'>Подробнее</a>
        </div>
      </Col>) : null;
  }

  render() {
    const {house} = this.props;
    const builderLink = `/zastr/builder/${house.builderSlug}`;

    let deadlineTitle;

    if (house.deadline_q &&
      house.deadline_y &&
      house.deadline_q !== '0') {
      deadlineTitle = `Срок сдачи ${house.deadline_q} кв. ${house.deadline_y}`;
    } else if(!house.deadline_q ||
      house.deadline_q === '0' &&
      house.deadline_y) {
      deadlineTitle = `Срок сдачи ${house.deadline_y} г.`;
    }

    const sectionKeys = Object.keys(house.flats);
    const ratings = house.flats[sectionKeys[0]][0].ratings;

    return (
        <div>
          <Col xs={9} className='item--description clearfix'>
            <Row>
              <Col xs={5} >
                {(house.district ?
                  <p>Район: {house.district}</p> : null)}
                {(house.deadline === true ?
                    <p>Дом сдан</p> : <p>{deadlineTitle}</p>)}
                {(house.trim > 0 ? <p>Готовность: {house.trim}%</p> : null)}
              </Col>
              <Col xs={6} >
                {(house.walls && house.walls !== '0' ?
                  <p>Стены: {house.walls}</p> : null)}
                {(house.builder ?
                  <p>Застройщик: <a href={builderLink} target='_blank'>
                  {house.builder}</a></p> : null)}
              </Col>
            </Row>
          </Col>
          <Col>
            <Rating id={house.id}
                    content={ratings}
                    condition={data.options.minRating} // eslint-disable-line
                    context={this.props.context}
                    showLink='1'
                    className='ratingLayout'
                    show={1} />
          </Col>
        </div>
    );
  }
}

export default ItemTableDescription;
