/**
 * Blogposts not found
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

class PostsNotFound extends Component {
  render() {
    return (
      <div className='notFound'>
        <p>Записи блога не найдены. Попробуйте обновить страницу позднее.</p>
      </div>
    );
  }
}

export default PostsNotFound;
