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
import {each, filter, sortBy, size, map} from 'lodash';
import Table from 'react-bootstrap/lib/Table';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';

class HouseTableNew extends Component {
  static propTypes = {
    flats: PropTypes.object.isRequired,
    location: PropTypes.string
  };

  render() {
    const {location} = this.props;

    const flats = {};

    each(this.props.flats, (flatsByRooms, room) => {
      const places = [];

      flats[room] = filter(flatsByRooms, (flat) => {
        const idx = `${flat.floor}${flat.section}${flat.rooms}
          ${flat.floors}${flat.on_floor}`;

        if (places.indexOf(idx) === -1) {
          places.push(idx);
          return true;
        }
        return false;
      });
    });


    const dataTable = map(flats, (flat, roomsCnt) => {
      flat = filter(flat, item => parseInt(item.price) !== 0);

      if (flat.length > 0) {
        // так быстрее
        flat = sortBy(flat, f => parseInt(f.price));

        const minPrice = flat[0].price;

        flat = sortBy(flat, f => parseInt(f.square));

        const minArea = flat[0].square;

        return (
          <tr key={roomsCnt}>
            <td>{roomsCnt}-комн от {minArea} м²</td>
            <td>от <Price price={minPrice}/> <PriceUnit/></td>
            <td>
              <a href={location} target='_blank'>{size(flat)} в продаже</a>
            </td>
          </tr>
        );
      }

    });

    return (
      <Row>
        <Col xs={12} className='item--flatstable__new'>
          <Table responsive>
              <tbody>
                {dataTable}
              </tbody>
            </Table>
        </Col>
      </Row>
    );
  }
}

export default HouseTableNew;
