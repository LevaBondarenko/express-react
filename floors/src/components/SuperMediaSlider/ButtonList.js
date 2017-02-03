/**
 * ButtonList component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
/**
 *  components
 */
import FilterContent from '../SuperMediaSlider/FilterContent';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ButtonList.scss';


class ButtonList extends Component {
  static propTypes = {
    parentProps: React.PropTypes.object,
    parentState: React.PropTypes.object,
    handleSwitch: React.PropTypes.func,
    filterChanged: React.PropTypes.func,
    checkSeasons: React.PropTypes.func,
    clearSeasons: React.PropTypes.func,
    key: React.PropTypes.string,
    dataView: React.PropTypes.string,
    name: React.PropTypes.string,
    className: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  showFilter() {
    if (this.refs.listContent) {
      this.refs.listContent.style.display = 'block';
    }
  }

  hideFilter() {
    if (this.refs.listContent) {
      this.refs.listContent.style.display = 'none';
    }
  }

  render() {
    const {key, dataView, name, className, parentState} = this.props;
    const {views, activeView} = parentState;
    const displayFilter = views[activeView] && views[activeView].displayFilter;
    const filterContent = parentState.activeView === dataView &&
      <FilterContent
        filterSeason={parentState.filterSeason}
        collectionSeason={parentState.collectionSeason}
        filterChanged={this.props.filterChanged}
      />;

    return (<div
        className={s.buttonList}
        onMouseOver={this.showFilter.bind(this)}
        onMouseLeave={this.hideFilter.bind(this)}>

      <button
        key={key}
        data-view={dataView}
        className={className}
        onClick={this.props.handleSwitch}>
        {name}
        {parentState.collectionSeason.length > 1 &&
        <div className={parentState.activeView === dataView ?
          s.contentArrow__active : s.contentArrow} />
        }
      </button>
      {parentState.activeView === dataView &&
      parentState.collectionSeason.length > 1 &&
      <div
        className={s.buttonListContent}
        style={{display: displayFilter ? 'block' : 'none'}}
        ref='listContent'>
        <div className={s.closeContent}
          onClick={this.hideFilter.bind(this)}>
          ×
        </div>
          <div><b>Сезон</b>
            {filterContent}
          </div>
        <div className={s.buttonsContainer}>
          <button
            key='checkSeasons'
            className={s.button__left}
            onClick={this.props.checkSeasons}>
            выбрать все
          </button>
          <button
            key='clearSeasons'
            className={s.button__right}
            onClick={this.props.clearSeasons}>
             очистить
          </button>
        </div>
      </div>}
    </div>);
  }
}

export default withStyles(s)(ButtonList);
