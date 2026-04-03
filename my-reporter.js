// my-reporter.cjs
const { writeFileSync } = require('node:fs');

const issues = [];

function getReporter(_settings) {
  return {
    issue(issue) {
      issues.push(issue.text);
    },
    result(_result) {
      const unique = [...new Set(issues)];
      writeFileSync('unknown-words.txt', unique.join('\n'), 'utf8');
    },
    error() {},
    info() {},
    debug() {},
    progress() {},
  };
}

module.exports = { getReporter };