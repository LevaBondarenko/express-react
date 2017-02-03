import React, {Component, PropTypes} from 'react';
import hoistStatics from 'hoist-non-react-statics';
import {getCaretPosition, setCaretPosition} from '../utils/Helpers';
import {mapValues} from 'lodash';

function getDisplayName(ComposedComponent) {
  return ComposedComponent.displayName || ComposedComponent.name || 'Component';
}

function listenCaret() {
  return function wrapListenCaret(ComposedComponent) {
    class ListenCaret extends Component {
      static propTypes = {
        mountNode: PropTypes.string,
        isNumeric: PropTypes.bool,
        isPhone: PropTypes.bool,
        isDisabledListenCarret: PropTypes.bool
      };

      static displayName = `ListenCaret(${getDisplayName(ComposedComponent)})`;
      static ComposedComponent = ComposedComponent;

      constructor(props) {
        super(props);
        this.state = {
          caretPosition: {
            begin: 0,
            end: 0
          }
        };
        this.events = ['keydown'];
        this.listenElement = null;
      }

      getListenableElement = id => {
        const parent = document.getElementById(id);
        const listenElement = parent.querySelector('input');

        return listenElement;
      };

      adjustPostion = (caretPosition, direction, adjustValue = 1) => {
        let newPosition;

        if(direction === 'increase') {
          newPosition = mapValues(caretPosition, item => item + adjustValue);
        }

        if(direction === 'decrease') {
          newPosition = mapValues(
            caretPosition, item => item - adjustValue
          );
        }

        return newPosition;
      };

      isNeedExtraSymbol = (maxLength, caretPosition) => {
        const lengthCondition = maxLength % 3 === 0 ||
          maxLength % 7 === 0 || maxLength % 11 === 0;

        return lengthCondition ? (caretPosition.end < maxLength &&
          ![3, 5, 7, 11].includes(maxLength) ? false : true) : false;
      }

      componentDidMount() {
        const {isDisabledListenCarret, isNumeric, isPhone} = this.props;

        this.listenElement = this.getListenableElement(this.props.mountNode);
        isNumeric && !isPhone && !isDisabledListenCarret && this.events.forEach(
          event => this.listenElement.addEventListener(event, this.listener)
        );
      }

      componentDidUpdate() {
        const {isDisabledListenCarret, isNumeric, isPhone} = this.props;

        if(isNumeric && !isPhone && !isDisabledListenCarret) {
          setTimeout(() => {
            setCaretPosition(this.listenElement, this.state.caretPosition);
          }, 0);
        }
      }

      componentWillUnmount() {
        this.props.isNumeric && !this.props.isPhone && this.events.forEach(
          event => this.listenElement.removeEventListener(event, this.listener)
        );
      }

      listener = event => {
        let newPosition = getCaretPosition(this.listenElement);
        const maxLength = this.listenElement.value.length;
        const isNeedExtraSymbol = this.isNeedExtraSymbol(
          maxLength, newPosition
        );

        if(event.keyCode === 8) {
          newPosition = this.adjustPostion(
            newPosition, 'decrease', isNeedExtraSymbol ? 3 : 2
          );
        } else if(event.keyCode === 35) {
          newPosition = {begin: maxLength, end: maxLength};
        } else if(event.keyCode === 36) {
          newPosition = {begin: 0, end: 0};
        } else if(event.keyCode === 37) {
          newPosition = this.adjustPostion(newPosition, 'decrease');
        } else if (event.keyCode === 46) {
          newPosition = this.adjustPostion(
            newPosition, 'increase', isNeedExtraSymbol ? 0 : -1
          );
        } else if (event.keyCode === 39) {
          newPosition = this.adjustPostion(newPosition, 'increase');
        } else {
          if(event.code.includes('Digit') ||
            event.code.includes('Numpad')) {

            newPosition = mapValues(
              newPosition, item => isNeedExtraSymbol ? item + 2 : item + 1
            );
          }
        }

        this.setState({
          caretPosition: newPosition
        });
      }

      render() {
        return <ComposedComponent {...this.props} {...this.state}/>;
      }
    }

    return hoistStatics(ListenCaret, ComposedComponent);
  };
}

export default listenCaret;
