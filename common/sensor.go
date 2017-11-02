package common

import (
	"crypto/ecdsa"
	"encoding/base64"
	"fmt"
	"sync"
	"time"
)

//Sensor data struct
type Sensor struct {
	Id          uint32
	Device      string
	App         string
	Device_id   string
	SiteName    string
	Latitude    float32
	Longitude   float32
	Timestamp   time.Time
	Speed_kmph  float32
	Temperature float32
	Barometer   float32
	Pm1         float32
	Pm25        float32
	Pm10        float32
	Humidity    float32
	Satellites  float32
	Voltage     float32

	Sign string

	Lock sync.RWMutex `json:"-"`
}

func (s *Sensor) String() string {
	s.Lock.RLock()
	defer s.Lock.RUnlock()

	str := fmt.Sprintf("%v %v %v %v %v", s.Id, s.Device, s.App, s.Device_id, s.SiteName)
	//str += fmt.Sprintf(" %v %v %v %v", s.Latitude, s.Longitude, s.Timestamp.Unix(), s.Speed_kmph)
	str += fmt.Sprintf(" %v %v %v %v", s.Latitude, s.Longitude, s.Timestamp, s.Speed_kmph)
	str += fmt.Sprintf(" %v %v", s.Temperature, s.Temperature)
	str += fmt.Sprintf(" %v %v %v", s.Pm1, s.Pm25, s.Pm10)
	str += fmt.Sprintf(" %v %v %v", s.Humidity, s.Satellites, s.Voltage)
	//fmt.Println("[buf]", s.Timestamp, s.Timestamp.Unix())
	return str
}

func (sd *Sensor) GetSign(private_key *ecdsa.PrivateKey) ([]byte, error) {
	info := sd.String()
	hash := HashBytes256([]byte(info))

	return SignECDSA(private_key, hash)
}

func (sd *Sensor) FillSign(private_key *ecdsa.PrivateKey) bool {
	signature, err := sd.GetSign(private_key)
	if err != nil {
		return false
	}

	sd.Lock.Lock()
	sd.Sign = base64.StdEncoding.EncodeToString(signature)
	sd.Lock.Unlock()

	return true
}

func (sd *Sensor) VerifySign(public_key *ecdsa.PublicKey) bool {
	info := sd.String()
	hash := HashBytes256([]byte(info))
	signature, err := base64.StdEncoding.DecodeString(sd.Sign)
	if err != nil {
		return false
	}

	return VerifyECDSA(public_key, hash, signature)
}
