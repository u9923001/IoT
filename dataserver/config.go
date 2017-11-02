package main

import (
	"encoding/json"
	"os"
)

type Config struct {
	LocalAddr string `json:"localaddr"`
	DbAddr    string `json:"dbaddr"`

	DbName   string `json:"dbname"`
	DbMesure string `json:"mesure"`
	User     string `json:"user"`
	Pass     string `json:"pass"`

	KeyDir string `json:"keydir"`

	Log  string `json:"log"`
	Verb int    `json:"verb"`
}

func parseJSONConfig(path string) (error, *Config) {
	file, err := os.Open(path) // For read access.
	if err != nil {
		return err, nil
	}
	defer file.Close()

	c := &Config{}
	c.Verb = 3

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

	if c.KeyDir == "" {
		c.KeyDir = "./keys"
	}

	return nil, c
}

