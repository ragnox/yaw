/*
 * Serve content over a socket
 */
_ = require('underscore');

var fs = require("fs");


// And then, to read it...

try {
    scope = require("./scope.json");
} catch(e) {

}


var client = 0;


module.exports = function (socket) {

    var id = client++;

    if(!typeof scope != 'object') {
        scope = {};
        socket.emit("io", scope);
    }

    if(!scope.io) {
        scope.io = {};
        scope.io.c = {};
    }
    scope.io.c = scope.io.c || {};
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


        fs.writeFile( "scope.json", JSON.stringify( scope ), "utf8" , function() {

            scope = d;
        });
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
