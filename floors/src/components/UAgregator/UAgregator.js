/**
 * UAgregator widget class
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */
 /**
  * devDependencies
  */
import React, {Component, PropTypes} from 'react';
import mss from '../../stores/ModularSearcherStore';
import ContextType from '../../utils/contextType';
/**
 * components
 */
import {forEach, size, intersection} from 'lodash';
import {declOfNum} from '../../utils/Helpers';
/**
 *  styles
 */
import s from './UAgregator.scss';
import withCondition from '../../decorators/withCondition';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';

class UAgregator extends Component {

  static propTypes = {
    gparams: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    params: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    functions: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    mainParam: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    text: PropTypes.string,
    replacement: PropTypes.string,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    selfUpdate: PropTypes.bool,
    model: PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ])
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    /*global data*/
    const gdata = [];

    forEach(props.gparams, (param) => {
      gdata[param] = param.split('.').reduce((a, b) => a[b], data);
    });
    let textT = props.text;

    if (!props.mainParam || (props.mainParam && (!props.mainParam.data ||
    (props.mainParam.data &&
    props.mainParam.data.split('.').reduce((a, b) => a[b], data))))) {
      const regexp = new RegExp('\\${([^$]*)}', 'ig');
      let match;

      while (match = regexp.exec(props.text)) {
        const gparam = match[1].replace('data.', '');

        if (gdata[gparam]) {
          textT = textT.replace(match[0], gdata[gparam]);
        }
      }
    } else {
      textT = props.replacement;
    }

    this.text = textT;
    this.state = {
      wssModel: [],
      wssData: [],
      fWssData: [],
      mssModel: [],
      mssData: [],
      fMssData: []
    };

  }

  componentDidMount() {
    mss.onChange(this.mssOnChange);

    if (this.props.selfUpdate) {
      this.processProps(this.props);
    }
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
    mss.offChange(this.mssOnChange);
  }

  mssOnChange = () => {
    const {params, functions} = this.props;
    const model = mss.get();
    const mssData = {};
    const fMssData = {};

    forEach(params, (fields, objectName) => {
      if (objectName === 'MSS') {
        forEach(fields, fieldName => {
          if (model[fieldName]) {
            const field = model[fieldName];
            const dataType = typeof(field);
            const actualCount = dataType === 'array' || dataType === 'object' ?
              size(field) :
              (dataType === 'string' || dataType === 'number' ?
                field :
                0);

            mssData[fieldName] = actualCount;
          }
        });
      }
    });

    forEach(functions, (func, funcName) => {
      if (funcName === 'don') {
        forEach(func, fps => {
          if (fps.obj === 'MSS' && model[fps.field]) {
            const fieldName = `MSS:${fps.field}`;

            if (!fMssData[fieldName]) {
              fMssData[fieldName] = [];
            }
            fMssData[fieldName].push(
              declOfNum(model[fps.field], fps.vars));
          }
        });
      }
    });

    this.setState({
      mssModel: model,
      mssData: mssData,
      fMssData: fMssData
    });
  }

  componentWillReceiveProps(nextProps) {
    this.processProps(nextProps);
  }

  processProps = props => {
    const {params, functions, model} = props;
    const wssData = {};
    const fWssData = {};

    forEach(params, (fields, objectName) => {
      if (model[objectName]) {
        const fieldData = {};

        forEach(fields, fieldName => {
          if (model[objectName][fieldName]) {
            const field = model[objectName][fieldName];
            const dataType = typeof(field);

            fieldData[fieldName] = dataType === 'array' ||
              dataType === 'object' ?
              size(field) :
              (dataType === 'string' || dataType === 'number' ?
                field :
                0);
          }
        });
        wssData[objectName] = fieldData;
      }
    });

    forEach(functions, (func, funcName) => {
      if (funcName === 'don') {
        const field = {};

        forEach(func, fps => {
          if (model[fps.obj] && model[fps.obj][fps.field]) {
            const fieldName = `${fps.obj}:${fps.field}`;

            if (!field[fieldName]) {
              field[fieldName] = [];
            }
            field[fieldName].push(
              declOfNum(model[fps.obj][fps.field], fps.vars));
          }
        });
        fWssData[funcName] = field;
      }
    });

    this.setState({
      wssModel: model,
      wssData: wssData,
      fWssData: fWssData
    });
  }

  get formattedText() {
    const {wssModel, wssData, fWssData, mssModel, mssData, fMssData} =
      this.state;
    const regexp = new RegExp('\\${([^$]*)}', 'ig');
    const {mainParam, replacement} = this.props;
    let text = this.text;
    let match;

    if (!mainParam || (mainParam && (!mainParam.obj || (mainParam.obj &&
    ((wssModel[mainParam.obj] && wssModel[mainParam.obj][mainParam.field]) ||
    (mainParam.obj === 'MSS' && mssModel[mainParam.field])))))) {
      while (match = regexp.exec(this.text)) {
        let newSubStr = '';
        const fparams = match[1].split(',');

        if (fparams.length === 3) {
          const fparam = fWssData[fparams[0]] &&
            fWssData[fparams[0]][fparams[1]] ?
              fWssData[fparams[0]][fparams[1]] :
              fMssData[fparams[1]] ? fMssData[fparams[1]] : '';

          newSubStr = intersection(fparam, fparams[2].split('|'));
        } else {
          const objfield = match[1].split(':');

          if (objfield) {
            newSubStr = wssData[objfield[0]] &&
            wssData[objfield[0]][objfield[1]] ?
              wssData[objfield[0]][objfield[1]] :
              mssData[objfield[1]] ? mssData[objfield[1]] : '';
          }
        }

        text = text.replace(match[0], newSubStr);
      }
    } else {
      text = replacement;
    }

    return text;
  }

  render() {
    return (
      <div dangerouslySetInnerHTML={{__html: this.formattedText}} />
    );
  }

}

function mapStateToProps(state) {
  return {
    model: state.objects.toJS()
  };
}

UAgregator = connect(mapStateToProps)(UAgregator);
UAgregator = withCondition()(UAgregator);

export default UAgregator;
