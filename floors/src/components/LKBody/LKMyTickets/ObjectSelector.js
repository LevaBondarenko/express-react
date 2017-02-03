/**
 * LK Objects Selector component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map, union, find, omitBy, size, values} from 'lodash';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import GeminiScrollbar from 'react-gemini-scrollbar';

import ObjectSelectorItem from './ObjectSelectorItem';
import CheckButton from '../../../shared/CheckButton';


class ObjectSelector extends Component {
  static propTypes = {
    objects: PropTypes.array,
    selected: PropTypes.array,
    multiselect: PropTypes.bool,
    title: PropTypes.string,
    id: PropTypes.string,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      show: false
    };
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close);
  }

  toggle = () => {
    if(!this.state.show) {
      document.addEventListener('click', this.close);
    } else {
      document.removeEventListener('click', this.close);
    }
    this.setState(() => ({show: !this.state.show}));
  }

  close = e => {
    let ancestor = e.target;

    while(!(ancestor.classList &&
      ancestor.classList.contains('object-select-container')) &&
      (ancestor = ancestor.parentNode)) {};
    if(!ancestor || ancestor.id !== this.props.id) {
      this.setState(() => ({show: false}));
      document.removeEventListener('click', this.close);
    }
  }

  onChange = e => {
    const {value} = e.target;
    const {multiselect, selected, objects} = this.props;
    const oclass = objects[value].class;
    const oid = objects[value].object_id;
    const newSelected = multiselect ?
      (find(selected, {class: oclass, id: oid}) ?
        values(omitBy(selected, {class: oclass, id: oid})) :
        union(selected, [{class: oclass, id: oid}])) :
      [{class: oclass, id: oid}];

    this.props.onChange(newSelected);
  }

  render() {
    const {title, objects, selected, multiselect, id} = this.props;
    const label = size(selected) > 1 ? `Выбрано: ${size(selected)}` : title;
    const {show} = this.state;
    const objBlock = show ? map(objects, (item, key)=> {
      const oid = item.object_id;
      const oclass = item.class ? item.class : 'myObjects';
      const checked = find(selected, {class: oclass, id: oid});

      return (
        <Row className='object-list-item' key={`${oclass}${oid}`}>
          <Col xs={1} className='object-list-checkbox'>
            <CheckButton
              itemID={`${oclass}-${oid}`}
              onValue={key}
              radiomode={!multiselect}
              onChange={this.onChange}
              checked={checked} />
          </Col>
          <Col xs={11}>
            <ObjectSelectorItem item={item} />
          </Col>
        </Row>
      );
    }) : null;

    return (
      <div className='object-select-container' id={id}>
        <Button
          bsStyle='success'
          onClick={this.toggle}
        >
          {label}
        </Button>
        {show ? (
          <div className='object-list-container'>
            <GeminiScrollbar>
              {objBlock}
            </GeminiScrollbar>
          </div>
        ) : null}
      </div>
    );
  }
}

export default ObjectSelector;
