/**
 * MSearcherPaging widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import UserAgentData from 'fbjs/lib/UserAgentData';
import {scrollTo} from '../../utils/Helpers';
import s from './MSearcherPaging.scss';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class MSearcherPaging extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    isSticky: PropTypes.bool,
    actions: PropTypes.object,
    page: PropTypes.number,
    perPage: PropTypes.number,
    pages: PropTypes.number
  };

  static defaultProps = {
    isSticky: false
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      sticky: false,
      tempPage: props.page
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    this.props.isSticky && window.addEventListener('scroll', this.onScroll);
    this.props.isSticky && this.onScroll();
  }

  componentWillUnmount() {
    this.props.isSticky && window.removeEventListener('scroll', this.onScroll);
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({tempPage: nextProps.page}));
  }

  onScroll = () => {
    const el = ReactDOM.findDOMNode(this.root);
    const offsetTop = this.offsetTop ? this.offsetTop : el.offsetTop + 60;
    const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;

    if(!this.offsetTop) {
      this.offsetTop = el.offsetTop;
    }
    this.setState(() => ({
      sticky: scrollTop > offsetTop
    }));
  }

  toTop = () => {
    const elementTop = UserAgentData.browserName === 'Firefox' ?
      document.documentElement :
      document.body;

    setTimeout(() => {
      scrollTo(elementTop, 0, 600);
    }, 0);
  }

  prev = e => {
    const {page, perPage} = this.props;

    (page > 1) && this.props.actions.updateInObjectsState(
      ['searcher', 'offset'],
      offset => {
        const offsetVal = parseInt(offset);

        return offset && (offsetVal - perPage) > 0 ?
          (offsetVal - perPage) : 0;
      }
    );
    this.toTop();
    e.preventDefault();
  }

  next = e => {
    const {page, pages, perPage} = this.props;

    (page < pages) && this.props.actions.updateInObjectsState(
      ['searcher', 'offset'],
      offset => {
        return offset ? (parseInt(offset) + perPage) : perPage;
      }
    );
    this.toTop();
    e.preventDefault();
  }

  onInput = e => {
    const {value} = e.target;
    const {pages} = this.props;
    const page = parseInt(value);

    (value === '' || (page > 0 && page <= pages)) &&
      this.setState(() => ({tempPage: value === '' ? value : page}));
  }

  onInputKeyDown = e => {
    const {keyCode} = e;
    const {pages, page, perPage} = this.props;
    const {tempPage} = this.state;

    if(keyCode === 13 &&
      tempPage !== page && tempPage > 0 && tempPage <= pages) {
      this.props.actions.updateInObjectsState(
        ['searcher', 'offset'], () => ((tempPage - 1) * perPage));
      this.toTop();
    }
  }

  onInputBlur = () => {
    const {page} = this.props;

    this.setState(() => ({tempPage: page}));
  }

  render() {
    const {page, pages} = this.props;
    const {sticky, tempPage} = this.state;

    return (
      <div className={s.root} ref={root => { this.root = root; }}>
        <div className={classNames(s.pager, {[s.fixPager]: sticky})}>
          <a
            href="#"
            onClick={this.prev}
            className={classNames(s.prev, {[s.disabled]: page < 2})}>
            назад
          </a>
          <div className={s.pagingContent}>
            <span>Страница</span>
            <input
              type="text"
              className={s.inputPage}
              onChange={this.onInput}
              onKeyDown={this.onInputKeyDown}
              onBlur={this.onInputBlur}
              value={tempPage}/>
            <span>из</span>&nbsp;
            <span>{pages}</span>
          </div>
          <a
            href="#"
            onClick={this.next}
            className={classNames(s.next, {[s.disabled]: page >= pages})}>
            вперед
          </a>
        </div>
        <div className={s.margin}/>
      </div>
    );
  }

}

export default connect(
  state => {
    const searcher = state.objects.get('searcher') ?
      state.objects.get('searcher').toJS() : null;
    const result = {
      page: 0,
      perPage: 0,
      pages: 0
    };

    if(searcher) {
      const {limit, offset, count, count_houses: countH} = searcher;
      const objectsCount = countH || count;

      result.perPage = limit ? parseInt(limit) : 15;
      result.page = offset ? (Math.floor(offset / result.perPage) + 1) : 1;
      result.pages = Math.ceil((objectsCount || 0)  / result.perPage);
    }
    return result;
  },
  dispatch => {
    return {
      actions: bindActionCreators({updateInObjectsState}, dispatch)
    };
  }
)(MSearcherPaging);
