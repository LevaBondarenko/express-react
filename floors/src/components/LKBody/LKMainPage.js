/**
 * LK MainMage component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, size} from 'lodash';
import classNames from 'classnames';
import LKSurvey from '../LKBody/LKSurvey';
import LKContactsValidation from '../LKBody/LKContactsValidation';
import LKMessages from '../LKBody/LKMessages';
import LKManager from '../LKManager/LKManager';
import LKWidgetFavorites from '../LKBody/LKWidgetFavorites';
import LKWidgetSearches from '../LKBody/LKWidgetSearches';
import LKWidgetAuctions from '../LKBody/LKWidgetAuctions';
import LKWidgetIntegrity from '../LKBody/LKWidgetIntegrity';
import ga from '../../utils/ga';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions'; // eslint-disable-line no-unused-vars
/* global data */ // eslint-disable-line no-unused-vars

class LKMainPage extends Component {
  static propTypes = {
    surveyType: React.PropTypes.string,
    user: React.PropTypes.object,
    meta: React.PropTypes.object,
    messages: React.PropTypes.array,
    modules: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array
    ]),
  };
  constructor(props) {
    super(props);
  }

  trackEvent = () => {
    ga('pageview', '/virtual/lk/main');

    this.trackEvent = () => {};
  }

  render() {
    const {meta, messages, modules, surveyType} = this.props;
    const surveyBlock = surveyType === '1' ?
      <LKContactsValidation {...this.props} {...this.state} /> :
      <LKSurvey {...this.props} {...this.state} />;
    const secondBlock = size(messages) ?
      (<div>
        <div className='lkbody-pagetitle'>
          Последние уведомления
        </div>
        <LKMessages trackEvent={false}
        mode='last' {...this.props} {...this.state}/>
      </div>) : <LKWidgetIntegrity {...this.props} />;
    const widgets = meta.widgets ? meta.widgets.split(',') :
      ['favorites', 'searches', 'myauctions'];

    this.trackEvent();
    const widgetsBlock = map(widgets, widget => {
      let widgetContent = null;


      switch(widget) {
      case 'favorites' :
        widgetContent = <LKWidgetFavorites {...this.props}/>;
        break;
      case 'searches' :
        widgetContent = <LKWidgetSearches {...this.props}/>;
        break;
      case 'myauctions' :
        widgetContent = <LKWidgetAuctions {...this.props}/>;
        break;
      default :
        widgetContent = <div>Widget Loading</div>;
      }
      return(
        <Col key={widget} xs={4} className='lkbody-widget'>
          <div>
            <div className='lkbody-widget-title'>
              <a href={`#/${widget}/`}>
                <i className={classNames(
                  'fa',
                  modules[widget] ? modules[widget].glyph : ''
                )} />
              </a>
              {modules[widget] ? modules[widget].title : ''}
            </div>
            {widgetContent}
          </div>
        </Col>
      );
    });

    return (
      <div className='lkbody-mainpage'>
        <Row>
          <Col xs={10} className='lkbody-mainblock'>
            {surveyBlock}
            {secondBlock}
            <Row>
              {widgetsBlock}
            </Row>
          </Col>
          <Col xs={2} className='lkbody-sideblock'>
            <LKManager/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default LKMainPage;
