export default (DEBUG, VERBOSE) => ({
  colors: true,
  reasons: DEBUG,
  hash: VERBOSE,
  version: VERBOSE,
  timings: true,
  chunks: VERBOSE,
  chunkModules: VERBOSE,
  cached: VERBOSE,
  cachedAssets: VERBOSE,
});
