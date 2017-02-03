/**
 * Modular Searcher Buttons component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, clone, without, includes, isArray, size} from 'lodash';
import CheckButton from '../../shared/CheckButton';
/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
// временно
import {getSearchResult} from '../../actions/SearchActions';
import Url from '../../utils/Url';
import withCondition from '../../decorators/withCondition';

@withCondition()
class MSearcherCheckButtons extends Component {
  static propTypes = {
    buttons: React.PropTypes.string,
    searcherProperty: React.PropTypes.string,
    extProps: React.PropTypes.string,
    extVals: React.PropTypes.string,
    updateResult: React.PropTypes.string,
    id: React.PropTypes.string,
    labelText: React.PropTypes.string
  };
  static defaultProps = {
    extProps: '',
    extVals: ''
  }
  constructor(props) {
    super(props);
    this.state = {
      dataModel: [],
      buttons: JSON.parse(props.buttons).buttons,
      extProps: props.extProps.split('&'),
      extVals: props.extVals.split('&')
    };
  }

  componentWillMount() {
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  onChange = () => {
    this.setState({
      dataModel: mss.get(this.props.searcherProperty) || [],
    });
  }

  toggleButton = (event) => {
    const searcherModel = clone(mss.get());
    const value = event.target.value;
    const {extProps, extVals} = this.state;
    let mainModel = searcherModel[this.props.searcherProperty];

    if(includes(mainModel, value)) {
      mainModel = without(mainModel, value);
    } else if(isArray(mainModel)) {
      mainModel.push(value);
    } else {
      mainModel = [value];
    }

    searcherModel[this.props.searcherProperty] = mainModel;
    for(const i in extProps) {
      if(extProps[i] && extVals[i] !== undefined) {
        if(size(mainModel)) {
          if(!isArray(searcherModel[extProps[i]]) ||
            !includes(searcherModel[extProps[i]], extVals[i])) {
            if(searcherModel[extProps[i]] !== undefined) {
              if(isArray(searcherModel[extProps[i]])) {
                searcherModel[extProps[i]].push(extVals[i]);
              } else {
                searcherModel[extProps[i]] =
                  [extVals[i], searcherModel[extProps[i]]];
              }
            } else {
              searcherModel[extProps[i]] = [extVals[i]];
            }
          }
        } else {
          searcherModel[extProps[i]] =
            without(searcherModel[extProps[i]], extVals[i]);
        }
      }
    }

    searcherModel.offset = 0;
    searcherModel.currentPage = 0;
    ModularSearcherActions.set(
      null,
      searcherModel
    );

    if (this.props.updateResult) {
      Url.updateSearchParam(this.props.searcherProperty, mainModel);
      Url.updateSearchParam('currentPage', undefined);

      // если есть доп. св-ва дописываем и их
      if (extProps) {
        for(const i in extProps) {
          if (extProps.hasOwnProperty(i) &&
            extProps[i] && extVals[i] !== undefined) {
            const curExtVal = mss.get()[extProps[i]];

            Url.updateSearchParam(
              extProps[i], curExtVal
            );
          }
        }
      }

      const {perPage} = searcherModel;

      getSearchResult(
        searcherModel['class'],
        perPage,
        0,
        searcherModel,
        {}
      );

      // нужно ли перисчитывать кол-во объектов при изменении фильтра?
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
      ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
    }
  }

  render() {
    const dataModel = this.state.dataModel;
    const idPrfx = this.props.id;
    const toggleButton = this.toggleButton;
    const buttons = map(this.state.buttons, (btn, key) => {
      return (
        <CheckButton
          key={key}
          itemID={idPrfx + btn.value}
          itemLabel={btn.text}
          onValue={btn.value}
          offValue=''
          onChange={toggleButton}
          dataModel={dataModel}
          model={this.props.searcherProperty}
          mode='1'
          pullLeft='1'
        />
      );
    });

    return (
      <div className="msearcher">
        <div className="clearfix msearcher--checkbuttons">
          {buttons}
          <span className="msearcher--checkbuttons__label">
            {this.props.labelText}
          </span>
        </div>
      </div>
    );
  }
}

export default MSearcherCheckButtons;
