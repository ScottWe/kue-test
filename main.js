var config = require('./config.json');
var kue = require('kue');

var JOB_NAME = 'concurrentTasks';

var id = config.id;
if (process.argv.length > 2) {
  id = process.argv[2]
}

var queue = kue.createQueue({
  prefix: 'concurrencytest',
    redis: {
      port: config.port,
      host: config.addr
  }
});

var offset = (id - 1) * config.count;
for (let i = 1; i <= config.count; ++i) {
  queue.create(JOB_NAME, { val: offset + i })
       .priority(offset + i)
       .save();
}

queue.process(JOB_NAME, 1, function(job, done) {
  func(job, done);
});

function timedLog(msg) {
  var date = (new Date()).toString();
  console.log('[' + date + ', ' + id + ']: ' + msg);
}

function func(job, done) {
  setTimeout(() => {
    timedLog('Job ' + job.data.val + '. Phase 1/3');
    
    setTimeout(() => {
      timedLog('Job ' + job.data.val + '. Phase 2/3');

      setTimeout(() => {
      	timedLog('Job ' + job.data.val + '. Phase 3/3');

      	done();
      }, 3333);
    }, 3333);
  }, 3333);
}
