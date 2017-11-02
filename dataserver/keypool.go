package main

import (
	"crypto/ecdsa"
	"strconv"
	"sync"
	"time"

	com "../common"
)

const TIMEOUT = 300 * time.Second

// save all endpoint's public key
type KeyPool struct {
	lock      sync.RWMutex
	endpoints map[uint32]*Key
	path      string
}

func (p *KeyPool) Get(uid uint32) *ecdsa.PublicKey {
	p.lock.RLock()
	key, ok := p.endpoints[uid]
	p.lock.RUnlock()
	if !ok {
		devkey := p.LoadSet(uid)
		if devkey == nil {
			return nil
		}

		key = devkey
	} else {
		// check update/renew
		if key.CheckRenew() {
			devkey := p.LoadSet(uid)
			if devkey == nil {
				p.lock.Lock()
				delete(p.endpoints, uid)
				p.lock.Unlock()
				return nil
			}

			key = devkey
		}
	}

	return key.pub
}

func (p *KeyPool) LoadSet(uid uint32) *Key {
	uidstr := strconv.Itoa(int(uid))

	// try load key
	key, err := NewKey(p.path + uidstr)
	if err != nil {
		return nil
	}

	// write back
	p.lock.Lock()
	p.endpoints[uid] = key
	p.lock.Unlock()

	return key
}

type Key struct {
	pub     *ecdsa.PublicKey
	timeout time.Time
}

func (k *Key) CheckRenew() bool {
	return time.Now().After(k.timeout)
}

func NewKey(path string) (*Key, error) {
	pubkey, err := com.LoadECDSAPub(path)
	if err != nil {
		return nil, err
	}
	k := &Key{
		pub:     pubkey,
		timeout: time.Now().Add(TIMEOUT),
	}
	return k, nil
}
