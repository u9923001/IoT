package main

import (
	//	"fmt"
	"./serial"
	"bytes"
	"strconv"
	"strings"
	"time"
)

type Nmea struct {
	Date      string
	Time      string
	NumSat    string
	Latitude  string
	Longitude string
	Altitude  string
	Speed     string
}

type THmp struct {
	Pm1         uint16
	Pm25        uint16
	Pm10        uint16
	Temperature int16
	Humidity    int16
}

//Decode gps
func decodeGps(raw string, NmeaBuf *Nmea) {
	line := strings.Split(raw, ",")
	t := strings.Split(line[0], "")

	if 5 <= len(t) {
		temp := t[2:5]
		switch strings.Join(temp, "") {
		case "GGA":
			NmeaBuf.Time = line[1]
			NmeaBuf.Latitude = line[2]
			NmeaBuf.Longitude = line[4]
			NmeaBuf.NumSat = line[7]
			NmeaBuf.Altitude = line[9]
			sat, err := strconv.Atoi(line[7])
			if (err != nil) || (sat <= 3) {
				Gps_test = true
				if err != nil {
					dbgErr("106", err)
					return
				}
			} else {
				Gps_test = false
				we := line[3]
				ns := line[5]
				NmeaBuf.Latitude = latlngToDecimal(NmeaBuf.Latitude, we, true)
				NmeaBuf.Longitude = latlngToDecimal(NmeaBuf.Longitude, ns, true)
			}
		case "RMC":
			NmeaBuf.Date = line[9]
			NmeaBuf.Speed = line[7]
		}

		updateGPS(NmeaBuf)
	}
}

//Updata SensorBuf gps data
func updateGPS(NmeaBuf *Nmea) {
	SensorBuf.Lock.Lock()
	defer SensorBuf.Lock.Unlock()

	if Gps_test {
		SensorBuf.Latitude = ConfigBuf.Test_lat
		SensorBuf.Longitude = ConfigBuf.Test_lon
		SensorBuf.Speed_kmph = 0.0
		SensorBuf.Satellites = 0.0
		SensorBuf.Timestamp = time.Now()
	} else {
		SensorBuf.Timestamp = parseTimeStr(NmeaBuf.Date, NmeaBuf.Time)
		v1, err := strconv.ParseFloat(NmeaBuf.Latitude, 32)
		if err != nil {
			dbgErr("198", err)
			return
		}
		SensorBuf.Latitude = float32(v1)

		v2, err := strconv.ParseFloat(NmeaBuf.Longitude, 32)
		if err != nil {
			dbgErr("204", err)
			return
		}
		SensorBuf.Longitude = float32(v2)

		v3, err := strconv.ParseFloat(NmeaBuf.Speed, 32)
		if err != nil {
			dbgErr("210", err)
			return
		}
		SensorBuf.Speed_kmph = float32(v3)

		v4, err := strconv.Atoi(NmeaBuf.NumSat)
		if err != nil {
			dbgErr("216", err)
			return
		}
		SensorBuf.Satellites = float32(v4)
	}
}

//Get uart gps data
func getGps(sp *serial.Port) {
	var NmeaBuf Nmea

	buffer := bytes.NewBuffer([]byte{})
	buf := make([]byte, 1)
	for {
		_, err := sp.Read(buf)
		if err != nil {
			dbgErr("125", err)
		}
		switch string(buf[0]) {
		case "$":
			buffer.Reset()
		case "\n":
			//t1 := time.Now()
			go decodeGps(buffer.String(), &NmeaBuf)
			//t2 := time.Now()
			//fmt.Println("G_sta: ",t2.Sub(t1))
		default:
			buffer.Write(buf)
		}

	}
}

//Decode Arduino
func decodeArd(raw *bytes.Buffer, ThpmBuf *THmp) {
	nbuf := make([]uint16, 20)
	if 20 == raw.Len() {
		for i := 0; i < 20; i++ {
			v, _ := raw.ReadByte()
			nbuf[i] = uint16(v - '0')
		}
		ThpmBuf.Pm1 = uint16((nbuf[0]<<4|nbuf[1])<<8 | (nbuf[2]<<4 | nbuf[3]))
		ThpmBuf.Pm25 = uint16((nbuf[4]<<4|nbuf[5])<<8 | (nbuf[6]<<4 | nbuf[7]))
		ThpmBuf.Pm10 = uint16((nbuf[8]<<4|nbuf[9])<<8 | (nbuf[10]<<4 | nbuf[11]))
		ThpmBuf.Temperature = int16((nbuf[12]<<4|nbuf[13])<<8 | (nbuf[14]<<4 | nbuf[15]))
		ThpmBuf.Humidity = int16((nbuf[16]<<4|nbuf[17])<<8 | (nbuf[18]<<4 | nbuf[19]))

		updateArduino(ThpmBuf)
	}
}

//Updata SensorBuf arduino data
func updateArduino(ThpmBuf *THmp) {
	SensorBuf.Lock.Lock()
	defer SensorBuf.Lock.Unlock()

	SensorBuf.Pm1 = float32(ThpmBuf.Pm1)
	SensorBuf.Pm25 = float32(ThpmBuf.Pm25)
	SensorBuf.Pm10 = float32(ThpmBuf.Pm10)
	SensorBuf.Temperature = float32(ThpmBuf.Temperature) / 10.0
	SensorBuf.Humidity = float32(ThpmBuf.Humidity) / 10.0
}

//Get uart arduino data
func getArduino(sp *serial.Port) {
	var ThpmBuf THmp

	buffer := bytes.NewBuffer([]byte{})
	buf := make([]byte, 1)
	for {
		_, err := sp.Read(buf)
		if err != nil {
			dbgErr("168", err)
		}
		switch string(buf[0]) {
		case "!":
			buffer.Reset()
		case "\n":
			//t1 := time.Now()
			go decodeArd(buffer, &ThpmBuf)
			//t2 := time.Now()
			//fmt.Println("A_sta: ",t2.Sub(t1))
		default:
			buffer.Write(buf)
		}
	}
}
