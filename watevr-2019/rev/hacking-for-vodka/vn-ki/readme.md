# Hacking for vodka

#### Category: rev
#### Points: 56

This was a relatively easy chall as you can see with the points.

The following is the decompiled check.

```c
  while (i < n) {
    local_4c = pass[i]; // input byte
    local_4b = 0;
    local_4a = (byte)i ^ *(byte *)(enc + i); // flag byte
    local_49 = 0;
    (&uStack144)[uVar1 * 0x1ffffffffffffffe] = 0x555555554c1d;
    __n = strcmp(&local_4c,&local_4a,*(undefined *)(&uStack144 + uVar1 * 0x1ffffffffffffffe));
    if (__n != 0) {
      (&uStack144)[uVar1 * 0x1ffffffffffffffe] = 0x555555554c2d;
      puts("Sorry, incorrect password!",*(undefined *)(&uStack144 + uVar1 * 0x1ffffffffffffffe));
                    /* WARNING: Subroutine does not return */
      (&uStack144)[uVar1 * 0x1ffffffffffffffe] = 0x555555554c37;
      exit(0,*(undefined *)(&uStack144 + uVar1 * 0x1ffffffffffffffe));
    }
    i = i + 1;
  }
```

Our input is checked byte by byte with the flag. (Also there is a ptrace check at the start, and this can be patched out)

There are two easy methods I discovered after getting the flag using my method:
* Bruteforce ltrace the flag out, figuring out the flag byte by byte.
* Patch the incorrect password jump and provide an incorrect flag, thus getting the whole flag.

I spoke with the chall author and this was not the intended solution. They should've statically compiled or used `==` instead of strcmp.


Now onto my solution. If you look at the disassembly,

```asm
   ADD          RAX,param_3
   MOVZX        param_3,byte ptr [RAX]
   MOV          EAX,dword ptr [RBP + i]
   XOR          EAX,param_3
   MOV          byte ptr [RBP + local_4a],AL
```

As you can see, the current byte of the flag is stored in `eax`. So we could just fetch the current byte everytime dynamically and thus have the whole flag.

I wrote an r2pipe python script to do this.

```python
import r2pipe

p = r2pipe.open('./vodka')

# disable aslr, provide a fake flag
p.cmd('dor aslr=no,stdin="AAA"')
# reopen in debug mode
p.cmd('doo')
p.cmd('aa')


res = []
bps = [
    0x555555555304,
    0x555555554c03,
    0x555555554c21
]

for i in bps:
    p.cmd('db '+hex(i))

# when the check for input occurs, circumvent it
p.cmd('dbc 0x555555554c21 dr rip=0x555555554c37')

p.cmd('dc')
# circumvent ptrace check
p.cmd('dr rip=0x555555555312')
p.cmd('dc')

while True:
    rax = p.cmdj('drj')['rax']
    if rax > 255:
        break
    res.append(rax)
    p.cmd('dc')
    p.cmd('dc')

print(res)
print(''.join(chr(i) for i in res))
```


