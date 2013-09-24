/*
 * Serve content over a socket
 */

module.exports = function (socket) {
    socket.emit('send:name', {
        name: 'Bob'
    });
    socket.on("cs:update", function(d,f,m) {
        console.log(d);
        socket.broadcast.emit('cs:update', d);
    });

    setInterval(function () {
        socket.emit('send:time', {
            time: (new Date()).toString()
        });
    }, 100000);
};
