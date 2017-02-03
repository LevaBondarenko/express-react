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
import Panel from 'react-bootstrap/lib/Panel';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import ga from '../../../utils/ga';

class PanelBox extends Component {
  static propTypes = {
    percent: PropTypes.number,
    title: PropTypes.string,
    type: PropTypes.string,
    decription: PropTypes.string,
    boxtype: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.node
    ]),
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  toggleCollapse = () => {
    const {type} = this.props;

    this.setState({
      open: !this.state.open
    });

    switch (type) {
    case 'photos':
      ga('button', 'lk_myobjects_add_kvartira_svernyt/razvernyt_foto');
      break;
    case 'layouts':
      ga('button', 'lk_myobjects_add_kvartira_svernyt/razvernyt_planirovky');
      break;
    default:
      ga('button', 'lk_myobjects_add_kvartira_svernyt/razvernyt_opisanie');
      break;;
    }
  };

  handleClick = (event) => {
    const {type} = this.props;
    const input = document.getElementById(type);

    this.setState({
      open: true
    });
    input.click();
    event.preventDefault();

    switch (type) {
    case 'photos':
      ga('button', 'lk_myobjects_add_kvartira_zagruzit_foto');
      break;
    case 'layouts':
      ga('button', 'lk_myobjects_add_zagrusit_planirovky');
      break;
    default:
      ga('button', 'lk_myobjects_add_kvartira_zagruzit_foto');
      break;;
    }
  };

  get boxMarkup() {
    const {title, decription, boxtype} = this.props;
    const {open} = this.state;
    let content;

    if(boxtype === 'upload') {
      content = (
        <Row>
          <Col xs={6}>
            <div className='panelBox--description'>
              <h3>{title}</h3>
              <p>{decription}</p>
            </div>
          </Col>
          <Col xs={4}>
            <div className='panelBox--controls'>
              <Button
                className='panelBox--controls__upload'
                onClick={this.handleClick} >
                 Загрузить файл
              </Button>
            </div>
          </Col>
          <Col xs={2}>
            <Button className='panelBox--collapse'
              onClick={this.toggleCollapse}>
              {(open ?
                <span>Свернуть <Glyphicon glyph="triangle-top" /></span> :
                <span>Развернуть <Glyphicon glyph="triangle-bottom" /></span>
              )}
            </Button>
          </Col>
        </Row>
      );
    } else {
      content = (
        <Row>
          <Col xs={10}>
            <div className='panelBox--description'>
              <h3>{title}</h3>
              <p>{decription}</p>
            </div>
          </Col>
          <Col xs={2}>
            <Button className='panelBox--collapse'
              onClick={this.toggleCollapse}>
              {(open ?
                <span>Свернуть <Glyphicon glyph="triangle-top" /></span> :
                <span>Развернуть <Glyphicon glyph="triangle-bottom" /></span>
              )}
            </Button>
          </Col>
        </Row>
      );
    }

    /*
      или
      <Button className='panelBox--controls__order'>
         Заказать фотографирование бесплатно
      </Button>
    */
    return content;
  }

  render() {
    const {open} = this.state;
    const {percent, children} = this.props;

    return (
      <div className='panelBox clearfix noPadding'>
        <Row>
          <Col xs={2}>
            <div className='panelBox--percent'>
              +{percent}%
            </div>
          </Col>
          <Col xs={10}>
            {this.boxMarkup}
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Panel
              className='panelBox--collapsible'
              collapsible expanded={open}>
              {children}
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}

export default PanelBox;
