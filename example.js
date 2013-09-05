// sample script to grab some reporting data
// once you have a valid auth you can start paking requests
var g = require('../node-gapi');

// your account email and password will generate a token and log it to the console
// you can paste it here inside single quotes as a string and avoid logging in every time
var token = null;
//var token = '';

// you need a profildId and can get yours by calling g.accounts.list(gapi, function(res) { console.log(res); });
var profileId = '72985924'; 

g.on("validAuth",function(gapi) {
    // make data requests here!
//    console.log('validAuth emitted');
    g.accounts.list(gapi, function(res) { console.log(res); });
    g.accounts.report.pageviews(gapi, profileId, '2013-09-03', '2013-09-03', function(res) { console.log(res); }); 
});

// be sure to edit lib/config.sample.js and rename it to config.js!
g.accounts.login(g,require('./lib/config'),token);
