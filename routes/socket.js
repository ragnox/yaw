/*
 * Serve content over a socket
 */
_ = require('underscore');

var client = 0;
var scope = {};
scope.io = {};
scope.io.c = {};

module.exports = function (socket) {

    var id = client++;

    scope.io.c[id] = {
        selection: {id:id}
    };


    socket.emit('client:id', {
        client: id
    });

    socket.emit('io', scope.io);

    socket.on("io", function(d,f,m) {
        console.log("emit io");
        console.log(d);
        _.extend(scope.io, d);
        socket.emit('io', scope.io);
    });

    socket.on('disconnect', function() {
//         delete scope.io.c[id];
    });

    setInterval(function () {
        socket.emit('send:time', {
            time: (new Date()).toString()
        });
    }, 100000);
};
