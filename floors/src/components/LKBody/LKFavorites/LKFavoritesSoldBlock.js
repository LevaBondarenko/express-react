/**
 * LK Favorites Sold Block component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {declOfNum} from '../../../utils/Helpers';
/**
 * Bootstrap 3 elements
 */
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

class LKFavoritesSoldBlock extends Component {
  static propTypes = {
    soldCount: React.PropTypes.number,
    objsCount: React.PropTypes.number
  };
  constructor(props) {
    super(props);
    this.state = {
      soldCount: props.soldCount,
      objsCount: props.objsCount
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      soldCount: nextProps.soldCount,
      objsCount: nextProps.objsCount
    }));
  }

  render() {
    const {objsCount, soldCount} = this.state;
    const percSold = objsCount ? soldCount * 100 / objsCount | 0 : 0;
    const soldCountUnits = declOfNum(
      soldCount,
      ['объект недвижимости', 'объекта недвижимости', 'объектов недвижимости']
    );

    return (
      <Row className='lkbody-favorites-soldblock'>
        <Col xs={5}>
          <div className='clearfix'>
            <div className='lkbody-favorites-soldblock-count'>
              {soldCount}
            </div>
            <div className='lkbody-favorites-soldblock-title1'>
              {soldCountUnits}
            </div>
            <div className='lkbody-favorites-soldblock-title2'>
              уже купили из Вашего избранного
            </div>
          </div>
          <ProgressBar now={percSold} label='' />
        </Col>
        <Col xs={7}><div className='lkbody-favorites-soldblock-watchword'>
          <span>Оставляйте заявку на просмотр</span>
          <span> понравившейся квартиры прямо сейчас!</span>
        </div></Col>
      </Row>
    );
  }
}

export default LKFavoritesSoldBlock;
