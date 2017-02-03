/**
 * ThreeDimensionDoodah widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import {size} from 'lodash';
import emptyFunction from 'fbjs/lib/emptyFunction';
import ga from '../../utils/ga';
import s from './ThreeDimensionDoodah.scss';

class ThreeDimensionDoodah extends Component {

  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    titleSide: PropTypes.string,
    backSide: PropTypes.string,
    back: PropTypes.string,
    disableBackRotating: PropTypes.bool,
    link: PropTypes.string,
    height: PropTypes.string,
    targetBlank: PropTypes.bool,
    eventClick: PropTypes.string,
    eventHover: PropTypes.string,
    perspective: PropTypes.string
  };

  static defaultProps = {
    titleSide: '<div/>',
    backSide: '<div/>',
    link: '#',
    targetBlank: false,
    eventClick: '',
    evenHover: '',
    perspective: ''
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

  componentWillUnmount() {
    this.removeCss();
  }

  onClick = () => {
    const {eventClick} = this.props;

    size(eventClick) && ga('link', eventClick);
  }

  onHover = () => {
    const {eventHover} = this.props;

    size(eventHover) && ga('link', eventHover, 'hover');
  }

  render() {
    const {
      titleSide, backSide, link, targetBlank, perspective, back, height,
      disableBackRotating
    } = this.props;

    return (
      <div
        className={s.root}
        onClick={this.onClick}
        onMouseEnter={this.onHover}
        style={{
          perspective: size(perspective) ? `${parseInt(perspective)}px` : null,
          height: size(height) ? height : null
        }}>
        <a href={size(link) ? link : '#'}
          target={targetBlank ? '_blank' : null}>
          <div className={s.wrapper}>
            <div
              className={classNames({
                [s.backG]: true,
                [s.dontRotate]: disableBackRotating
              })}
              style={{
                background: size(back) ? back : null
              }}/>
            <div className={s.front}
                dangerouslySetInnerHTML={{__html: titleSide}} />
            <div className={s.back}
                dangerouslySetInnerHTML={{__html: backSide}} />
          </div>
        </a>
      </div>
    );
  }

}

export default ThreeDimensionDoodah;
