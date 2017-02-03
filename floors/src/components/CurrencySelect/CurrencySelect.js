/**
 * Currency Select component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';

import s from './CurrencySelect.scss';
import emptyFunction from 'fbjs/lib/emptyFunction';
import ContextType from '../../utils/contextType';

import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

class CurrencySelect extends Component {
  static propTypes = {
    nameWSS: PropTypes.string,
    currencyList: PropTypes.array,
    currencyDefault: PropTypes.object,
    actions: PropTypes.object,
    currency: PropTypes.object,
    current: PropTypes.object,
    context: PropTypes.shape(ContextType).isRequired
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentDidMount() {
    this.checkForSelectedExist(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkForSelectedExist(nextProps);
  }

  checkForSelectedExist = props => {
    const {
      current: selected,
      currency: {currencyList, currencyDefault}
    } = props;
    const selectedExist = currencyList.find(item => {
      return item.id === selected.id;
    });

    selectedExist || this.props.actions.updateInUiState(
      ['currency', 'current'], () => (currencyDefault)
    );
  }

  componentWillUnmount() {
    this.removeCss();
  }

  handleSelect = (eventKey) => {
    this.props.actions.updateInUiState(
      ['currency', 'current'], () => (eventKey)
    );
  };

  getSymbol = (currency) => {
    let symbol = <i className="fa">{currency.symbol}</i>;

    if(currency.char_code === 'RUB') {
      symbol = <i className="fa fa-rub" aria-hidden="true" />;
    } else if(currency.char_code === 'EUR') {
      symbol = <i className="fa fa-eur" aria-hidden="true" />;
    }

    return (
      <span>
        {symbol} {currency.char_code}
      </span>
    );
  }

  render() {
    const {current} = this.props;
    const {getSymbol} = this;

    return (
      <div className={s.root}>
        <DropdownButton
          onSelect={this.handleSelect}
          className={s.dropdownBtn}
          title={getSymbol(current)}
          id={s.dropdownBtn}>
          {this.props.currency.currencyList.map(item => (
              <MenuItem key={item.id} eventKey={item}>
                {getSymbol(item)}
              </MenuItem>
            )
          )}
        </DropdownButton>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({updateInUiState}, dispatch)
  };
}

function mapStateToProps(state) {
  return {
    currency: state.intl.get('currency').toJS(),
    current: state.ui.get('currency').toJS().current
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CurrencySelect);
