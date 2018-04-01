station_cfg = {}
station_cfg.ssid = "..."
station_cfg.pwd = "..."
station_cfg.save = true
function wait_for_wifi_conn()
    tmr.alarm(1, 1000, 1, function()
        if wifi.sta.getip() == nil then
            print(" WAITING FOR WIFI CONNECTION...")
        else
            tmr.stop(1)
            print(" ESP8266 MODE: " .. wifi.getmode())
            print(" MAC ADDRESS: " .. wifi.ap.getmac())
            print(" IP: " .. wifi.sta.getip())
        end
    end)
end
wifi.setmode(wifi.STATION)
wifi.sta.config(station_cfg)
wifi.sta.autoconnect(1)
wait_for_wifi_conn()
