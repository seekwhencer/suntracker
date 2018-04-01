-- SETUP
server.ws = {}
server.ws.protocol = 'ws'
server.ws.host = '25.25.25.1'
server.ws.port = 9697
server.ws.endpoint = ''
server.ws.connected = false
server.ws.url = server.ws.protocol .. '://' .. server.ws.host .. ':' .. server.ws.port

check_interval = 100 -- check every x milliseconds the rotation

max_left_raw = 943 -- the maximum (minimum) raw value
max_right_raw = 14 -- the maximum raw value
max_left_azimuth = -110 -- the real maximum possible rotation of the panel to the left
max_right_azimuth = 110 -- the real maximum possible rotation of the panel to the right

range_azimuth = (max_left_azimuth * -1) + max_right_azimuth
range_raw = max_left_raw - max_right_raw
center_raw = range_raw / 2
azimuth_per_raw = range_azimuth / range_raw


-- CALCULATED VALUES
raw = 0
azimuth = 0
azimuth_last = 0
to = 0 -- to azimuth
to_offset = 5;
is_moving = false;


-- LITTLE HELPERS
function update()
    raw = adc.read(0)
    azimuth = round(max_left_azimuth + ((max_left_raw - raw) * azimuth_per_raw), 1);
    checkStop()
end

function rotate(_to)
    to = tonumber(_to)
    if(to < 0 and to < max_left_azimuth) then
        to = max_left_azimuth
    end
    if(to > 0 and to > max_right_azimuth) then
        to = max_right_azimuth
    end

    if (to < azimuth) then
        return left()
    end

    if (to > azimuth) then
        return right()
    end
end

function left()
    if (azimuth > to + to_offset and azimuth > (max_left_azimuth + to_offset)) then
        is_moving = true;
        gpio.write(4, gpio.HIGH)
        gpio.write(1, gpio.HIGH)
        gpio.write(2, gpio.LOW)
        print(' ROTATION LEFT TO', to, 'FROM', azimuth)
    end
end

function right()

    if (azimuth < to - to_offset and azimuth < (max_right_azimuth - to_offset)) then
        is_moving = true;
        gpio.write(4, gpio.HIGH)
        gpio.write(1, gpio.LOW)
        gpio.write(2, gpio.HIGH)
        print(' ROTATION RIGHT TO', to, 'FROM', azimuth)
    end
end

function stop()
    if (is_moving == true) then
        is_moving = false;
        gpio.write(1, gpio.LOW)
        gpio.write(2, gpio.LOW)
        gpio.write(4, gpio.LOW)
        print(' STOPPING MOVEMENT AT', azimuth)
    end
end

function checkStop()
    if (to < azimuth + to_offset and to > azimuth - to_offset) then
        return stop()
    end

    if (azimuth < 0 and azimuth < (max_left_azimuth + to_offset)) then
        return stop()
    end

    if (azimuth > 0 and azimuth > (max_right_azimuth + to_offset)) then
        return stop()
    end
end

function round(a, prec)
    return math.floor(a + 0.5 * prec)
end


-- GPIO SETUP
gpio.mode(1, gpio.OUTPUT)
gpio.mode(2, gpio.OUTPUT)
gpio.mode(4, gpio.OUTPUT)


-- WEBSOCKET CLIENT SETUP
ws = websocket.createClient()
ws:on("connection", function(ws)
    server.ws.connected = true
    print(' WS CONNECTION STABLISHED TO: ' .. server.ws.url)
end)
ws:on("receive", function(_, msg, opcode)
    -- print(' WS GOT MESSAGE:', msg, opcode) -- opcode is 1 for text message, 2 for binary
    rotate(msg)
end)
ws:on("close", function(client, status)
    server.ws.connected = false
    print(' WS CONNECTION CLOSED', status)
    tmr.delay(5000000)
    ws:connect(server.ws.url)
end)
ws:connect(server.ws.url)


-- TIMER INTERVAL
tmr.register(0, check_interval, tmr.ALARM_AUTO, function()
    update()
    local send_data = '{"action": "status", "data": {"azimuth":"' .. azimuth .. '", "raw": "' .. raw .. '"}}'
    if (server.ws.connected == true) then
        if (azimuth ~= azimuth_last) then
            print(" AZIMUTH: " .. azimuth .. " | RAW: " .. raw .. "| RANGE AZIMUTH: " .. range_azimuth .. " | RANGE RAW: " .. range_raw .. " | CENTER RAW: " .. center_raw .. " | AZIMUTH PER RAW: " .. azimuth_per_raw)
            ws:send(send_data)
        end
        azimuth_last = azimuth
    end
end)
tmr.start(0)



-- STOP INITIALLY MOTOR
stop()
