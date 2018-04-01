module.exports = {
    server: {
        name: 'WS SERVER',
        log: {},
        web: {
            port: 9696
        },
        ws: {
            port: 9697
        }
    },
    tracker : {
        name: 'TRACKER',
        lat: 52.526101, // for berlin, germany
        lon: 13.388588,
        auto_update: true,
        update_interval: 2000
    }
};