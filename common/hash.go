package common

import (
	//	"crypto/rand"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
)

/*func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return nil, err
	}
	return b, nil
}*/

// hash function
func HashBytes256(a []byte) []byte {
	sha1h := sha256.New()
	sha1h.Write(a)
	return sha1h.Sum([]byte(""))
}

func HashBytes512(a []byte) []byte {
	sha1h := sha512.New()
	sha1h.Write(a)
	return sha1h.Sum([]byte(""))
}

// string encode
func Hex(a []byte) string {
	return hex.EncodeToString(a)
}

func Base64URL(a []byte) string {
	return base64.URLEncoding.EncodeToString(a)
}
