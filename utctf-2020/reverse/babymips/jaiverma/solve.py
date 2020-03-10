from pwn import *

e = ELF('./baby')
buf = e.read(0x4015f4, 0x54)

s = bytearray(0x4e)

for i in range(0x4e):
    x = buf[i] ^ (i + 0x17)
    s[i] = x

print(bytes(s).decode('utf-8'))

'''
utflag{mips_cpp_gang_5VDm:~`N]ze;\)5%vZ=C'C(r#$q=*efD"ZNY_GX>6&sn.wF8$v*mvA@'}
'''
