/*
 * Etagi project
 * server entry point
 * o.e.kurgaev@it.etagi.com
 */
import 'babel-polyfill';

import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import {port, env, gzip, context, options, hlm} from './config';
import request from './server/render/request';
import render from './server/render/render';
import proxyMiddleware from 'http-proxy-middleware';
import skipMap from 'skip-map';


const app = global.server = express();
const proxy = proxyMiddleware(context, options);

//
// set port
// -----------------------------------------------------------------------------
app.set('port', port);
app.set('env', env);

//
// set gzip
// -----------------------------------------------------------------------------
app.use(compression(gzip));

//
// set helmetjs default
// ref https://github.com/helmetjs/helmet
// -----------------------------------------------------------------------------
app.use(helmet(hlm));

//
// serve static assets
// -----------------------------------------------------------------------------
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.normalize(path.join(__dirname, '..'))));

//
// The top-level React component
// -----------------------------------------------------------------------------
const assetsFile = path.join(__dirname, 'assets.json');
const vendorsFile = path.join(__dirname, 'vendors/vendors.json');

//
// Get file with assets paths
// -----------------------------------------------------------------------------
const vendors = JSON.parse(fs.readFileSync(vendorsFile, 'utf8'));
const assets = env === 'development' ?
  '' : JSON.parse(fs.readFileSync(assetsFile, 'utf8'));

//
// Tell any CSS tooling to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Server-side rendering
// -----------------------------------------------------------------------------
env === 'development' && app.use(skipMap());

app.enable('trust proxy');

app.use(cors());

app.use(proxy);

app.get('*', (req, res, next) => {
  try {
    sendResponse(req, res, next);
  } catch (error) {
    next(error);
  }
});

//
// use error handler middleware
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  const errorDetails = err.stack || err;
  const exceptionInfo = err.response && err.response.error || '';
  let statusCode = err.status;
  let reqPath = ''; // error page path

  try {
    exceptionInfo.text = exceptionInfo.text ?
      JSON.parse(exceptionInfo.text) : '';
  } catch(e) {

  }

  /* eslint-disable no-console */
  switch (statusCode) {
  case 418:
    reqPath = '/object-not-found/';
    statusCode = exceptionInfo.status = 404;
    console.error('Yay', `Object not found ${req.path}`);
    console.error(`Object not found ${req.path}`);
    break;
  case 404:
    reqPath = '/page-not-found/';
    console.error(`Page not found: ${req.path}`);
    break;
  default:
    reqPath = '/server-error/';
    console.error('Yay', errorDetails, exceptionInfo);
    break;
  }

  res.status(statusCode).format({
    html() {
      sendResponse(req, res, next, statusCode, reqPath, exceptionInfo);
    },

    default() {
      res.send(`${statusCode} Internal server error:\n${errorDetails}`);
    }
  });
});

function sendResponse(req, res, next, statusCode = 200, reqPath, errorInfo) {
  const css = new Set();
  const endpoint = req.hostname !== 'localhost' ?
    `${req.protocol}://${req.hostname}/backend/` :
    `${options.target}/backend/`;

  request(endpoint, reqPath ? reqPath : req.path, req.query).then(response => {
    const {content, meta, header, footer, seo, scripts, seoText, favicon} =
      response;
    const data = global.data = response.data;
    const prfx = req.hostname.match(/^m\..*/) ? 'mobile' : 'main';
    const nameArr = assets === '' ? false : assets[prfx].js.split('.');
    const chunk = nameArr ? `.${nameArr[nameArr.length - 2]}` : '';
    //jade template for top-level react component
    const template = require(`./views/${prfx}Index.jade`);
    const configureStore = require('./core/configureStore');
    const store = configureStore({});
    const propsGlobal = {
      path: req.path,
      dataUrl: req.query,
      context: {
        insertCss: (...styles) => {
          styles.forEach(style => css.add(style._getCss()));
        },
        store: store
      },
      store: store //weeeird
    };

    data.error = errorInfo;
    const pageData = {
      title: meta.title,
      seo: seo,
      scripts: scripts,
      styles: response.css,
      header: render(header, data, propsGlobal),
      body: render(content, data, propsGlobal),
      footer: render(footer, data, propsGlobal),
      js: JSON.stringify(data),
      entry: assets === '' ? `/assets/${prfx}.js` : assets[prfx].js,
      vendors: vendors.vendor.js,
      seoText: seoText,
      favicon: favicon,
      maincss: `/public/${prfx}${chunk}.css`
    };

    pageData.css = [...css].join('');
    res.set({'content-type': 'text/html; charset=utf-8'});
    res.status(statusCode);
    res.send(template(pageData));
  }, error => {
    next(error);
  });
}

//
// Launch the server
// -----------------------------------------------------------------------------
app.listen(app.get('port'), () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://localhost:${app.get('port')}/`);
});
