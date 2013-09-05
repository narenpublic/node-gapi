
/**
 * node-gapi - Simple Lib to access Google Analytics via node.js
 *
 * http://github.com/narenpublic/node-gapi
 * @author Narendra Rocherolle <narenpublic@yahoo.com> twitter: @narendra
 * @version 0.9
 * 
 *  
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

var request = require('request'),
  xm = require('xml-mapping'),
  util = require('util'),
  events = require('events'),
  async = require('async'),
  router = require('./routes/');  

var Gapi = function() {
  
  events.EventEmitter.call(this);

  this.auth_token = null;
  this.routes = null;
  this.config = null;
  
  // Make sure we have a token -- feel free to store them but
  // no current authentication error handling
  this.auth = function(config,token) {
    this.routes = router.routes;
    this.config = config;
    that = this;
    
    if(token === null) {
      console.log('Authenticating...');
      var post_variables = {
	'accountType': 'GOOGLE',
	'Email': config.API_EMAIL,
	'Passwd': config.API_PASSWORD,
	'source': config.INTERFACE,
	'service': config.SERVICE
      }

      route = this.routes.accounts.login;
      this.req(route,post_variables,token, function (error, response, body) {
	      if (!error && response.statusCode == 200) {
		matchtoken = body.match(/.*Auth=(.*)/);
		that.auth_token = matchtoken[1];
//                console.log('Auth token set to:  '+that.auth_token);
                that.emit("validAuth",that);
                console.log ('Auth completed');
	      } else {
                console.log('Failed to login '+response+body);
              }
        });
      
    } else {
      this.auth_token = token;
      this.emit("validAuth",this);
    }
  }
  
  
  // Primary request function  
  this.req = function(route, params, token, callback) {
//    console.log(route);
    if (route.method == 'GET') {
      request.get( {
            'url' : route.url,
            'headers' : {'Authorization': 'GoogleLogin auth='+token},
            'qs' : params
          },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
//            console.log(body);
              var json = xm.load(body);
              callback(json);
            } else {
              callback(body);
            }
          }
      );
    } else if (route.method == 'POST') {
      var that = this;
      request.post(
	  route.url,
	  { form: params },
          callback
      );
    } else {
      console.log('Sorry, request failed because no route.method specified');
    }
  }


  // Sample list of reporting functions
  this.accounts = {
    list: function(gapi,callback){
      console.log('Listing accounts...');
      var params = { 'start-index':1, 'max-results':20 } 
      gapi.req(gapi.routes.accounts.list, params, gapi.auth_token,
        function(json) {
          // need to loop over entries and return them all
          console.log(json);
          console.log('Callback says ga:profileName is '+json.feed.entry[1]['dxp$property'][2].value);
          console.log('Callback says ga:webPropertyId is '+json.feed.entry[1]['dxp$property'][1].value);
          console.log('Callback says ga:profileId is '+json.feed.entry[1]['dxp$property'][3].value);
        });
    },
    // this one should be redone to be this.auth
    login: function(gapi,config, token){
      gapi.auth(config,token);
    },
    report: { pageviews: function(gapi, profileId, start, end, callback){
      console.log('Getting Page Views...');

      var params = {
        'ids':'ga:'+profileId,
        'dimensions':'ga:pagepath', // can have multiples, default null
        'metrics':'ga:uniquepageviews', // can have multiples, default, null
        'sort':'ga:uniquepageviews', // can have multiples, default null
//        'filters':'ga:pagePath=~/signup',
        'filters':'ga:pagePath=@/signup', // default null
        'start-date':start, //default today
        'end-date':end, // default today
        'start-index':1, // default 1
        'max-results':30, // default 1
        'prettyprint':false
      } 
      gapi.req(gapi.routes.accounts.report, params, gapi.auth_token,
        function(json) {
          // need to loop over entries and return them all
//          console.log(json);
          console.log(json.feed.entry[1]['dxp$metric'].value);
        });
    }
    }
  }

}

util.inherits(Gapi,events.EventEmitter);
module.exports = new Gapi();
