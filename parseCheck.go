package main

import (
	"fmt"
	"strconv"
	"strings"
	"unicode"
	"time"
	"regexp"
)

func parseTimeStr(_date,_time string) time.Time {
    
	var t time.Time
	timeFormat := "150405020106"
	t, err := time.ParseInLocation(timeFormat, _time+_date, time.UTC)
	if err != nil {
		fmt.Printf("parse timestamp: %s", err)
	}
	return t
}

func latlngToDecimal(coord string, dir string, lat bool) string {
	decimal := 0.0
	negative := false

	if len(coord) > 128 {
		return ""
	}

	if (lat && strings.ToUpper(dir) == "S") || strings.ToUpper(dir) == "W" {
		negative = true
	}

	r, _ := regexp.Compile("^-?([0-9]*?)([0-9]{2,2}\\.[0-9]*)$")

	result := r.FindStringSubmatch(coord)
	deg, _ := strconv.ParseFloat(result[1], 32) // degrees
	min, _ := strconv.ParseFloat(result[2], 32) // minutes & seconds

	// Calculate
	decimal = deg + (min / 60)

	if negative {
		decimal *= -1
	}

	_decimal := strconv.FormatFloat(decimal, 'g', 'g', 32)
	return _decimal
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

