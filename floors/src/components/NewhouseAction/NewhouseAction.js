/**
  * BuilderPromo Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import withCondition from '../../decorators/withCondition';

@withCondition()
class NewhouseAction extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hidden: true,
    };
  }

  onClick() {
    const state = this.state;

    this.setState(() => ({
      hidden: !state.hidden
    }));
  }

  componentDidMount() {
    /* global data */
    if (data.object.info && data.object.info.info.action_description) {
      const descrHeight = ReactDOM.findDOMNode(this.refs.descr)
        .offsetHeight + 20;
      const titleHeight = ReactDOM.findDOMNode(this.refs.title)
        .offsetHeight + 20;
      const neededHeight = Math.max(descrHeight, titleHeight);

      this.setState(() => ({
        neededHeight: neededHeight
      }));
    }
  }

  render() {

    /* global data */
    const state = this.state;
    const actionTitle = data.object.info.info.action_name;
    const actionDescr = data.object.info.info.action_description;
    const visibleClass = state.hidden ? '__hidden' : '__visible';
    const onClick = this.onClick.bind(this);
    const newhouseActionDescription = classNames({
      'newhouseActionDescription': true,
      'newhouseActionDescription__hidden': state.hidden,
      'newhouseActionDescription__visible': !state.hidden
    });

    if (!actionDescr) {
      return (<div></div>);
    }

    return (
      <div style={this.state.neededHeight ?
        {height: this.state.neededHeight} : {}}
           className={
           `newhouseActionWrapper newhouseActionWrapper${visibleClass}`
           }>
        <div className={`newhouseAction newhouseAction${visibleClass}`}>
          <div className="newhouseActionTitleWrapper">
            <div className={
            `newhouseActionTitle newhouseActionTitle${visibleClass}`
            }
                 ref='title'>
              {actionTitle}
            </div>
          </div>
          <div className="newhouseActionDescriptionWrapper">
            <div
              className={newhouseActionDescription}
              ref='descr'
              dangerouslySetInnerHTML={{__html: actionDescr}}
              >
            </div>
          </div>
          <div
            onClick={onClick}
            style={{
              backgroundRepeat: 'no-repeat'
            }}
            className={`action-switcher action-switcher${visibleClass}`}>
            <div className='action-switcher-text'>
              {this.state.hidden ? 'Узнайте о скидках!' : 'Скрыть'}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default NewhouseAction;
