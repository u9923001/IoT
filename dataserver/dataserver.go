package main

import (
	"os"
	"encoding/json"
	"fmt"
	"flag"
	"net/http"
	"unicode"
	"strconv"
	"time"
	"github.com/influxdata/influxdb/client/v2"
)

var configFile = flag.String("c", "config.json", "config file")

type Config struct {
	LocalAddr    string `json:"localaddr"`
	DbAddr       string `json:"dbaddr"`

	DbName       string `json:"dbname"`
	DbMesure     string `json:"mesure"`
	User         string `json:"user"`
	Pass         string `json:"pass"`

	Log          string `json:"log"`
	Verb         int    `json:"verb"`
}

func parseJSONConfig(path string) (error, *Config) {
	file, err := os.Open(path) // For read access.
	if err != nil {
		return err, nil
	}
	defer file.Close()

	c := &Config{}
	err = json.NewDecoder(file).Decode(c)
	if err != nil {
		return err, nil
	}

	if c.LocalAddr == "" {
		c.LocalAddr = ":3001"
	}

	if c.DbAddr == "" {
		c.DbAddr = "http://localhost:8086"
	}

	return nil, c
}


//Sensor data struct
type Sensor struct {
	Id uint8
	Device string
	App string
	Device_id string
	SiteName string
	Latitude float32
	Longitude float32
	Timestamp time.Time
	Speed_kmph float32
	Temperature float32
	Barometer float32
	Pm1 float32
	Pm25 float32
	Pm10 float32
	Humidity float32
	Satellites float32
	Voltage float32
}
//Print row number & error 
func dbgErr(n string,p interface{}){
	fmt.Printf("%s: ",n)
	fmt.Println(p)
}
//Create influxDB connection
func influxDBClient(u,p string) client.Client {  
	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr:	 "http://localhost:8086",
		Username: u,
		Password: p,
	})
	if err != nil {
		dbgErr("47", err)
		return nil
	}
	return c
}
//Write data to influxDB
func createMetrics(c client.Client, dataBase string , mesure string, v Sensor) {  
	
	bp, err := client.NewBatchPoints(client.BatchPointsConfig{
		Database:  dataBase,
		Precision: "s",
	})

	if err != nil {
		dbgErr("60", err)
		return
	}

	ids := strconv.Itoa(int(v.Id))
	tags := map[string]string{
		"Id": ids,
		"Device_id": v.Device_id,
	}
	fields := map[string]interface{}{
		"App": v.App,
		"Device": v.Device,
		"SiteName": v.SiteName,
		"Longitude": v.Longitude,
		"Latitude": v.Latitude,
		"Speed_kmph": v.Speed_kmph,
		"Timestamp": v.Timestamp,
		"Temperature": v.Temperature,
		"Barometer": v.Barometer,
		"Pm1": v.Pm1,
		"Pm25": v.Pm25,
		"Pm10": v.Pm10,
		"Humidity": v.Humidity,
		"Satellites": v.Satellites,
		"Voltage": v.Voltage,
	}
	//udbtime, _ := time.Parse(time.RFC3339,strconv.Itoa(int(v.Timestamp)))
	pt, err := client.NewPoint(mesure, tags, fields, v.Timestamp)
	if err != nil {
		dbgErr("88", err)
		return
	}
	bp.AddPoint(pt)
	
	err = c.Write(bp)
	if err != nil {
		dbgErr("94", err)
		return
	}
}

//Check string
func checkSD(v Sensor) (x bool){
	x = false
	if !checkT(v.SiteName) {
		return x
	}

	if !checkR(v.Device_id) {
		return x
	}

	if !checkR(v.Device) {
		return x
	}

	if !checkR(v.App) {
		return x
	}
	x = true
	return x 
}

func main() {
	flag.Parse()

	err, config := parseJSONConfig(*configFile)
	if err != nil {
		fmt.Println("load config file error", err)
		os.Exit(-1)
	}

	dbClient := influxDBClient(config.User, config.Pass)

	myRouter := http.NewServeMux()

	//Handle 7688 send to db
	myRouter.HandleFunc("/", func (w http.ResponseWriter, r *http.Request) {

		// only POST
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		//Json decoder
		v := Sensor{}
		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&v)	
		if err != nil {
			dbgErr("104",err)
			return
		}
		//Check sensor data
		if checkSD(v) {
			go createMetrics(dbClient, config.DbName, config.DbMesure, v)
			fmt.Println(v)
		}else{
			fmt.Println("X")
		}
	})

	fmt.Println("bind @", config.LocalAddr)
	http.ListenAndServe(config.LocalAddr, myRouter)

}

func checkR(s string) (x bool) {
	if len(s) > 128 {
		return
	}
	last := false
	for _, c := range s {
		if c == '_' {
			if last {
				return
			}
			last = true
			continue
		}
		if (c >= 'a' && c <= 'z') {
			last = false
			continue
		}
		if (c >= 'A' && c <= 'Z') {
			last = false
			continue
		}
		if (c >= '0' && c <= '9') {
			last = false
			continue
		}
		return
	}
	return true
}

func checkT(s string) (x bool) {
	if len(s) > 128 {
		return
	}
	last := false
	for _, c := range s {
		if c == '_' {
			if last {
				return
			}
			last = true
			continue
		}
		if (c >= 'a' && c <= 'z') {
			last = false
			continue
		}
		if (c >= 'A' && c <= 'Z') {
			last = false
			continue
		}
		if (c >= '0' && c <= '9') {
			last = false
			continue
		}
		if unicode.In(c, unicode.Han){
			last = false
			continue
		}
		return
	}
	return true
}
/*
func check(v Sensor) (x bool) {
	x = false
	
	if checkU8(v.Voltage, 0, 100) {
		return
	}
	if checkU8(v.Satellites, 0, 50) {
		return
	}
	if checkU8(v.Humidity, 0, 100) {
		return
	}
/*	if checkU16(v.Pm1, 0, 65535) {
		return
	}
	if checkU16(v.Pm25, 0, 65535) {
		return
	}
	if checkU16(v.Pm10, 0, 65535) {
		return
	}
	if checkU16(v.Barometer, 0, 65535) {
		return
	}///
	if checkI16(v.Temperature, -1000, 1000) {
		return
	}
	if checkU16(v.Speed_kmph, 0, 500) {
		return
	}
	if v.Timestamp >= 0 && v.Timestamp <= 4294967295 {
		return
	}
	if checkF32(v.Longitude, -180, 180) {
		return
	}
	if checkF32(v.Latitude, -90, 90) {
		return
	}
	
	if checkT(v.SiteName) {
		return
	}

	if checkR(v.Device_id) {
		return
	}

	if checkR(v.Device) {
		return
	}
	return true
}
*/
