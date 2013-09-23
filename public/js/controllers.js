'use strict';

/* Controllers */

function AppCtrl($scope, socket) {
    socket.on('send:name', function (data) {
        $scope.name = data.name;
    });
    socket.on('send:time', function (data) {
        $scope.time = data.time;
    });
}
