/**
 * LKWidgetSearches component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {size, clone} from 'lodash';
import {getObjects} from '../../utils/requestHelpers';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

class LKWidgetSearches extends Component {
  static propTypes = {
    searches: React.PropTypes.array,
    user: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    this.getCounts = this.getCounts.bind(this);
    this.getObjects = this.getObjects.bind(this);
    this.state = {
      objUpdated: 0,
      objAdded: 0
    };
    this.getCounts(props);
  }

  componentWillReceiveProps(nextProps) {
    if(size(nextProps.searches) !== size(this.props.searches)) {
      this.getCounts(nextProps);
    }
  }

  getCounts(props) {
    const {searches} = props;
    const period = 1;
    const startDate = (new Date((new Date()).getTime() - 86400000 * period))
      .toISOString().split('T')[0];

    for(const i in searches) {
      if(searches[i]) {
        const model = clone(searches[i].filter);

        model.class = searches[i].class;
        model.date_create_min = startDate;
        this.getObjects(model, 'objAdded');
        model.date_create_min = null;
        model.date_update_min = startDate;
        this.getObjects(model, 'objUpdated');
      }
    }
  }

  getObjects(model, counter) {
    getObjects(model, ['price']).then(response => {
      const {count} = response.aggregates[0];

      this.setState(() => ({
        [counter]: this.state[counter] + parseInt(count)
      }));
    });
  }

  gotoSearches() {
    window.location.hash = '#/searches/';
  }

  render() {
    const {objUpdated, objAdded} = this.state;
    const {searches} = this.props;

    const block = size(searches) ?
      (<div>
        <Row>
          <Col xs={6} className='lkbody-widget-value important'>
            {objUpdated}
          </Col>
          <Col xs={6} className='lkbody-widget-text'>
            Обновилось объектов недвижимости
          </Col>
        </Row>
        <Row>
          <Col xs={6} className='lkbody-widget-value'>
            {objAdded}
          </Col>
          <Col xs={6} className='lkbody-widget-text'>
            Новых объектов недвижимости
          </Col>
        </Row>
        <div className='lkbody-widget-controls'>
          <Button
            bsStyle='link'
            bsSize='small'
            onClick={this.gotoSearches.bind(this)}>
            <span>Посмотреть обновления </span>
            <i className='fa fa-angle-double-down' />
          </Button>
        </div>
      </div>) :
      (<div>
        <div className='lkbody-widget-info'>
          Отслеживайте обновления и скидки по своим запросам.
          Сохраняйте свои поисковые запросы и получайте предложения со скидками.
        </div>
        <div className='lkbody-widget-controls'>
          <Button
            href='/realty/'
            bsStyle='link'
            bsSize='small'>
            <span>Создать подписку </span>
            <i className='fa fa-arrow-right' />
          </Button>
        </div>
      </div>);

    return block;
  }
}

export default LKWidgetSearches;
