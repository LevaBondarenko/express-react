import Immutable from 'immutable';

export default function initReducer(reducer) {
  return Immutable.fromJS(
    reducer, (key, value) => Immutable.Iterable.isIndexed(value) ?
      value.toList() : value.toOrderedMap()
  );
};
