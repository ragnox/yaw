'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('yawApp.services', []).
    value('version', '0.1').

    factory('util', function ($rootScope) {
        return {
            diff: function(o1, o2) {
                return function(o1, o2) {
                    var k, kDiff,
                        diff = {};
                    for (k in o1) {
                        if (!o2.hasOwnProperty(k)) {
                            diff[k] = null;
                        }
                        else if (k == '$$hashKey') {

                        } else if (!_.isObject(o2[k]) && !_.isArray(o2[k])) {
                            if (!(k in o2) || o1[k] !== o2[k]) {
                                diff[k] = o2[k];
                            }
                        } else if (_.isArray(o2[k])) {
//                            diff[k] = o2[k];
                        } else if (kDiff = this(o1[k], o2[k])) {
                            diff[k] = kDiff;

                            diff.id = o1.id;
                        }
                    }
                    for (k in o2) {
                        if (o2.hasOwnProperty(k) && !(k in o1) && k != '$$hashKey') {
                            diff[k] = o2[k];
                        }
                    }
                    for (k in diff) {
                        if (diff.hasOwnProperty(k)) {
                            return diff;
                        }
                    }
                    return false;
                };
            }
        };
    }).
    factory('socket', function ($rootScope) {
        var socket = io.connect();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });
