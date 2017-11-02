package main

import (
	"github.com/gorilla/websocket"
	"sync"
)

type Wsclient struct {
	*websocket.Conn
	id   uint32
	data chan *WsMsg
}

type WsMsg struct {
	messageType int
	data        []byte
}

func (c *Wsclient) Send(messageType int, buf []byte) {
	select {
	case <-c.data:
	default:
	}
	msg := &WsMsg{messageType, buf}
	c.data <- msg
}
func (c *Wsclient) worker() {
	for {
		msg := <-c.data
		err := c.WriteMessage(msg.messageType, msg.data)
		if err != nil {
			c.Close()
			return
		}
	}
}

type Session struct {
	nid     uint32
	lock    sync.RWMutex
	clients map[uint32]*Wsclient
}

func (s *Session) Add(ws *websocket.Conn) *Wsclient {
	s.lock.Lock()
	defer s.lock.Unlock()

	id := s.nid
	s.nid += 1
	c := &Wsclient{ws, id, make(chan *WsMsg, 1)}
	s.clients[id] = c
	go c.worker()
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
		ws.Send(messageType, data)
	}
}

func NewSession() *Session {
	sess := &Session{
		clients: make(map[uint32]*Wsclient),
	}
	return sess
}
