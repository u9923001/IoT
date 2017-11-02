package common

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"errors"
	"io/ioutil"
	"math/big"
)

var ErrNotSupport = errors.New("type Not Support")

// ECDSA function
func GenECDSAKeys() (private_key_bytes, public_key_bytes []byte) {
	private_key, _ := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	private_key_bytes, _ = x509.MarshalECPrivateKey(private_key)
	public_key_bytes, _ = x509.MarshalPKIXPublicKey(&private_key.PublicKey)
	return private_key_bytes, public_key_bytes
}

func SignECDSAByte(private_key_bytes []byte, hash []byte) ([]byte, error) {
	private_key, err := x509.ParseECPrivateKey(private_key_bytes)
	if err != nil {
		return nil, err
	}

	return SignECDSA(private_key, hash)
}

func SignECDSA(private_key *ecdsa.PrivateKey, hash []byte) ([]byte, error) {
	r, s, err := ecdsa.Sign(rand.Reader, private_key, hash)
	if err != nil {
		return nil, err
	}
	//	v.Vlogln(5, "r: ", len(r.Bytes()), r.Bytes())
	//	v.Vlogln(5, "s: ", len(s.Bytes()), s.Bytes())

	return append(r.Bytes(), s.Bytes()...), nil
}

func VerifyECDSAByte(public_key_bytes []byte, hash []byte, signature []byte) (result bool) {
	public_key, err := x509.ParsePKIXPublicKey(public_key_bytes)
	if err != nil {
		return false
	}

	switch public_key := public_key.(type) {
	case *ecdsa.PublicKey:
		return VerifyECDSA(public_key, hash, signature)
	default:
		return false
	}
}

func VerifyECDSA(public_key *ecdsa.PublicKey, hash []byte, signature []byte) (result bool) {
	var r big.Int
	r.SetBytes(signature[0:32])
	var s big.Int
	s.SetBytes(signature[32:64])

	return ecdsa.Verify(public_key, hash, &r, &s)
}

func LoadECDSAPub(path string) (*ecdsa.PublicKey, error) {
	public_key_bytes, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	public_key, err := x509.ParsePKIXPublicKey(public_key_bytes)
	if err != nil {
		return nil, err
	}

	switch public_key := public_key.(type) {
	case *ecdsa.PublicKey:
		return public_key, nil
	default:
		return nil, ErrNotSupport
	}
}

func LoadECDSAPriv(path string) (*ecdsa.PrivateKey, error) {
	private_key_bytes, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return x509.ParseECPrivateKey(private_key_bytes)
}
