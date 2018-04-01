var Event = require('events');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var WebSocket = require('ws');
var Log = require('./log.js');

const api = require('../endpoints/api.js');
const internal = require('../endpoints/internal.js');

module.exports = function (args) {
    var that = this;
    var core = null;
    var app = null;
    var defaults = {
        name: 'WS SERVER',
        log: {},
        web: {
            port: 9696
        },
        ws: {
            port: 9697
        }
    };
    var log = new Log();
    this.event = new Event();
    this.options = defaults;
    this.ready = {
        web: false,
        ws: false
    };

    if (args) {
        if (args.core)
            core = args.core;

        if (args.app)
            app = args.app;

        if (args.options)
            if (typeof args.options === 'object')
                this.options = Object.assign({}, defaults, args.options);
    }
    this.web = null;
    this.ws = null;
    this.connection = null;

    this.init = function () {
        that.on('ready', function (port) {
            log('', that.options.name, 'READY');
        });
        that.on('web-ready', function (port) {
            log('', that.options.name, '|', 'WEB READY ON PORT:', port);
            that.ready.web = true;
            that.checkReady();
        });
        that.on('ws-ready', function (port) {
            log('', that.options.name, '|', 'WEBSOCKET READY ON PORT:', port);
            that.ready.ws = true;
            that.checkReady();
        });
        that.on('connection', function (conn) {
            log('', that.options.name, '|', 'CONNECTED:', conn._socket.remoteAddress);
        });
        that.on('message', function (conn, message) {
            //log('', that.options.name, '|', 'CONNECTION', conn._socket.remoteAddress, 'MESSAGE', message);
        });
        that.on('trigger', function (req, res) {
            //log('', 'HTTP TRIGGER:', JSON.stringify(req.body));
        });

        that.initWeb();
        that.initWebsocket();
    };

    this.initWeb = function () {
        if (!app) {
            app = express();
        }
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        app.post('/trigger', function (req, res) {
            that.emit('trigger', req, res);
            res.json(true);
        });

        //
        app.use('/internal', internal);
        app.use('/api', api);
        app.use('/', express.static('statics'));

        that.web = app.listen(that.options.web.port, function () {
            that.emit('web-ready', that.web.address().port);
        });
    };

    this.initWebsocket = function () {
        that.ws = new WebSocket.Server(that.options.ws, function () {
            that.emit('ws-ready', that.ws.address().port);
        });
        that.ws.on('connection', function (conn) {
            that.connection = conn;
            that.connection.on('message', function (message) {
                that.emit('message', that.connection, message);
            });
            that.emit('connection', that.connection);
        });

        that.ws.on('close', function(conn) {
            console.log('disconnected');
        });
    };

    this.checkReady = function () {
        if (that.ready.web && that.ready.ws)
            that.emit('ready');
    };

    this.sendWS = function (data) {
        if(that.connection) {
            try {
                that.connection.send(JSON.stringify(data));
            } catch (e) {
                log('SENDING ERROR', e);
            }
        }
    };

    this.sendToAllWS = function(){

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
        ws: that.ws,
        web: that.web,
        sendWS: that.sendWS,
        sendToAllWS: that.sendToAllWS
    };

};