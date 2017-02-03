/**
 * LKBid component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {size, map} from 'lodash';
import classNames from 'classnames';
import {getFromBack} from '../../utils/requestHelpers';
import createFragment from 'react-addons-create-fragment';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions'; // eslint-disable-line no-unused-vars

/* global data */

class LKHelp extends Component {
  static propTypes = {
    close: React.PropTypes.func,
    show: React.PropTypes.bool
  };
  constructor(props) {
    super(props);
    this.getSlides = this.getSlides.bind(this);
    this.state = {
      slides: [],
      current: 0,
      attempt: 2
    };
  }

  componentDidMount() {
    const page = `${window.location.pathname}${window.location.hash}`;

    this.getSlides(page);
  }

  getSlides(page) {
    getFromBack({
      action: 'get_help_slides',
      page: page
    }).then(response => {
      if(response && response.success) {
        this.setSlides(response, page);
      }
    });
  }

  setSlides(response, page) {
    const {attempt} = this.state;

    if(size(response.slides)) {
      this.setState(() => ({slides: response.slides}));
    } else if(attempt > 0) {
      page = page.replace(/\w+[\/]*$/i, '');
      this.getSlides(page);
      this.setState(() => ({attempt: attempt - 1}));
    }
  }

  next() {
    const {slides} = this.state;
    let {current} = this.state;

    current++;
    if(size(slides) <= current) {
      current = 0;
    }
    this.setState(() => ({current: current}));
  }

  prev() {
    const {slides} = this.state;
    let {current} = this.state;

    current--;
    if(current < 0) {
      current = size(slides) - 1;
    }
    this.setState(() => ({current: current}));
  }

  gotoSlide(e) {
    const {slide} = e.target.dataset;

    this.setState(() => ({current: parseInt(slide)}));
  }

  get slideImageUrl() {
    const {slides, current} = this.state;
    const slide = slides[current];

    return slide.filename.replace(/pics2.etagi.com\/original\//,
      data.options.mediaSlider === 2 ?
        'cdn-media.etagi.com/static/' : 'api-media.etagi.com/static/');
  }

  render() {
    const {slides, current} = this.state;
    const slide = slides[current];
    let pagination = map(slides, (slide, key) => {
      return(
        <span
          key={key}
          data-slide={key}
          className={classNames(
            'lkform-help-pagination-item',
            {'active': parseInt(key) === current}
          )}
          onClick={this.gotoSlide.bind(this)}/>
      );
    });

    pagination = createFragment({
      pagination: pagination
    });

    return slide ? (
      <div className='lkform-help'>
        <Row className='lkform-header'>
          <Col xs={12} className='lkform-header-title'>
            <span>{slide.title}</span>
          </Col>
        </Row>
        <Row className='lkform-help-slide'>
          <Col xs={12}>
            <img src={this.slideImageUrl}/>
            <span
              className='lkform-help-slide-prev fa fa-angle-left'
              onClick={this.prev.bind(this)}/>
            <span
              className='lkform-help-slide-next fa fa-angle-right'
              onClick={this.next.bind(this)}/>
          </Col>
        </Row>
        <Row className='lkform-help-pagination'>
          <Col xs={12}>
            {pagination}
          </Col>
        </Row>
      </div>
    ) : (
      <div className='lkform-help'>
        <div className='lkform-help-loader'>
          <i className='fa fa-spinner fa-spin'/>
        </div>
      </div>
    );
  }
}

export default LKHelp;
