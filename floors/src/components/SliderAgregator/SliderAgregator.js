/**
 * SliderAgregator widget class
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

import React, {Component, PropTypes} from 'react';
/**
 * components
 */
import Arrows from './Arrows';
import Slide from './Slide';
import Indicators from './Indicators';
/**
 *  styles
 */
import s from './SliderAgregator.scss';
import ContextType from '../../utils/contextType';

class SliderAgregator extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    height: PropTypes.number,
    slidesCount: PropTypes.number,
    indicatorsColor: PropTypes.string,
    slidesProps: PropTypes.array,
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.isReady = true;

    this.state = {
      activeIndex: 0,
      oldIndex: 0
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  toSlide = (event) => {
    const newIndex = parseInt(event.target.dataset.index);

    this.setState({
      oldIndex: this.state.activeIndex,
      activeIndex: newIndex
    });
  }

  prevSlide = () => {
    if (this.isReady) {
      const lastIndex = this.props.slidesProps.length - 1;
      const {activeIndex} = this.state;

      this.setState({
        oldIndex: activeIndex,
        activeIndex: activeIndex === 0 ?
          lastIndex : activeIndex - 1
      });
    }
  }

  nextSlide = () => {
    if (this.isReady) {
      const {activeIndex} = this.state;
      const slidesCount = this.props.slidesProps.length;
      const nextIndex = activeIndex + 1;

      this.setState({
        oldIndex: activeIndex,
        activeIndex: nextIndex === slidesCount ? 0 : nextIndex
      });
    }
  }

  slidesIsReady = (isReady) => {
    this.isReady = isReady;
  }

  render() {
    const slides = [];
    const {height, slidesProps, slidesCount, context} = this.props;

    for (let i = 0; i < slidesCount; i++) {
      slides.push(<Slide
        key={`slide${i}`}
        index={i}
        context={context}
        lastIndex={slidesCount - 1}
        parentState={this.state}
        slidesIsReady={this.slidesIsReady}
        slideProps={slidesProps[i]} />);
    }

    return (
      <div style={{height: height}}
        className={s.slider}>
        {slidesCount > 1 &&
          <Arrows
            prevSlide={this.prevSlide}
            nextSlide={this.nextSlide} />
        }
        {slides}
        {slidesCount > 1 &&
          <Indicators
            toSlide={this.toSlide}
            index={this.state.activeIndex}
            color={this.props.indicatorsColor}
            count={slidesCount} />
        }
      </div>
    );
  }

}

export default SliderAgregator;
