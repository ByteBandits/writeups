[](ctf=trend-micro-ctf-2015)
[](type=analysis,reverse)
[](tags=payload,drop)
[](tools=gdb-peda)
[](techniques=breakpoints)

I think this is the unintended solution.

We are given a [zip](../vonn.zip) password:wx5tOCvU3g2FmueLEvj5np9xJX0cND3K.
This gives us a binary.

```sh
$ file vonn 
vonn: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=7f89c2bb36cc9d0882a4980a99d44a7674fb09e2, not stripped

$ ./vonn 
You are not on VMM
```
Thats it! we don't know whats happening.
So i quickly load it with gdb-peda and after setting some breakpoints,we're ready to step through the execution.

```sh
gdb-peda$ b *0x400b8d
Breakpoint 1 at 0x400b8d
```
After some stepping when we get to puts call for output
```objdump
   0x400cd3 <main+326>:	cmp    rax,QWORD PTR [rbp-0x8]
   0x400cd7 <main+330>:	je     0x400cfc <main+367>
   0x400cd9 <main+332>:	mov    edi,0x401100
=> 0x400cde <main+337>:	call   0x400990 <puts@plt>
   0x400ce3 <main+342>:	mov    rax,QWORD PTR [rbp-0xd0]
   0x400cea <main+349>:	mov    rax,QWORD PTR [rax]
   0x400ced <main+352>:	mov    rdi,rax
   0x400cf0 <main+355>:	mov    eax,0x0
Guessed arguments:
arg[0]: 0x401100 ("You are on VMM!")
```
And I still don't know how!!
All thats left is to do a c(continue).
```sh
gdb-peda$ c
Continuing.
You are on VMM!
process 9248 is executing new program: /tmp/...,,,...,,
warning: the debug information found in "/lib64/ld-2.19.so" does not match "/lib64/ld-linux-x86-64.so.2" (CRC mismatch).
```

This file dropped a payload that was automatically loaded in gdb. Nice!!
Lucky for me the breakpoint 0x400b8d is still an instruction in the payload binary. 
```objdump
   0x0000000000400b74 <+248>:	call   0x400790 <MD5@plt>
   0x0000000000400b79 <+253>:	mov    edi,0x54
   0x0000000000400b7e <+258>:	call   0x400780 <putchar@plt>
   0x0000000000400b83 <+263>:	mov    edi,0x4d
   0x0000000000400b88 <+268>:	call   0x400780 <putchar@plt>
=> 0x0000000000400b8d <+273>:	mov    edi,0x43
   0x0000000000400b92 <+278>:	call   0x400780 <putchar@plt>
   0x0000000000400b97 <+283>:	mov    edi,0x54
   0x0000000000400b9c <+288>:	call   0x400780 <putchar@plt>
   0x0000000000400ba1 <+293>:	mov    edi,0x46
   0x0000000000400ba6 <+298>:	call   0x400780 <putchar@plt>
   0x0000000000400bab <+303>:	mov    edi,0x7b
   0x0000000000400bb0 <+308>:	call   0x400780 <putchar@plt>
   0x0000000000400bb5 <+313>:	mov    DWORD PTR [rbp-0xc4],0x0
   0x0000000000400bbf <+323>:	jmp    0x400be9 <rnktmp+365>
```
Looks good. Another c(continue)

```sh
gdb-peda$ c
Continuing.
TMCTF{ce5d8bb4d5efe86d25098bec300d6954}[Inferior 1 (process 9248) exited with code 0377]
/tmp/...,,,...,,: No such file or directory.
```

Huh! Was easier than expected.
FLAG

> TMCTF{ce5d8bb4d5efe86d25098bec300d6954}