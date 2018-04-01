# suntracker
This is a Node.js app to control a one axis sun tracker by using latitude, longitude, date and time.
 
This app runs on a command and control computer like a Raspberry Pi 3 and communicate with
a **NodeMCU** module via websockets.
 
![ScreenShot](/docs/seele.jpg?raw=true "Solar Panel")
![ScreenShot](/docs/inner.jpg?raw=true "Seele")
 
## Setup

```bash
cd /my/projects/rootfolder
 

git clone ... suntracker
cd suntracker
npm install
```

## Start

```bash
npm start
```

## Needs

- NodeMCU
- 100 Ohm Pot
- L298N
- DC Down converter with USB and soldered output

## Watch this documentation (german)

> https://docs.google.com/document/d/1_xv6BJOvg2tKAK0UAu02wwiqLuZEJGaxQMHlU8f96E8

## NodeMCU

- use **ESP8266Flasher.exe** to flush the firmware (Windows)
- use **ESPlorer** to speak with the module


