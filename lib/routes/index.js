exports.routes = {
  accounts : {
    list: {'url':'https://www.googleapis.com/analytics/v2.4/management/accounts/~all/webproperties/~all/profiles','method':'GET'},
    login: {'url':'https://www.google.com/accounts/ClientLogin','method':'POST'},
    report: {'url':'https://www.googleapis.com/analytics/v2.4/data','method':'GET'}
    }
};