/**
 * Slide stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react';
/**
 * components
 */
import UAgregator from '../UAgregator/UAgregator';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Slide.scss';
import ContextType from '../../utils/contextType';

class Slide extends Component {

  static propTypes = {
    slideProps: PropTypes.object,
    parentState: PropTypes.object,
    activeIndex: PropTypes.number,
    oldIndex: PropTypes.number,
    lastIndex: PropTypes.number,
    index: PropTypes.number,
    slidesIsReady: PropTypes.func,
    context: PropTypes.shape(ContextType).isRequired,
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    const {parentState, index} = props;
    const {activeIndex} = parentState;

    this.state = {
      className: index === activeIndex ?
          `${s.slide} ${s.active}` :
          s.slide
    };
  }

  componentDidUpdate() {
    const {parentState, index, lastIndex, slidesIsReady} = this.props;
    const {activeIndex, oldIndex} = parentState;
    const {className} = this.state;
    let lr, rl;

    if ((activeIndex !== lastIndex || oldIndex !== 0) &&
    (activeIndex > oldIndex || activeIndex === 0 && oldIndex === lastIndex)) {
      lr = `${s.slide} ${s.left}`;
      rl = `${s.slide} ${s.right}`;
    } else {
      lr = `${s.slide} ${s.right}`;
      rl = `${s.slide} ${s.left}`;
    }

    if (index === oldIndex && className !== s.slide) {
      setTimeout(() => {
        this.setState({
          className: className === `${s.slide} ${s.active}` ? lr : s.slide
        });
      }, 200);
    }
    if (index === activeIndex && className !== `${s.slide} ${s.active}`) {
      setTimeout(() => {
        this.setState({
          className: className !== s.slide ? `${s.slide} ${s.active}` : rl
        });
      }, 100);
    }
    index === activeIndex &&
      slidesIsReady(!!(className === `${s.slide} ${s.active}`));
  }

  render() {
    const {slideProps, context, index} = this.props;
    const {className} = this.state;

    return (<div style={{background: `url('${slideProps.image}') no-repeat`}}
      className={className}
      data-index={index}>

        <div className={s.topText}>
          <div>
            <UAgregator
              context={context}
              gparams={slideProps.topAgregator.gparams}
              params={slideProps.topAgregator.params}
              functions={slideProps.topAgregator.functions}
              text={slideProps.topText} />
          </div>
        </div>

        <div className={s.middleText}>
          <div>
            <UAgregator
              context={context}
              gparams={slideProps.middleAgregator.gparams}
              params={slideProps.middleAgregator.params}
              functions={slideProps.middleAgregator.functions}
              text={slideProps.middleText} />
          </div>
        </div>

        <div className={s.bottomText}>
          <div>
          <UAgregator
            context={context}
            gparams={slideProps.bottomAgregator.gparams}
            params={slideProps.bottomAgregator.params}
            functions={slideProps.bottomAgregator.functions}
            text={slideProps.bottomText}/>
          </div>
        </div>

      </div>
    );
  }
};

export default withStyles(s)(Slide);
