package main

import (
	"encoding/pem"
	"io/ioutil"
	"os"

	"flag"
	"fmt"

	com "./common"
)

var verbosity = flag.Int("v", 3, "verbosity")

func main() {
	flag.Parse()

	pkey, pubkey := com.GenECDSAKeys()

	// save private key
	ioutil.WriteFile("private.key", pkey, 0600)
	Vln(1, "private key saved to private.key")

	// save public key
	ioutil.WriteFile("public.key", pubkey, 0644)

	pubfile, _ := os.Create("public.pem")
	pem.Encode(pubfile, &pem.Block{
		Type : "EC PUBLIC KEY",
		Bytes : pubkey,
	})
	pubfile.Close()

	Vln(1, "public key saved to public.key")
}

func Vf(level int, format string, v ...interface{}) {
	if level <= *verbosity {
		fmt.Printf(format, v...)
	}
}

func V(level int, v ...interface{}) {
	if level <= *verbosity {
		fmt.Print(v...)
	}
}

func Vln(level int, v ...interface{}) {
	if level <= *verbosity {
		fmt.Println(v...)
	}
}

