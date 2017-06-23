'use strict';

var g = require('./helpers')(),
    log = g.log('server');

process.title = 'find-me-a-room-server';
process.on('SIGINT', function() {
    g.shutdown();
});
process.on('message', function(msg) {
    if(msg === 'shutdown') {
        g.shutdown();
    }
});