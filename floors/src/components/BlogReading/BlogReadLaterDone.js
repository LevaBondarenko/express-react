/**
 * Blog read later submitted component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars


class BlogReadLaterDone extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className='readLaterForm' key='readLaterDone'>
        <div className='blogArrowUp' />
        <div className='blog--subscribe--main'>
          <div className='blog--subscribe--main--subscribed'>
            <h3><b>СПАСИБО!</b></h3>
              <p>
                Скоро вы получите статью по почте
              </p>
          </div>
        </div>
      </div>
    );
  }
}

export default BlogReadLaterDone;
