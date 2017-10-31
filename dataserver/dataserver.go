package main

import (
	//"os"
	"encoding/json"
	"fmt"
	"flag"
	"net/http"
	"unicode"
	"strconv"
	"time"
	"github.com/influxdata/influxdb/client/v2"
)

var localAddr = flag.String("l", ":3001", "bind at")
var dbAddr = flag.String("dburl", "http://localhost:8086", "db url")
var dbName = flag.String("db", "test1", "db name")
var dbUser = flag.String("u", "user", "db user")
var dbPass = flag.String("p", "123456", "db password")

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
func createMetrics(c client.Client, mesure string, v Sensor) {  
	
	bp, err := client.NewBatchPoints(client.BatchPointsConfig{
		Database:  DataBase,
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
//Handle 7688 send to db
func sendMb2DB(w http.ResponseWriter, r *http.Request) {

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
		createMetrics(UserClient, Mesure1, v)
		fmt.Println(v)
	}else{
		fmt.Println("X")
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
//Gobal var
var DataBase, Mesure1 string
var UserClient client.Client

func main() {
	flag.Parse()

	DataBase = *dbName
	Mesure1 = "mobile"

	UserClient = influxDBClient(*dbUser, *dbPass)

	myRouter := http.NewServeMux()
	myRouter.HandleFunc("/", sendMb2DB)
	fmt.Println("bind @ ", *localAddr)
	http.ListenAndServe(*localAddr, myRouter)

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
