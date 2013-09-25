'use strict';

/* Controllers */

function AppCtrl($scope, socket) {
//    socket.on('client:id', function (data) {
//
//    });
    socket.on('send:time', function (data) {
        $scope.time = data.time;
    });
}
