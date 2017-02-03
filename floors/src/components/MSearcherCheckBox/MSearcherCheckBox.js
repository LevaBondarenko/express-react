/**
 * Modular Searcher CheckBox component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {clone, without, includes,
  isArray, isEqual, uniq} from 'lodash';
import CheckButton from '../../shared/CheckButton';

/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import wss from '../../stores/WidgetsStateStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import WidgetsActions from '../../actions/WidgetsActions';
import withCondition from '../../decorators/withCondition';
import Url from '../../utils/Url';
import {getSearchResult} from '../../actions/SearchActions';
import Hint from '../../shared/Hint';

@withCondition()
class MSearcherCheckBox extends Component {
  static propTypes = {
    searcherProperty: React.PropTypes.string,
    id: React.PropTypes.string,
    labelText: React.PropTypes.string,
    mode: React.PropTypes.string,
    onValue: React.PropTypes.string,
    offValue: React.PropTypes.string,
    storeMode: React.PropTypes.string,
    updateResult: React.PropTypes.string,
    showHint: React.PropTypes.string,
    visibilityProperty: React.PropTypes.string,
    hintText: React.PropTypes.string
  };

  static defaultProps = {
    hintText: 'Подобрано count {вариант|варианта|вариантов} квартир'
  };

  constructor(props) {
    super(props);
    let searcherProperties, offValues, onValues;

    if(props.searcherProperty.indexOf(',') !== -1) {
      searcherProperties = props.searcherProperty.split(',');
      onValues = props.onValue.split(',');
      offValues = props.offValue.split(',');
    } else {
      searcherProperties = [props.searcherProperty];
      onValues = [props.onValue];
      offValues = [props.offValue];
    }
    this.state = {
      searcherProperties: searcherProperties,
      onValues: onValues,
      offValues: offValues,
      dataModel: [],
      checked: false
    };
  }

  componentWillMount() {
    mss.onChange(this.onChange);
    wss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
    wss.offChange(this.onChange);
  }

  componentDidMount() {
    const {visibilityProperty} = this.props;

    visibilityProperty && WidgetsActions.set(visibilityProperty, true);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state, nextState);
  }

  onChange = () => {
    const model = mss.get(this.state.searcherProperties[0]) || '';
    const visible = this.props.visibilityProperty ?
      wss.get(this.props.visibilityProperty) : true;
    let checked = true;

    // TODO: добавить возможность указывать логический тип выделения (AND, OR)
    // на данный момент кнопка выделяется если все значения, привязанные к ней
    // есть в хранилище
    for (const i in this.state.onValues) {
      if (!includes(model, this.state.onValues[i])) {
        checked = false;
      }
    }

    this.setState(() => ({
      dataModel: model,
      checked: checked,
      visible: visible
    }));
  }

  toggleButton = () => {
    const {searcherProperties, onValues, offValues, checked} = this.state;
    const searcherModel = clone(mss.get());
    const newValues = checked ? offValues : onValues;
    const oldValues = checked ? onValues : offValues;
    const objValues = {};
    const storeMode = parseInt(this.props.storeMode);

    for(const i in searcherProperties) {
      if(searcherProperties[i]) {
        if(searcherModel[searcherProperties[i]] !== undefined) {
          if(isArray(searcherModel[searcherProperties[i]])) {
            newValues[i] &&
              searcherModel[searcherProperties[i]].push(newValues[i]);
            searcherModel[searcherProperties[i]] =
              without(searcherModel[searcherProperties[i]], oldValues[i]);
            objValues[searcherProperties[i]] =
              searcherModel[searcherProperties[i]];
          } else {
            if(searcherModel[searcherProperties[i]] === oldValues[i]) {
              searcherModel[searcherProperties[i]] = [];
            } else {
              searcherModel[searcherProperties[i]] =
                [searcherModel[searcherProperties[i]]];
              objValues[searcherProperties[i]] =
                [searcherModel[searcherProperties[i]]];
            }

            // если тип хранения - строка
            if (storeMode) {
              objValues[searcherProperties[i]] = newValues[i];
              searcherModel[searcherProperties[i]] = newValues[i];
            } else {
              newValues[i] &&
                searcherModel[searcherProperties[i]].push(newValues[i]);
              newValues[i] &&
                objValues[searcherProperties[i]].push(newValues[i]);
            }

          }
        } else if(newValues[i]) {

          if (storeMode) {
            searcherModel[searcherProperties[i]] = newValues[i];
            objValues[searcherProperties[i]] = newValues[i];
          } else {
            searcherModel[searcherProperties[i]] = [newValues[i]];
            objValues[searcherProperties[i]] = [newValues[i]];
          }
        }
      }
      // GENIUS!
      searcherModel[searcherProperties[i]] = !storeMode ?
        uniq(searcherModel[searcherProperties[i]]) : searcherModel[searcherProperties[i]]; // eslint-disable-line
    }

    if (this.props.updateResult) {
      searcherModel.offset = this.props.updateResult ? 0 :
        searcherModel.offset;
      searcherModel.currentPage = this.props.updateResult ? 0 :
        searcherModel.currentPage;
    }

    ModularSearcherActions.set(
      null,
      searcherModel,
    );

    // скрываем лишние подсказки
    $('.filtercheckbox-hint').each((key, el) => {
      el = $(el);

      if (el.attr('data-prop') !== this.props.onValue) {
        el.hide();
      } else {
        el.show();
      }
    });

    if (this.props.updateResult) {
      for (const j in searcherProperties) {
        if (searcherProperties.hasOwnProperty(j)) {
          Url.updateSearchParam(searcherProperties[j], undefined);
        }
      }

      for (const val in objValues) {
        if (objValues.hasOwnProperty(val)) {
          const uniqVals = !storeMode ? uniq(objValues[val]) :
            objValues[val];

          Url.updateSearchParam(val, uniqVals ? uniqVals : undefined);
        }
      }

      const {perPage} = searcherModel;

      Url.updateSearchParam('currentPage', undefined);
      getSearchResult(
        searcherModel['class'],
        perPage,
        0,
        searcherModel,
        {}
      );

      // нужно ли перисчитывать кол-во объектов при изменении фильтра?
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll', () => {
        this.setState(() => ({
          loadingHint: false
        }));
        this.timer2 = setTimeout(() => {
          this.setState(() => ({
            displayHint: false
          }));
        }, 2000);
      });
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
    }
    this.setState(() => ({
      displayHint: true,
      loadingHint: true
    }));
  }

  render() {
    const dataModel = this.state.dataModel;
    const toggleButton = this.toggleButton;
    const modeClass = this.props.mode === '1' ?
      'msearcher--checkbuttons clearfix' :
      'msearcher--checkbox clearfix';
    const {displayHint, loadingHint} = this.state;
    const {hintText} = this.props;

    return (
      <div className="msearcher"
           style={{display: this.state.visible ? 'block' : 'none'}}>
        <div className={modeClass}>
          {this.props.showHint ? (
            <Hint
              ref="currentHint"
              template={hintText}
              display={displayHint}
              loading={loadingHint}
              top={0}
              left={241}
              count={mss.get('count')}
              {...this.props}
            />
          ) : null}
          <CheckButton
            itemID={this.props.id}
            itemLabel={this.props.labelText}
            onValue={this.props.onValue}
            offValue={this.props.offValue}
            onChange={toggleButton}
            dataModel={dataModel}
            mode={this.props.mode}
            checked={this.state.checked}
            model={this.props.searcherProperty}
          />
        </div>
      </div>
    );
  }
}

export default MSearcherCheckBox;