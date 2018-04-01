var Event = require('events');
var SunCalc = require('suncalc');
var Log = require('./log.js');

module.exports = function (args) {

    var that = this;
    var core = null;
    var defaults = {
        name: 'TRACKER',
        lat: 52.526101, // for berlin, germany
        lon: 13.388588,
        auto_update: true,
        update_interval: 2000
    };
    var log = new Log();
    this.event = new Event();
    this.options = defaults;

    if (args) {
        if (args.core)
            core = args.core;

        if (args.options)
            if (typeof args.options === 'object')
                that.options = Object.assign({}, defaults, args.options);
    }

    this.time = null;
    this.sun = {
        position: null,
        azimuth: null,
        sunrise: null,
        sunset: null,
        now: null
    };
    that.update_interval = null;

    this.init = function () {
        that.getPosition();
        if (that.options.auto_update === true) {
            that.update_interval = setInterval(function () {
                that.getPosition();
            }, that.options.update_interval);
        }
        that.on('update', function () {
            core.server.sendWS(that.sun.azimuth); // <-- that sends the calculated azimuth to the panel
            /*log('',
                that.options.name, '|',
                'TIME:', that.sun.now, '|',
                'AZIMUTH:', that.sun.azimuth, '|',
                'SUNRISE:', that.sun.azimuth_sunrise, '|',
                'SUNSET:', that.sun.azimuth_sunset, '|',
                'DIFF SUNRISE:', that.sun.azimuth_diff_sunrise, '|',
                'DIFF SUNSET:', that.sun.azimuth_diff_sunset, '|',
                'RANGE:', that.sun.range);*/
        });
    };

    /**
     * get sun's position
     * @param date = new Date()
     */
    this.getPosition = function (date) {
        if (!date) {
            var now = new Date();
        } else {
            var now = date;
        }
        that.sun.now = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
        that.sun.position = SunCalc.getPosition(now, that.options.lat, that.options.lon);
        that.sun.azimuth_raw = that.sun.position.azimuth * 180 / Math.PI;
        that.sun.azimuth = parseInt(that.sun.azimuth_raw);


        that.time = SunCalc.getTimes(now, that.options.lat, that.options.lon);
        that.sun.sunrise = that.time.sunrise.getHours() + ':' + that.time.sunrise.getMinutes();
        that.sun.sunset = that.time.sunset.getHours() + ':' + that.time.sunset.getMinutes();

        var position_sunset = SunCalc.getPosition(that.time.sunset, that.options.lat, that.options.lon);
        var position_sunrise = SunCalc.getPosition(that.time.sunrise, that.options.lat, that.options.lon);
        that.sun.azimuth_sunrise_raw = position_sunrise.azimuth * 180 / Math.PI;
        that.sun.azimuth_sunrise = parseInt(that.sun.azimuth_sunrise_raw);
        that.sun.azimuth_sunset_raw = position_sunset.azimuth * 180 / Math.PI;
        that.sun.azimuth_sunset = parseInt(that.sun.azimuth_sunset_raw);

        if (that.sun.azimuth <= 0) {
            that.sun.azimuth_diff_sunset = (that.sun.azimuth_sunrise * -1) - that.sun.azimuth;
            that.sun.azimuth_diff_sunrise = (that.sun.azimuth_sunrise * -1) - that.sun.azimuth_diff_sunset + that.sun.azimuth_sunset;
        } else {
            that.sun.azimuth_diff_sunrise = (that.sun.azimuth_sunrise * -1) + that.sun.azimuth;
            that.sun.azimuth_diff_sunset = that.sun.azimuth_sunset - that.sun.azimuth;
        }

        that.sun.range = (that.sun.azimuth_sunrise * -1) + that.sun.azimuth_sunset;
        that.emit('update', that.sun);
    };

    // on event wrapper
    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };

    // emit event wrapper
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    that.init();

    return {
        on: that.on,
        emit: that.emit,
        time: that.time,
        sun: that.sun,
        update: that.getPosition
    };

};