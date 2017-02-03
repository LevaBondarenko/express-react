/**
 * Blog read also component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, cloneDeep} from 'lodash';
import createFragment from 'react-addons-create-fragment';

/* global data */

import bs from '../../stores/BlogStore';

import BlogReadAlsoItem from '../BlogReadAlso/BlogReadAlsoItem';


class BlogReadAlso extends Component {
  static propTypes = {
    showExcerpt: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true
    };
  }

  componentDidMount() {
    bs.onChange(this.onChange);
  }

  componentWillUnmount() {
    bs.offChange(this.onChange);
  }

  onChange = () => {
    const dataGet = bs.get();

    this.setState({
      dataRa: dataGet,
      isLoading: bs.get('isLoading')
    });
  }

  getReadAlsoItems = () => {
    const {id, origin} = data.blog.blogpost;
    const {dataRa} = this.state;
    const showExcerpt = parseInt(this.props.showExcerpt) ? true : false;
    const dataClone = dataRa ? cloneDeep(dataRa.dataRA) : '';
    const rAItem = [];
    let i = 0;

    while (size(dataClone) && size(rAItem) < 3 && i < size(dataClone)) {
      if(!(parseInt(dataClone[i].origin_blog) === origin &&
       parseInt(dataClone[i].ID) === id)) {
        rAItem.push(<BlogReadAlsoItem data={dataClone[i]}
         place={size(rAItem)} showExcerpt={showExcerpt}/>);
      }
      ++i;
    }

    return rAItem;
  }

  render() {
    let readAlsoItems = this.getReadAlsoItems();

    readAlsoItems = createFragment({rAItem: (size(readAlsoItems) > 0 ?
     readAlsoItems : null)});

    return (
      <div className="blog-readalso-wrapper">
        {size(readAlsoItems) ?
          (<div>
            <p>Читайте также:</p>
            <div>
              {readAlsoItems}
            </div>
          </div>) : null}
      </div>
    );
  }
}

export default BlogReadAlso;
