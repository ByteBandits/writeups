[](ctf=utctf-2020)
[](type=reversing)
[](tags=mips)
[](tools=ghidra)

# babymips

We are given a `MIPS` [binary](../baby).

Opening the binary in `Ghidra` in decompiler view gives us the simple algorithm
used to compare our input against bytes stored in the binary.

```py
from pwn import *

e = ELF('./baby')
buf = e.read(0x4015f4, 0x54)

s = bytearray(0x4e)

for i in range(0x4e):
    x = buf[i] ^ (i + 0x17)
    s[i] = x

print(bytes(s).decode('utf-8'))
```
