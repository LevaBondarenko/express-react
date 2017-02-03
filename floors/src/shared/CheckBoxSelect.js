/**
 * Shared CheckBox Select Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import CheckButton from '../shared/CheckButton';
import {includes, map, union, difference} from 'lodash';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';

class CheckBoxSelect extends Component {

  static propTypes = {
    selection: PropTypes.array,
    onChange: PropTypes.func,
    name: PropTypes.string,
    collection: PropTypes.array,
    label: PropTypes.string,
    width: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.state = {
      open: false
    };
  }

  componentWillMount() {
    document.addEventListener('click', this.close);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close);
  }

  handleClick(e) {
    e.nativeEvent.stopImmediatePropagation();
  }

  handleSelect(e) {
    const selection = e.target.checked ?
      union(this.props.selection, [e.target.value]) :
      difference(this.props.selection, [e.target.value]);

    this.props.onChange({
      filter: this.props.name,
      values: selection
    });
  }

  toggle(e) {
    this.setState(() => ({
      open: !this.state.open
    }));
    ReactDOM.findDOMNode(this.refs.toggleButton).blur();
    e.nativeEvent.stopImmediatePropagation();
  }

  close() {
    this.setState(() => ({
      open: false
    }));
  }

  clear(e) {
    this.props.onChange({
      filter: this.props.name,
      values: []
    });
    e.nativeEvent.stopImmediatePropagation();
  }

  all(e) {
    this.props.onChange({
      filter: this.props.name,
      values: map(this.props.collection, 'id')
    });
    e.nativeEvent.stopImmediatePropagation();
  }

  render() {
    const {selection, collection} = this.props;
    const handleSelect = this.handleSelect.bind(this);
    const handleClick = this.handleClick.bind(this);
    const show = this.state.open ? 'block' : 'none';

    const label = selection.length ?
      `${this.props.label} (Выбрано: ${selection.length})` : this.props.label;

    const items = map(this.props.collection, (item) => {

      const active = includes(selection, item.id) ||
        includes(selection, item.id.toString());

      return(
        <li key={this.props.name + item.id}>
          <CheckButton
            itemID={this.props.name + item.id}
            itemLabel={item.name}
            onValue={item.id}
            offValue=''
            onChange={handleSelect}
            onClick={handleClick}
            dataModel={collection}
            checked={active}
          />
        </li>
      );
    });

    return (
      <div className="checkbox-select"
        style={{width: this.props.width ? this.props.width : 'auto'}}>
        <Button
          ref='toggleButton'
          className='btn-select'
          bsStyle='default'
          style={{width: '100%', textAlign: 'left'}}
          onClick={this.toggle.bind(this)}
        >
          {label}&nbsp;
          <div style={{float: 'right', marginTop: '.8rem'}} className="caret" />
        </Button>
        <div className='checkbox-select-content'
          style={{display: show, minWidth: '100%'}}>
          <Button
            style={{
              margin: '.3rem 1rem',
            }}
            bsStyle='default'
            bsSize='xsmall'
            onClick={this.clear.bind(this)}
          >
            Очистить
          </Button>
          <Button
            style={{
              margin: '.3rem 1rem',
            }}
            bsStyle='default'
            bsSize='xsmall'
            onClick={this.all.bind(this)}
          >
            Выбрать все
          </Button>
          <ul>
            {items}
          </ul>
        </div>
      </div>
    );
  }
}

export default CheckBoxSelect;
