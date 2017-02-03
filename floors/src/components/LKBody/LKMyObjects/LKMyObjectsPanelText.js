/**
 * LK Salesman component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';

class LKMyObjectsPanelText extends Component {
  static propTypes = {
    handleShowFields: PropTypes.func,
    percent: PropTypes.number
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {handleShowFields, percent} = this.props;

    return (
      <div className='panelBox clearfix'>
        <Col xs={4}>
          <Row>
            <Col xs={3}>
              <i className='icon-completePercent' />
            </Col>
            <Col xs={9}>
              Вы заполнили на {percent}%. Заполните больше информации об объекте
            </Col>
          </Row>
        </Col>
        <Col xs={5}>
          <Row>
            <Col xs={3}>
              <i className='icon-morePercent' />
            </Col>
            <Col xs={9}>
              Заполненность объекта более 90%
              увеличивает скорость продажи в 2,4 раза
            </Col>
          </Row>
        </Col>
        <Col xs={3}>
          <Row>
            <Col xs={3}>
              <i className='icon-housePercent' />
            </Col>
            <Col xs={9}>
              Расскажите больше о вашем объекте
            </Col>
          </Row>
        </Col>
        <Col xs={12} className='text-center completeFill--wrap'>
          <Button bsStyle='success'
            onClick={handleShowFields}>
            Заполнить на 100%
          </Button>
        </Col>
      </div>
    );
  }
}

export default LKMyObjectsPanelText;
