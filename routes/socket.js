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

    scope.io.c = scope.io.c[id] || {};
    scope.io.c[id] = {
        id:id,
        selection: {id:id}
    };


    socket.emit('client:id', {
        client: id
    });

    socket.emit('update', scope.io);

    socket.on("io", function(d,f,m) {
        console.log("emit io");
        console.log(d);

        scope.io = d;
//        _.extend(scope.io, d);
        socket.broadcast.emit('update', d);
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
