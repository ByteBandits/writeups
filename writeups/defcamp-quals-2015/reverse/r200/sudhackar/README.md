[](ctf=defcamp-quals-2015)
[](type=reverse)
[](tags=hardcoded)

We are given a [binary](../r200.bin).

```bash
$ file r200.bin 
r200.bin: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=22e68980e521b43c90688ed0693df78150b10211, stripped
```

This one has the same ptrace protection as in [r100](../../r100).We use the same technique to bypass ptrace check.
```bash
gdb-peda$ b *0x40087d
Breakpoint 1 at 0x40087d
gdb-peda$ r
.
.
gdb-peda$ set $rax=0
```
Now the decompiling doesn't help much. We move to manually testing the flow path of binary.

```asm
   mov    DWORD PTR [rbp-0x20],0x5
   mov    DWORD PTR [rbp-0x1c],0x2
   mov    DWORD PTR [rbp-0x18],0x7
   mov    DWORD PTR [rbp-0x14],0x2
   mov    DWORD PTR [rbp-0x10],0x5
   mov    DWORD PTR [rbp-0xc],0x6
```
This seems interesting. A little bit of analysis shows 

```bash
0x4007af:	mov    rax,QWORD PTR [rip+0x2008ca]        # 0x601080
```
On examining memory at 0x601080 and nearby areas we see the obvious.

```bash
gdb-peda$ x/2xw 0x602010
0x602010:	0x00000001	0x0000006e
gdb-peda$ x/2xw 0x602030
0x602030:	0x00000002	0x0000006f
gdb-peda$ x/2xw 0x602050
0x602050:	0x00000003	0x00000070
gdb-peda$ x/2xw 0x602070
0x602070:	0x00000004	0x00000071
```
We see that 0x6e(n) is mapped to 0, 0x6f(o) to 2 and so on.
so 5,2,7,2,5,6 gives us rotors

Flag
> rotors