package main

import (
	"encoding/json"
	//"io/ioutil"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type Lass struct {
	Source string       `json:"source"`
	Feeds  []LassSensor `json:"feeds"`
}

type LassRecode struct {
	Source string   `json:"source"`
	Feeds  []Sensor `json:"feeds"`
}

type LassSensor struct {
	SiteName    string    `json:"SiteName,omitempty"`
	App         string    `json:"app,omitempty"`
	Device      string    `json:"device,omitempty"`
	Device_id   string    `json:"device_id,omitempty"`
	Longitude   float32   `json:"gps_lon,omitempty"`     //緯度
	Latitude    float32   `json:"gps_lat,omitempty"`     //經度
	Timestamp   time.Time `json:"timestamp,omitempty"`   //時間
	Temperature float32   `json:"Temperature,omitempty"` //溫度
	S_t0        float32   `json:"s_t0,omitempty"`        //溫度
	S_t2        float32   `json:"s_t2,omitempty"`        //溫度
	S_t4        float32   `json:"s_t4,omitempty"`        //溫度
	S_b2        float32   `json:"s_b2,omitempty"`        //氣壓
	S_b0        float32   `json:"s_b0,omitempty"`        //氣壓
	Pm1         float32   `json:"s_d2,omitempty"`        //PM1
	Pm10        float32   `json:"s_d1,omitempty"`        //PM10
	S_d0        float32   `json:"s_d0,omitempty"`        //PM25
	Pm25        float32   `json:"PM25,omitempty"`        //PM25
	Humidity    float32   `json:"Humidity,omitempty"`    //濕度
	S_h0        float32   `json:"s_h0,omitempty"`        //濕度
	S_h2        float32   `json:"s_h2,omitempty"`        //濕度
	S_h4        float32   `json:"s_h4,omitempty"`        //濕度
	Satellites  float32   `json:"gps_num,omitempty"`     //衛星
	Voltage     float32   `json:"s_1,omitempty"`         //電量
}

func (v *LassSensor) GetTemp() float32 {
	if v.Temperature > 0 {
		return v.Temperature
	} else if v.S_t0 > 0 {
		return v.S_t0
	} else if v.S_t2 > 0 {
		return v.S_t2
	} else if v.S_t4 > 0 {
		return v.S_t4
	} else {
		return 0.0
	}
}

func (v *LassSensor) GetBaro() float32 {
	if v.S_b2 > 0 {
		return v.S_b2
	} else if v.S_b0 > 0 {
		return v.S_b0
	} else {
		return 0.0
	}
}

func (v *LassSensor) Getpm1() float32 {
	if v.Pm1 > 0 {
		return v.Pm1
	} else {
		return 0.0
	}
}

func (v *LassSensor) Getpm10() float32 {
	if v.Pm10 > 0 {
		return v.Pm10
	} else {
		return 0.0
	}
}

func (v *LassSensor) Getpm25() float32 {
	if v.S_d0 > 0 {
		return v.S_d0
	} else if v.Pm25 > 0 {
		return v.Pm25
	} else {
		return 0.0
	}
}

func (v *LassSensor) GetHum() float32 {
	if v.Humidity > 0 {
		return v.Humidity
	} else if v.S_h0 > 0 {
		return v.S_h0
	} else if v.S_h2 > 0 {
		return v.S_h2
	} else if v.S_h4 > 0 {
		return v.S_h4
	} else {
		return 0.0
	}
}

func (v *LassSensor) GetSate() float32 {
	if v.Satellites > 0 {
		return v.Satellites
	} else {
		return 0.0
	}
}

func (v *LassSensor) GetVol() float32 {
	if v.Voltage > 0 {
		return v.Voltage
	} else {
		return 0.0
	}
}

type LassCache struct {
	lock     sync.RWMutex
	JsonData map[int][]byte
}

func (lc *LassCache) Set(id int, data []byte) {
	lc.lock.Lock()
	defer lc.lock.Unlock()

	lc.JsonData[id] = data
}

func (lc *LassCache) GetAll() [][]byte {
	lc.lock.RLock()
	defer lc.lock.RUnlock()

	size := len(lc.JsonData)
	list := make([][]byte, 0, size)
	for _, buf := range lc.JsonData {
		list = append(list, buf)
	}
	return list
}

func NewLassCache() *LassCache {
	lc := &LassCache{sync.RWMutex{}, make(map[int][]byte)}
	return lc
}

func getJson(url string, id uint32) []byte {
	var myClient = &http.Client{Timeout: 10 * time.Second}
	r, err := myClient.Get(url)
	if err != nil {
		fmt.Printf("xxxxxxxxxxxxxxx\r\n")
		fmt.Println(err)
		fmt.Printf("xxxxxxxxxxxxxxx\r\n")
		return nil
	}
	defer r.Body.Close()

	var t Lass
	err = json.NewDecoder(r.Body).Decode(&t)
	if err != nil {
		fmt.Printf("xxxxxxxxxxxxxxx\r\n")
		fmt.Println(err)
		fmt.Printf("xxxxxxxxxxxxxxx\r\n")
		return nil
	}

	var recode LassRecode
	recode.Source = t.Source
	recode.Feeds = make([]Sensor, len(t.Feeds), len(t.Feeds))

	for idx, v := range t.Feeds {
		var res Sensor
		res.Id = id
		res.SiteName = v.SiteName
		res.App = v.App
		res.Device = v.Device
		res.Device_id = v.Device_id
		res.Longitude = v.Longitude
		res.Latitude = v.Latitude
		res.Timestamp = v.Timestamp
		res.Temperature = v.GetTemp()
		res.Barometer = v.GetBaro()
		res.Pm1 = v.Getpm1()
		res.Pm25 = v.Getpm25()
		res.Pm10 = v.Getpm10()
		res.Humidity = v.GetHum()
		res.Satellites = v.GetSate()
		res.Voltage = v.GetVol()

		recode.Feeds[idx] = res
		//go createMetrics(ifx, res) // send to DB
	}

	b, err := json.Marshal(recode)
	if err != nil {
		fmt.Println("error:", err)
	}

	return b
}

func GetLassData(sess *Session, lc *LassCache) {

	var lassUrl = map[uint32]string{
		0: "https://pm25.lass-net.org/data/last-all-airbox.json",
		1: "https://pm25.lass-net.org/data/last-all-maps.json",
		2: "https://pm25.lass-net.org/data/last-all-lass.json",
		3: "https://pm25.lass-net.org/data/last-all-lass4u.json",
		4: "https://pm25.lass-net.org/data/last-all-indie.json",
		5: "https://pm25.lass-net.org/data/last-all-probecube.json",
	}

	for {
		for idx, url := range lassUrl {
			buf := getJson(url, idx)
			fmt.Printf("============\r\n")
			fmt.Printf("%v %v\r\n", idx, len(buf))
			fmt.Printf("============\r\n")
			if buf != nil {
				lc.Set(int(idx), buf)
				sess.BroadcastMessage(1, buf)
			}
		}

		loc, _ := time.LoadLocation("Asia/Taipei")
		now := time.Now().In(loc)
		fmt.Printf("============\r\n")
		fmt.Printf("Get %v\r\n", now)
		fmt.Printf("============\r\n")

		time.Sleep(time.Second * 300)
	}
}
