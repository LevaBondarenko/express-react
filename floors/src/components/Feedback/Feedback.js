/**
  * Feedback Widget
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import withCondition from '../../decorators/withCondition';
import ReactDOM from 'react-dom';

@withCondition()
class Feedback extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $(document).ready(() => {
      $('.feedback_slides').bxSlider({
        minSlides: 2,
        maxSlides: 3,
        slideWidth: 257,
        slideMargin: 15,
        loop: false,
        controls: false
      });
    });
  }

  showFullFeedback(event) {
    const id = event.target.id.split('_')[1];
    const self = this;

    $.ajax({
      type: 'GET',
      url: '/backend/',
      dataType: 'json',
      data: {
        action: 'get_full_feedback',
        data: {
          id: id,
        }
      },
      beforeSend: function() {
        const modal = ReactDOM.findDOMNode(self.refs.feedBackFull);
        const modalText = ReactDOM.findDOMNode(self.refs.feedBackFullText);
        const modalTitle = ReactDOM.findDOMNode(self.refs.feedBackFullTitle);

        modalTitle.innerText = '';
        $(modalText).html(
          '<div class="loader-inner ball-clip-rotate feedback-loader">' +
            '<div></div>' +
          '</div>'
        );
        modal.className = 'feedback_full';
      },
      success: function(data) {
        const modalText = ReactDOM.findDOMNode(self.refs.feedBackFullText);
        const modalTitle = ReactDOM.findDOMNode(self.refs.feedBackFullTitle);

        //modalText.innerText = data.feedback_text;
        modalText.textContent = data.feedback_text;
        modalTitle.textContent = data.fio;
      },
    });

  }

  closeFullFeedback() {
    const modal = ReactDOM.findDOMNode(this.refs.feedBackFull);

    modal.className = 'feedback_full feedback_full__hidden';
  }

  render() {

    const props = this.props;
    const showFullFeedback = this.showFullFeedback.bind(this);
    const closeFullFeedback = this.closeFullFeedback.bind(this);
    const bgImage = props.bgImage ? props.bgImage : 'https://cdn-media.etagi.com/content/media/etagi_com_uploads/f/fe/feeedf65409b5f34f5a524ac976c79e1e1946da0.png';
    const mainStyle = {
      backgroundImage: `url(${bgImage})`
    };
    const slides = map(props.items, (item, key) => {
      const length = item.feedback_text.length;
      let showMore;
      let feedbackText = item.feedback_text;

      if (length > 100) {
        showMore = (<button onClick={showFullFeedback}
                           id={`item_${item.id}`}
                           className='feedback_moreBtn'>
                      Прочитать
                  </button>);
        feedbackText = `${feedbackText.substring(0, 100)}...`;
      }

      return (
        <li className={'feedback_slide'} key={key}>
          <p className='feedback_text'>{feedbackText}</p>
          <div className='feedback_signature'>С уважением, {item.fio}</div>
          {showMore}
        </li>
      );
    });

    return (
        <div className='feedback' style={mainStyle}>
          <div
              className='feedback_full feedback_full__hidden'
              ref='feedBackFull'>
            <div className='feedback_close' onClick={closeFullFeedback}>×</div>
            <div
              className='feedback_fullTextTitle'
              ref='feedBackFullTitle'>
            </div>
            <div className='feedback_text__wrapper'>
                <div className='feedback_fullText' ref='feedBackFullText' />
            </div>
          </div>
          <div className='feedback_title'>{props.title}</div>
          <ul className='feedback_slides'>
            {slides}
          </ul>
        </div>
    );
  }
}

export default Feedback;
