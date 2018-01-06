'use strict';
const os = require('os');
const fs = require('fs');
const https = require('https');
const cp = require('child_process');
const httpStatus = require('http-status');
const chalk = require('chalk');


// I. global variables
const A = process.argv;
var output = null, retries = 4;
var connections = 4, timegap = 250;
var verbose = false;
var primary = () => {};


// II. log functions
const logSill = (msg) => { if(verbose) console.log(chalk.gray(msg)); };
const logVerb = (msg) => { if(verbose) console.log(chalk.yellowBright(msg)); };
const logErr = (msg) => { if(verbose) console.log(chalk.redBright(msg)); };



const request = (opt) => new Promise((fres, frej) => {
  // 1. make request to website
  logSill(`> GET https://${opt.hostname}${opt.path}`);
  var req = https.request(opt, (res) => {
    res.setEncoding('utf8');
    var dat = '', code = res.statusCode, status = httpStatus[code];
    logSill(`< https://${opt.hostname}${opt.path} : ${code} ${status}`);
    res.on('data', (chu) => dat += chu);
    res.on('end', () => {
      if(code>=200 && code<300) fres(dat);
      else frej(new Error(code+' '+status));
    });
  });
  req.on('error', (e) => frej(e));
  req.end();
});


// IV. command-line
const fetch = (err, id) => primary(id).then((dat) => {
  logVerb(`${id}: ${dat['Number']}, ${dat['Name']} - ${Object.keys(dat).length} properties`);
  if(output==null) console.log(JSON.stringify(dat));
  else output.write(JSON.stringify(dat)+os.EOL);
}, (e) => {
  logErr(`${id}: ${e.message}`);
  err.push(id);
});

const fetchall = (ids, tim) => new Promise((fres) => {
  var i = 0, I = ids.length, con = 0, pro = [], err = [];
  var tmr = setInterval(() => {
    if(i<I) return con<connections? pro[i] = (con++ && fetch(err, ids[i++]).then(() => con--)):null;
    Promise.all(pro).then(() => fres(err));
    clearInterval(tmr);
  }, tim);
});

const run = (ids) => new Promise((fres) => {
  function step(ids) {
    if(--retries<0 || ids.length===0) fres(ids);
    else fetchall(ids, timegap*=2).then(step);
  };
  timegap /=2;
  retries++;
  step(ids);
});

const main = (opt) => {
  // 1. set options
  if(opt.output!==undefined) output = opt.output;
  if(opt.retries!==undefined) retries = opt.retries;
  if(opt.connections!==undefined) connections = opt.connections;
  if(opt.timegap!==undefined) timegap = opt.timegap;
  if(opt.verbose!==undefined) verbose = opt.verbose;
  if(opt.primary!==undefined) primary = opt.primary;
  // 2. process arguments
  var values = [], job = [];
  for(var i=2, I=A.length; i<I; i++) {
    if(A[i]==='-o' || A[i]==='--output') output = fs.createWriteStream(A[++i]);
    else if(A[i]==='-c' || A[i]==='--connections') connections = parseInt(A[++i], 10);
    else if(A[i]==='-t' || A[i]==='--timegap') timegap = parseInt(A[++i], 10);
    else if(A[i]==='-r' || A[i]==='--retries') retries = parseInt(A[++i], 10);
    else if(A[i]==='-v' || A[i]==='--verbose') verbose = true;
    else if(A[i]==='--help') return cp.execSync(`less ${__dirname}/README.md`, {stdio: [0, 1, 2]});
    else values.push(A[i]);
  }
  // 3. run job
  var start = parseInt(values[0], 10)||0, stop = parseInt(values[1], 10)||start+1;
  logVerb(`Fetching ${start} -> ${stop}:`);
  logVerb(`- output file: ${output}`);
  logVerb(`- connections: ${connections}`);
  logVerb(`- timegap:     ${timegap} ms`);
  logVerb(`- retries:     ${retries}`);
  for(var i=start; i<stop; i++)
    job[i-start] = i.toString();
  run(job).then((err) => {
    logVerb(`${start} -> ${stop} done; ${job.length-err.length} passed, ${err.length} failed.`);
    if(err.length>0) console.error(err.length, err);
    if(output!=null) output.end();
  });
};
module.exports = {logSill, logVerb, logErr, request, main};
