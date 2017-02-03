/**
 * helpers for yandex maps
 */

const defaultTemplate = '<div class="newhousecard">' +
'<a class="close" href="#">&times;</a>' +
'<div class="newhousecard--body">' +
'$[[options.contentLayout observeSize minWidth=315 maxWidth=315]]' +
'</div>' +
'</div>';

export const lkTemplate = '<div class="lkcard">' +
'<div class="lk--body">' +
'$[[options.contentLayout observeSize' +
'minWidth=215 minHeight=110 maxWidth=215]]' +
'</div>' +
'</div>';

export default defaultTemplate;
