'use strict';

var cluster = require('cluster'),
  os = require('os'),
  apicachecluster = require('../src/index.js')(cluster, {stdTTL: 5, checkperiod: 5}),
  restify = require('restify');

class ApiCacheClusterTest {
  constructor() {
    this.app = restify.createServer({
      name: 'api-cache-cluster-test',
      version: '0.1.1'
    });
  }

  start() {

    this.app.use(apicachecluster.cache);
    this.app.use(restify.acceptParser(this.app.acceptable));
    this.app.use(restify.queryParser());
    this.app.use(restify.bodyParser());

    this.app.get('/', (req, res, next) => {
      console.log('This request was not cached!');
      res.send('Testing cache');
      next();
    });

    this.app.listen(10000, () => {
      console.log(`${this.app.name} listening at ${this.app.url}`);
    });
  }
}

{
  if(cluster.isMaster) {
    var cpus = os.cpus().length;

    console.log(`Master cluster setting up ${cpus} workers...`);

    for(let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on('online', (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
  });

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
      console.log('Starting a new worker');
    cluster.fork();
  });
  } else {
    let apicacheclustertest = new ApiCacheClusterTest();
    apicacheclustertest.start();
  }
}
