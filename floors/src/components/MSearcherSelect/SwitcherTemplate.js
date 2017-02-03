import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map, includes} from 'lodash';

/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

class SwitcherTemplate extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const parentProps = this.props.parentProps;
    const parentState = this.props.parentState;
    const selection = parentState.selection;
    const handleSelect = this.props.handleSelect;
    const isMultiSelect = parseInt(parentProps.isMultiSelect) === 1 ?
      true : false;
    const items = map(parentState.collection, (item) => {
      let active;

      if(isMultiSelect) {
        active = includes(selection, item.id) ||
        includes(selection, item.id.toString()) ? 'active' : '';
      } else {
        active = selection.toString() === item.id.toString() ? 'active' : '';
      }

      if (active === 'active' && item.id !== 'halfhouse') {
        return(
          <Button
            key={item.id}
            active
            data-value={item.id}>
            {item.name}
          </Button>
        );
      } else {
        return(
          <Button
            key={item.id}
            data-value={item.id}>
            {item.name}
          </Button>
        );
      }


    });

    return(
      <div className='switcher-wrapper'>
        <ButtonGroup onClick={handleSelect}
          data-field={parentProps.searcherProperty}>
          {items}
        </ButtonGroup>
      </div>
    );

  }

}

SwitcherTemplate.propTypes = {
  parentProps: React.PropTypes.object,
  parentState: React.PropTypes.object,
  handleSelect: React.PropTypes.func
};

export default SwitcherTemplate;
