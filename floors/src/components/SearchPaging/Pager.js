import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
/**
 * Bootstrap 3 elements
 */
import ReactPaginate from 'react-paginate';
import ga from '../../utils/ga';
import Url from '../../utils/Url';
// import mss from '../../stores/ModularSearcherStore';

class Pager extends Component {

  static propTypes = {
    previousLabel: PropTypes.object,
    nextLabel: PropTypes.object,
    pageNum: PropTypes.number,
    forceSelected: PropTypes.number,
    clickCallback: PropTypes.func,
    containerClassName: PropTypes.string,
    activeClass: PropTypes.string,
    bottom: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
      currentPage: parseInt(props.forceSelected) + 1,
      width: 33
    };
  }

  componentWillMount() {
    const urlPage = parseInt(Url.parseQuery()['currentPage']);

    if (urlPage) {
      this.setState(() => ({
        currentPage: urlPage
      }));
    }

    setTimeout(() => {
      if (!this.props.bottom && urlPage !== 1 &&
      !isNaN(urlPage)) {
        this.sendPage({
          key: 'Enter',
        });
      }
    }, 0);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.forceSelected !== this.props.forceSelected) {
      this.setState(() => ({
        currentPage: parseInt(nextProps.forceSelected) + 1
      }));
    }
  }

  changePage(e) {
    const inputVal = e.target.value;
    let newPage = parseInt(inputVal) > this.props.pageNum ?
      parseInt(this.props.pageNum) : parseInt(inputVal);

    newPage = newPage === 0 ? 1 : newPage;

    if (isNaN(newPage) && e.target.value !== '') {

    } else {
      const inputLength = newPage.toString().length;
      let width = this.state.width;

      if (inputLength <= 3) {
        width = 33;
      }
      if (inputLength >= 3 && inputLength <= 5) {
        width = 40;
      }
      if (inputLength >= 5) {
        width = 55;
      }

      const page = isNaN(newPage) ? inputVal : newPage;

      this.setState(() => ({
        currentPage: page,
        width: width
      }));
    }
  }

  sendPage(event) {
    if (event.key === 'Enter') {
      // Url.updateSearchParam('page', this.state.currentPage);
      this.props.bottom ?
        ga('input', 'site_search_pagination_down_change', 'enter') :
        ga('input', 'site_search_pagination_up_change', 'enter');

      this.props.clickCallback({
        selected: this.state.currentPage - 1
      });
    }
  }

  render() {
    const {props, state} = this;

    return (
      <div className="etagiPageListing">
        <div>
          Страница
        </div>
        <input type="text"
               style={{width: this.state.width, maxWidth: this.state.width}}
               className="etagiPageListing_inputPage"
               onChange={this.changePage.bind(this)}
               onKeyPress={this.sendPage.bind(this)}
               value={state.currentPage}/>
        <div>
          {`из ${props.pageNum}`}
        </div>
        <ReactPaginate
          previousLabel={props.previousLabel}
          nextLabel={props.nextLabel}
          pageNum={props.pageNum}
          marginPagesDisplayed={0}
          pageRangeDisplayed={0}
          forceSelected={props.forceSelected}
          clickCallback={props.clickCallback}
          containerClassName={props.containerClassName}
          activeClass={'active'} />
      </div>
    );
  }
}

export default Pager;
