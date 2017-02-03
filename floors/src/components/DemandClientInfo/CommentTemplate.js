/**
 * Created by tatarchuk on 30.04.15.
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars


class CommentTemplate extends Component {
  static defaultProps ={
    wrapperPos: -80
  };
  static propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    rieltors: PropTypes.array,
    count: PropTypes.string,
    wrapperPos: PropTypes.number,
    animate: PropTypes.bool,
    url: PropTypes.string,
    urlText: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      cities: [],
      items: [],
      priceFrom: ''
    };
  }


  render() {
    const {title, rieltors, count, wrapperPos, url, urlText} = this.props;
    const height = count  * 80;
    const animate = this.props.animate ? 'all 0.25s ease-in-out' :
                    null;
    const style = {top: wrapperPos, transition: animate};


    return (
      <div className='demandclientinfo clearfix'>
        <h1>{title}</h1>
        <div className='demandclientinfo-textblock textslider-overflow'
          style={{height: `${height}px`}}>
          <div className='demandclientinfo-textslider-wrapper'
               style={style}>
            {rieltors}
          </div>
        </div>
        <div className='demandclientinfo-btnblock'>
          <a href={url}>
            <span>{urlText}</span>
              <img src={'//cdn-media.etagi.com/static/site/4/4b/4b7f' +
                '1affce3fd91a10d4372a304fcdce23fb7cdb.svg'}/>
          </a>
        </div>
      </div>
    );
  }
}


export default CommentTemplate;
