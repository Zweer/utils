import config from 'config';
import moment from 'moment';
import winston from 'winston';

// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

function timestamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS Z');
}

function loggerFactory(label) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        json: true,
        label,
        level: label === 'server' ? 'warn' : config.get('log.level'),
        timestamp,
      }),
    ],
  });
}

const log = {};

log.labels = [
  'default',
  'server',
  'db',
  'aws',
  'jobs',
  'telegram',
  'analyticsFrame',
];

log.labels.forEach((label) => {
  log[label] = loggerFactory(label);
});

Object.keys(log.default.levels).forEach((level) => {
  log[level] = log.default[level];
});

export default log;
