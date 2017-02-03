/**
 * LKWidgetFavorites component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {size} from 'lodash';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

class LKWidgetFavorites extends Component {
  static propTypes = {
    favorites: React.PropTypes.array,
    user: React.PropTypes.object
  };
  constructor(props) {
    super(props);
  }

  gotoFavorites() {
    window.location.hash = '#/favorites/';
  }

  render() {
    const favCount = size(this.props.favorites);
    const favChanged = 0;
    const block = favCount ?
      (<div>
        <Row>
          <Col xs={6} className='lkbody-widget-value important'>
            {favCount}
          </Col>
          <Col xs={6} className='lkbody-widget-text'>
            Сохраненных объектов недвижимости
          </Col>
        </Row>
        <Row>
          <Col xs={6} className='lkbody-widget-value'>
            {favChanged}
          </Col>
          <Col xs={6} className='lkbody-widget-text'>
            Важных изменений
          </Col>
        </Row>
        <div className='lkbody-widget-controls'>
          <Button
            bsStyle='link'
            bsSize='small'
            onClick={this.gotoFavorites.bind(this)}>
            <span>Посмотреть изменения </span>
            <i className='fa fa-angle-double-down' />
          </Button>
        </div>
      </div>) :
      (<div>
        <div className='lkbody-widget-info'>
          Сохраняйте понравившиеся объекты в избранное. Вы будете в курсе
          скидок и обновлений по этим объектам.
        </div>
        <div className='lkbody-widget-controls'>
          <Button
            href='/realty/'
            bsStyle='link'
            bsSize='small'>
            <span>Начать поиск </span>
            <i className='fa fa-arrow-right' />
          </Button>
        </div>
      </div>);

    return block;
  }
}

export default LKWidgetFavorites;
