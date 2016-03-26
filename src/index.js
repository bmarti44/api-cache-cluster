'use strict';

var url = require('url'),
  clusterCache,
  crypto = require('crypto');

function ApiCacheCluster() {
  let module = {};

  module.cache = (req, res, next) => {
    let key = crypto.createHash('md5').update(req.url).digest("hex");
    
    clusterCache.get(key).then((cachedResult) => {
      if(cachedResult.err) {
        console.log(cachedResult.err);
      }

      if (cachedResult.value[key]) {
        return res.send(cachedResult.value[key].body);
      }

      res.realSend = res.send;

      res.send = (a, b) => {
        let responseObj = {
            headers: {
              'Content-Type': 'application/json; charset=utf-8'
            }
          },
          headers = ['Cache-Control', 'Expires'];

        responseObj.status  = b ? a : a ? a : res.statusCode;
        responseObj.body    = b ? b : a ? a : null;

        headers.forEach((h) => {
          let header = res.get(h);
          if (!header) {
            responseObj.headers[h] = header;
          }
        });

        if (!cachedResult.value[key]) {
          clusterCache.set(key, responseObj).then((result) => {
            console.log(`Successfully set ${req.url} in cache!`);
          });
        }
        return res.realSend(responseObj.body);
      };
      next();
    });
  };

  return module;
}

module.exports = (cluster, config) => {
  clusterCache = require('cluster-node-cache')(cluster, config);
  return new ApiCacheCluster();
};
