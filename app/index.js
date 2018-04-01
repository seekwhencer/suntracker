/**
 *  Solar Sun Tracker by Latitude, Longitude, Date and Time
 *
 *  Rotate a Thing by the sun's position. In this example i used
 *  a NodeMCU as HTTP and Websocket client with a ESP8622 chip.
 *  This Apps is the server and works with the LUA-App on the NodeMCU.
 *
 */

(function () {
    var that = this;

    var Config = require('./config/prod.js');
    var Tracker = require('./lib/tracker.js');
    var Server = require('./lib/server.js');

    that.server = new Server({
        core: that,
        options: Config.server
    });

    that.tracker = new Tracker({
        core: that,
        options: Config.tracker
    });

    return {
        server: that.server,
        tracker: that.tracker
    }

})();


