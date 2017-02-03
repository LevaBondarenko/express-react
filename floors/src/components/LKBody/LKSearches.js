/**
 * LK Searches component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, size, isEqual, assign, union} from 'lodash';
import HelpIcon from '../../shared/HelpIcon';
import LKSearchItem from '../LKBody/LKSearches/LKSearchItem';
import {getFromBack} from '../../utils/requestHelpers';
import createFragment from 'react-addons-create-fragment';
import ga from '../../utils/ga';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
/* global data */

class LKSearches extends Component {
  static propTypes = {
    searches: React.PropTypes.array,
    period: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.state = {
      colls: {city_id: data.collections.cities || {}}
    };
  }

  trackEvent = () => {
    ga('pageview', '/virtual/lk/podpiski');

    this.trackEvent = () => {};
  }

  componentWillReceiveProps(nextProps) {
    if(!nextProps.period) {
      window.location.hash = '#/searches/7';
    }
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps.period, this.props.period) ||
      !isEqual(nextProps.searches, this.props.searches);
  }

  componentDidMount() {
    const idsForCats = {};

    if(!this.props.period) {
      window.location.hash = '#/searches/7';
    }
    for(const i in this.props.searches) {
      if(this.props.searches[i]) {
        const model = this.props.searches[i].filter;

        if(size(model.trakt_id)) {
          idsForCats['trakt_id'] = size(idsForCats['trakt_id']) ?
            union(idsForCats['trakt_id'], model.trakt_id) :
            model.trakt_id;
        }
        if(size(model.district_id)) {
          idsForCats['district_id'] = size(idsForCats['district_id']) ?
          union(idsForCats['district_id'], model.district_id) :
          model.district_id;
        }
        if(size(model.street_id)) {
          idsForCats['street_id'] = size(idsForCats['street_id']) ?
          union(idsForCats['street_id'], model.street_id) :
          model.street_id;
        }
        if(size(model.builder_id)) {
          idsForCats['builder_id'] = size(idsForCats['builder_id']) ?
          union(idsForCats['builder_id'], model.builder_id) :
          model.builder_id;
        }
        if(size(model.newcomplex_id)) {
          idsForCats['newcomplex_id'] = size(idsForCats['newcomplex_id']) ?
          union(idsForCats['newcomplex_id'], model.newcomplex_id) :
          model.newcomplex_id;
        }
        if(size(model.furniture)) {
          idsForCats['furniture'] = size(idsForCats['furniture']) ?
          union(idsForCats['furniture'], model.furniture) :
          model.furniture;
        }
      }
    }
    if(size(idsForCats)) {
      getFromBack(
        assign({
          action: 'modular_search',
          subAction: 'catalogs'
        }, idsForCats),
        'get',
        '/msearcher_ajax.php'
      ).then(response => {
        this.setState(() => ({
          colls: assign(this.state.colls, response.catalogs)
        }));
      });
    }
  }

  render() {
    const {colls} = this.state;
    const period = parseInt(this.props.period) || 1;
    const startDate = (new Date((new Date()).getTime() - 86400000 * period))
      .toISOString().split('T')[0];
    let searchItems = map(this.props.searches, (search, key) => {
      return (
        <LKSearchItem
          key={key}
          search={search}
          period={startDate}
          colls={colls} />
      );
    });
    const periodSelector = (
      <div className='lkbody-toolbar-period'>
        <span>Показывать обновления за последний:&nbsp;</span>
        <span className='periods'>
          {map({1: 'день', 7: 'неделя', 30: 'месяц'}, (item, key) => {
            return (
              <a
                key={key}
                href={`#/searches/${key}`}
                className={period === parseInt(key) ? 'active' : null}>
                {item}
              </a>
            );
          })}
        </span>
      </div>
    );

    this.trackEvent();
    searchItems = size(searchItems) > 0 ?
      createFragment({searchItems: searchItems}) :
      createFragment({
        searchItems:
          <div className='notFound'>
            <p>У Вас нет подписок</p>
          </div>
      });

    return size(this.props.searches) ? (
      <div className='lkbody-searches'>
        <Row>
          <Col xs={6}>
            <div className='lkbody-pagetitle'>
              Подписки
              <HelpIcon
                placement='top'
                className='help-text-left'
                helpText={(
                  <span>
                    Следите за обновлениями и скидками по своему запросу. Во
                    время поиска недвижимости на сайте сохраняйте свой
                    поисковый запрос и получайте предложения со скидками!
                  </span>
                )}/>
            </div>
          </Col>
          <Col xs={6}>
            <div className='lkbody-toolbar'>
              {periodSelector}
            </div>
          </Col>
        </Row>
        <div className='lkbody-searches-wrapper'>
          {searchItems}
        </div>
      </div>
    ) : (
      <Row>
        <Col xs={12}>
          <div className='lkbody-searches'>
            <Row>
              <Col xs={2}>
                <div className='lkbody-pagetitle'>
                  Подписки
                  <HelpIcon
                    placement='top'
                    helpText='Это хелп для Подписок'/>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div className='lkbody-very-big-icon'>
                  <div className='main-icon'>
                    <i className='fa fa-search'/>
                    <div className='sub-icon'>
                     :(
                    </div>
                  </div>
                </div>
                <div className='text-center'>
                  У Вас пока нет подписок. Сохраняйте свой поисковый запрос
                  во<br/>время поиска недвижимости на сайте.
                </div>
              </Col>
            </Row>
            <Row className='lkbody-advantages'>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-home'/><br/>
                  <span>Узнавайте</span>
                </div>
                <span>первыми о новых объектах недвижимости</span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-bar-chart'/><br/>
                  <span>Будьте в курсе</span>
                </div>
                <span>Снижения цен на недвижимость</span>
              </Col>
              <Col xs={3} className='lkbody-advantages-item'>
                <div className='lkbody-advantages-item-title'>
                  <i className='fa fa-share-square-o'/><br/>
                  <span>Создавайте</span>
                </div>
                <span>несколько подписок для большого выбора</span>
              </Col>
            </Row>
            <div className='background-line text-center'><span>
              Чтобы создать подписку с расширенными параметрами -
              воспользуйтесь поиском на сайте
            </span></div>
          </div>
        </Col>
      </Row>
    );
  }
}


export default LKSearches;
