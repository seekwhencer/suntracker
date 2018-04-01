const express = require('express');
const router = express.Router();

const Health = require('../lib/internal/health.js');
const Metrics = require('../lib/internal/metrics.js');
const Ping = require('../lib/internal/ping.js');
const Release = require('../lib/internal/release.js');

router.get('/', function (req, res) {
    res.json({
        available: {
            release: 'internal/release',
            health: 'internal/health',
            metrics: 'internal/metrics',
            ping: 'internal/ping'
        }
    });
});

router.get('/release', function (req, res) {
    var release = new Release();
    res.send(release.is());
});

router.get('/metrics', function (req, res) {
    var metrics = new Metrics();
    res.json(metrics);
});

router.get('/health', function (req, res) {
    var health = new Health();
    res.json(health);
});

router.get('/ping', function (req, res) {
    var ping = new Ping();
    if (ping.is() === true) {
        res.send('pong');
    } else {
        res.send('');
    }
});

module.exports = router;