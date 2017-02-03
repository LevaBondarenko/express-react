import React, {PropTypes} from 'react';
import GeminiScrollbar from 'react-gemini-scrollbar';
import s from './ClientChat.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const MessageList = ({messages, isMobile}) => {

  const content = (
    messages.map((msg, key) => {
      let text = msg.text &&
        msg.text.replace(/<(?!\/?a(?=>|\s.*>))\/?.*?>/, '');

      text = text.replace(/(https|http):\/\//, '');

      return (
        <div className={s.msgWrapper} key={`msg_${key}`}>
          <div className={`${s.message} ${msg.my ? s.my : ''}`}>
            <div className={s.msgText}
                 dangerouslySetInnerHTML={{__html: text}} />
            <div className={s.time}>
              {msg.time}
            </div>
          </div>
          {
            msg.my ? (
              msg.read ? (
                <div className={`${s.msgStatus} ${s.msgRead}`}>
                  Прочитано
                </div>
              ) : (
                <div className={s.msgStatus}>
                  Не прочитано
                </div>
              )
            ) : null
          }
          <div style={{clear: 'both'}} />
        </div>
      );
    })
  );

  return (
    <div className={s.messages} style={{
      overflow: isMobile ? 'scroll' : 'hidden',
      height: isMobile ? 'calc(100% - 160px)' : '345px'
    }}>
      {
        isMobile ? (
          <div>
            {content}
          </div>
        ) : (
          <GeminiScrollbar>
            {content}
          </GeminiScrollbar>
        )
      }
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array,
  isMobile: PropTypes.bool
};

export default withStyles(s)(MessageList);