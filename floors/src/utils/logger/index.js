/**
 * simple logging function
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */
import http from 'http';
import xhrSimpleDataSerializer from 'fbjs/lib/xhrSimpleDataSerializer';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
const env = canUseDOM ? require('../../utils/Helpers').getEnv() : 'production';

/**
 * simple http request to logger
 * @param {string} basePath pathname of request
 * @param {object} data all necessasry parameters for log
 * @return {object} return new promice
 */
export default async (basePath, data) => new Promise((resolve, reject) =>
  env !== 'dev' ? http
    .get(`${basePath}?${xhrSimpleDataSerializer(data)}`, res => resolve(res))
    .on('error', err => reject(err)) : false
);
