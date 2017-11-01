package main

import (
	"fmt"
	"./serial"
	"os"
	"os/signal"
	"syscall"
	"strconv"
	"bytes"
	"strings"
	"sync"
	"sync/atomic"
	"time"
	"io/ioutil"
	"encoding/json"
	"net/http"
//	"github.com/gorilla/websocket"
	"./websocket"
)

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

	lock sync.RWMutex
}

func (s *Sensor) String() string {
	s.lock.RLock()
	defer s.lock.RUnlock()

	str := fmt.Sprintf("%v %v %v %v %v", s.Id, s.Device, s.App, s.Device_id, s.SiteName)
//	str += fmt.Sprintf(" %v %v %v %v", s.Latitude, s.Longitude, s.Timestamp.Unix(), s.Speed_kmph)
	str += fmt.Sprintf(" %v %v %v %v", s.Latitude, s.Longitude, s.Timestamp, s.Speed_kmph)
	str += fmt.Sprintf(" %v %v", s.Temperature, s.Temperature)
	str += fmt.Sprintf(" %v %v %v", s.Pm1, s.Pm25, s.Pm10)
	str += fmt.Sprintf(" %v %v %v", s.Humidity, s.Satellites, s.Voltage)
//fmt.Println("[buf]", s.Timestamp, s.Timestamp.Unix())
	return str
}

type Config struct {
	Com_gps string
	Baud_gps int
	Com_ard string
	Baud_ard int
	Id uint8
	Device string
	App string
	Device_id string
	SiteName string
	Test_lat float32
	Test_lon float32
	Ip string
	User string
	Password string
}
//Print row number & error 
func dbgErr(n string,p interface{}){
	//fmt.Printf("%s: ",n)
	//fmt.Println(p)

	s1 := fmt.Sprintf("%v", p)
	s2 := "5,"+n+","+s1
	sess.BroadcastMessage(1, []byte(s2))
}

//Gobal buffer var
var SensorBuf Sensor
var ConfigBuf Config
//Gobal communication var
var SerUrl string
//Gobal state var
var Gps_test bool

type Wsclient struct {
	*websocket.Conn
	id uint32
	lock sync.Mutex
}

type Session struct {
	nid uint32
	lock sync.RWMutex
	clients map[uint32]*Wsclient
}

// save all ws clients
var sess = &Session{
	clients: make(map[uint32]*Wsclient),
}

func (s *Session) Add(ws *websocket.Conn) *Wsclient {
	s.lock.Lock()
	defer s.lock.Unlock()

	id := s.nid
	s.nid += 1
	c := &Wsclient{ ws, id, sync.Mutex{} }
	s.clients[id] = c
	return c
}

func (s *Session) Del(c *Wsclient) {
	s.lock.Lock()
	defer s.lock.Unlock()

	delete(s.clients, c.id)
}

func (s *Session) BroadcastMessage(messageType int, data []byte) {
	s.lock.RLock()
	defer s.lock.RUnlock()

	for _, ws := range s.clients {
		ws.lock.Lock()
		ws.WriteMessage(messageType, data)
		ws.lock.Unlock()
	}
}


//Send SensorBuf to server
func httpPost(sev Sensor, conuter *int32){
	c := atomic.AddInt32(conuter, int32(1))
	defer atomic.AddInt32(conuter, int32(-1))
	if c > 1 {
		return
	}

	js, _ := json.Marshal(sev)
	req, err := http.NewRequest("POST", SerUrl, bytes.NewBuffer([]byte(js)))
	if err != nil {
		dbgErr("246", err)
	}
	req.Header.Set("X-Custom-Header", "myvalue")
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		dbgErr("253", err)
		//fmt.Println("Server connect error")
		return
	}
	defer resp.Body.Close()
}
//Send to server
func sendDb(){
	var conuter int32 = 0

	t1 := time.NewTicker(time.Second * 2)
	for _ = range t1.C {
		//t1 := time.Now()
		go httpPost(SensorBuf, &conuter)

		//Send to html
//		s1 := fmt.Sprintf("%v", SensorBuf)
		s1 := SensorBuf.String()
		s2 := "1"+s1
		sess.BroadcastMessage(1, []byte(s2))

		//t2 := time.Now()
		//fmt.Println("send: ",t2.Sub(t1))
	}
}
//Websocket func
func webSocHand(w http.ResponseWriter, r *http.Request) {
	u, p, ok := r.BasicAuth()
	if !ok || ConfigBuf.User != u || ConfigBuf.Password != p {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	upgrader := websocket.Upgrader{
		//ReadBufferSize:  1024,
		//WriteBufferSize: 1024,
	}
	ws, _ := upgrader.Upgrade(w, r, nil)
	defer ws.Close()

	wsconn := sess.Add(ws)
	defer sess.Del(wsconn)

	for {
		messageType, message, err := wsconn.ReadMessage()
		if err != nil {
			dbgErr("290", err)
			return
		}

		cd := message[0]
		n := len(message)
		sb := string(message[2:n])
		//fmt.Println(message)
		switch cd {
		case '0'://get config
			wd := strings.Split(sb, ",")
			ConfigBuf.Ip = wd[10]
			SerUrl = ConfigBuf.Ip
			ConfigBuf.Com_gps = wd[0]
			v1,err := strconv.Atoi(wd[1])
			if err != nil {
				dbgErr("304", err)
				goto Err
			}
			ConfigBuf.Baud_gps = v1


			ConfigBuf.Com_ard = wd[2]
			v1,err = strconv.Atoi(wd[3])
			if err != nil {
				dbgErr("311", err)
				goto Err
			}
			ConfigBuf.Baud_ard = v1


			v,er := strconv.ParseFloat(wd[8],32)
			if er != nil {
				dbgErr("318", er)
				goto Err
			}
			ConfigBuf.Test_lat = float32(v)


			v,er = strconv.ParseFloat(wd[9],32)
			if er != nil {
				dbgErr("324", er)
				goto Err
			}
			ConfigBuf.Test_lon = float32(v)

			if !checkT(wd[4]) {
				goto Err
			}
			ConfigBuf.Device = wd[4]
			SensorBuf.Device = ConfigBuf.Device


			if !checkT(wd[5]) {
				goto Err
			}
			ConfigBuf.Device_id = wd[5]
			SensorBuf.Device_id = ConfigBuf.Device_id


			if !checkT(wd[6]) {
				goto Err
			}
			ConfigBuf.App = wd[6]
			SensorBuf.App = ConfigBuf.App


			if !checkT(wd[7]) {
				goto Err
			}
			ConfigBuf.SiteName = wd[7]
			SensorBuf.SiteName = ConfigBuf.SiteName

			ConfigBuf.Ip = wd[10]
			SerUrl = ConfigBuf.Ip

			if !checkT(wd[11]) {
				goto Err
			}
			ConfigBuf.User = wd[11]

			if !checkT(wd[12]) {
				goto Err
			}
			ConfigBuf.Password = wd[12]

			// trigger save
			select {
			case <-chFlush:
			default:
			}
			chFlush <- 0


		case '5'://send config
			s := "0"
			s += fmt.Sprintf("%v", ConfigBuf)
			wsconn.lock.Lock()
			wsconn.WriteMessage(messageType, []byte(s))
			wsconn.lock.Unlock()
		}

		continue

Err:
		fmt.Println("Config setting Error")
	}
}

func main() {

	//Read config.json
	file, err := ioutil.ReadFile("./config.json")
	if err != nil {
		dbgErr("362", err)
		os.Exit(1)
	}
	fmt.Printf("%s\n", string(file))
	json.Unmarshal(file, &ConfigBuf)

	//sensor information
	Gps_test = true
	SensorBuf.Id = ConfigBuf.Id
	SensorBuf.Device = ConfigBuf.Device
	SensorBuf.App = ConfigBuf.App
	SensorBuf.Device_id = ConfigBuf.Device_id
	SensorBuf.SiteName = ConfigBuf.SiteName
	SerUrl = ConfigBuf.Ip

	//ubuntu /dev/ttyUSB0 57600 /dev/ttyACM0 9600
	//port0 arduino port1 gps, if not use set 0
	port0 := ConfigBuf.Com_ard
	baud0 := ConfigBuf.Baud_ard 

	port1 := ConfigBuf.Com_gps
	baud1 := ConfigBuf.Baud_gps

	//Serial init
	if baud0 != 0 {
		s0 := &serial.Config{Name: port0, Baud: baud0}
		SerialA, err := serial.OpenPort(s0)
		if err != nil {
			dbgErr("392", err)
		}else{
			fmt.Println("port Arduino open")

			go getArduino(SerialA)
			fmt.Println("port Arduino start")
		}
	}
	if baud1 != 0 {
		s1 := &serial.Config{Name: port1, Baud: baud1}
		SerialG, err := serial.OpenPort(s1)
		if err != nil {
			dbgErr("402", err)
		}else{
			fmt.Println("port Gps open")
			go getGps(SerialG)
			fmt.Println("port Gps start")
		}
	}


	go saveWorker()

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func () {
		<- sigs
		fmt.Println("flush on exit")
		chFlush <- -1
	}()


	//send to DB
	go sendDb()

	//http handle
	myRouter := http.NewServeMux()
	myRouter.HandleFunc("/socket", webSocHand)

	fsHandle := http.StripPrefix("/", http.FileServer(http.Dir("./app/")))
	myRouter.HandleFunc("/", func (w http.ResponseWriter, r *http.Request) {
		u, p, ok := r.BasicAuth()
//		fmt.Println("[auth]", u, p, ok)
		if !ok {
			w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		if ConfigBuf.User != u || ConfigBuf.Password != p {
			w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
			w.WriteHeader(http.StatusUnauthorized)
//			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		fsHandle.ServeHTTP(w, r)
	})
	//myRouter.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./app/"))))
	fmt.Println("listen :3002")
	http.ListenAndServe(":3002", myRouter)
}

var chFlush = make(chan int, 1)
func saveWorker() {
	changed := false
	for {
		t := <- chFlush

		switch t {
		case -1:
			if changed {
				fmt.Println("need flush...")
				SaveJsonFile(ConfigBuf, "./config.json")
			}
			fmt.Println("flush end")
			os.Exit(0)
		default:
			changed = true
		}
	}
}

func SaveJsonFile(v interface{}, path string) {
	fo, err := os.Create(path)
	if err != nil {
		fmt.Println("SaveJsonFile: os.Create()", err)
		return
	}
	defer fo.Close()
	e := json.NewEncoder(fo)
	if err := e.Encode(v); err != nil {
		fmt.Println("SaveJsonFile: Encode()", err)
		return
	}
}


/*Id uint8
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
Voltage float32*/
