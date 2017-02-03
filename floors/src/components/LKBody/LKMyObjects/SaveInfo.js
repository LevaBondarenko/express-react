
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
import Row from 'react-bootstrap/lib/Row';

import Button from 'react-bootstrap/lib/Button';
import ga from '../../../utils/ga';


class SaveInfo extends Component {
  static propTypes = {
    handleChange: PropTypes.func,
    item: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      info: props.item ? props.item.info : ''
    };
  }


  changeInfo = (event) => {
    this.setState({
      info: event.target.value
    });
  };

  handleSave = (event) => {
    const {handleChange} = this.props;

    event.preventDefault();

    handleChange(false, {
      field: 'info',
      type: 'textarea',
      value: this.state.info
    }, true);
    ga('button', 'lk_myobjects_add_cohranit_opisanie');
  };

  render() {

    const {info} = this.state;

    return (
      <Row className='panelBox--collapsible__saveInfo'>
        <Col xs={9}>
          <textarea
            value={info || ''}
            rows={5}
            type='textarea'
            ref='info'
            name='info'
            data-field='info'
            data-type='info'
            className='form-control'
            onChange={this.changeInfo}
            placeholder='Опишите свою недвижимость подробно' />
        </Col>
        <Col xs={3}>
          <Button
            type='submit'
            onClick={this.handleSave}
            className='saveInfo-btn'>
            Сохранить описание
          </Button>
        </Col>
      </Row>
    );
  }
}

export default SaveInfo;
