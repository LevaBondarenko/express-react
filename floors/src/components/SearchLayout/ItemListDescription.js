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

class ItemListDescription extends Component {
  static propTypes = {
    house: PropTypes.object.isRequired,
  };

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

    return (
        <Row>
          <Col xs={12} >
            {(house.district ?
              <p>Район: {house.district}</p> : null)}
            {(house.deadline === true ?
                <p>Дом сдан</p> : <p>{deadlineTitle}</p>)}
            {(house.trim > 0 ? <p>Готовность: {house.trim}%</p> : null)}
            <br/>
            {(house.walls && house.walls !== '0' ?
              <p>Материал стен: {house.walls}</p> : null)}
            {(house.builder ?
              <p>Застройщик: <a href={builderLink} target='_blank'>
              {house.builder}</a></p> : null)}
          </Col>
        </Row>
    );
  }
}

export default ItemListDescription;
