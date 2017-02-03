/*
 * Etagi project
 * dom utils
 * o.e.kurgaev@it.etagi.com
 */

export function addEventListener(node, event, listener) {
  if (node.addEventListener) {
    node.addEventListener(event, listener, false);
  } else {
    node.attachEvent(`on${event}`, listener);
  }
}

export function removeEventListener(node, event, listener) {
  if (node.removeEventListener) {
    node.removeEventListener(event, listener, false);
  } else {
    node.detachEvent(`on${event}`, listener);
  }
}

/**
 * [simulateClick simulates click on specified DOM node]
 * @param  {object} node DOM node, default document
 * @return {null} none
 */
export function simulateClick(node = document) {
  const evObj = document.createEvent('Events');

  evObj.initEvent('click', true, false);
  node.dispatchEvent(evObj);
}