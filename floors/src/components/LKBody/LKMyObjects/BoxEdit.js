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

import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

class BoxEdit extends Component {
  static propTypes = {
    className: PropTypes.string,
    percent: PropTypes.number,
    id: PropTypes.number
  };

  constructor(props) {
    super(props);
  }

  edit() {
    const {id} = this.props;

    window.location.href = `#/myobjects/${id}/edit`;
  }

  render() {
    const {percent} = this.props;

    return (
      <Col xs={4} className={this.props.className}>
        <div className='boxEdit--wrap'>
          <div className='boxEdit--wrap__completness'>
            <span className='value'>{percent}</span>
            <span className='percent'>%</span>
            <span className='fa fa-home fa-3x' />
          </div>
          <div className='boxEdit--wrap__progress'>
            <ProgressBar striped
              bsStyle='info'
              className='lkobjects--progress'
              now={percent}
              label={`${percent}%`}/>
          </div>
          <div className='boxEdit--wrap__body clearfix'>
            По статистике, заполненность объекта более 90%
            увеличивает скорость продажи в 2,4 раза
          </div>
          <div className='text-center completeFill--wrap'>
            <Button bsStyle='success'
              onClick={this.edit.bind(this)}>
              Редактировать объект
            </Button>
          </div>
        </div>
      </Col>
    );
  }
}

export default BoxEdit;
