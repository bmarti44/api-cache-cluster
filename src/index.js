'use strict';

var url = require('url'),
  clusterCache;

function ApiCacheCluster() {
  let module = {};

  module.cache = (req, res, next) => {
    console.log(clusterCache);
    module.test();
    next();
  };

  module.test = () => {
    console.log('test called!');
  };

  return module;
}

module.exports = (cluster) => {
  clusterCache = require('cluster-node-cache')(cluster);
  return new ApiCacheCluster();
};
