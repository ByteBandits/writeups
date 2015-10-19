[](ctf=hackover-2015)
[](type=reverse)
[](tags=reverse,recovery)
[](tools=binwalk,gdb-peda)

# goto (reverse-150)
We have a [zip](../goto-03661d1a42ad20065ef6bfbe5a06287c.tgz) file.
Unzipping it gives us a file goto.bin

```bash
$ file goto.bin 
goto.bin: data
```
data is somewhat nasty for a 150 pt challenge. So I used binwalk on it.

```bash
$ binwalk -e goto.bin 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
74            0x4A            gzip compressed data, maximum compression, has original file name: "rvs", from Unix, last modified: Thu Oct 15 19:19:35 2015

$ file _goto.bin.extracted/rvs 
_goto.bin.extracted/rvs: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), for GNU/Linux 2.6.24, dynamically linked, interpreter \004, stripped
```

This could work.
```bash
$ ./rvs
PASSWORD:sudhackar

ACCESS DENIED
```

I have observed it in many CTFs that how much has gdb-peda made the problems trivial to solve. So we quickly load it in gdb-peda and step through the program.
```bash
gdb-peda$ b *0x400630
Breakpoint 1 at 0x400630
gdb-peda$ b *0x4006aa
Breakpoint 2 at 0x4006aa
```

After some running and stepping.

```bash
gdb-peda$ c
Continuing.
[----------------------------------registers-----------------------------------]
RAX: 0x60109e ("eSODoe#GtrWOEnr$Re1OONnt%Ao5ROIa ^Nr{DaE y&TCI\020sDgo#ET_\020l\020iu$DFU\020d\020v!%\020_S\020j\020e\020^\020{E\020k\020 \020&\020t_\020a\020y\020(\020hG\020s\020o\020^\020iO\020d\020u\020&\020sT\020j\020 \020*\020iO\020k\020u\020^\020s_\020l\020p\020&\020aW\020a\020,\020*\020dH\020s\020 \020@\020eE\020d\020n\020#\020cR\020j\020e\020\060\020oE\020k\020v\020$\020yE\020l\020e\020%\020}V\020"...)
RBX: 0x7fffffffdfe8 ('A' <repeats 16 times>)
RCX: 0x4141414141414176 ('vAAAAAAA')
RDX: 0x602015 --> 0x0 
RSI: 0x7ffff7ff4011 --> 0x0 
RDI: 0x7fffffffdff9 --> 0x100000000000000 
RBP: 0x602010 --> 0x6f6b636168 ('hacko')
RSP: 0x7fffffffdfe0 --> 0x7ffff7a431a8 --> 0xc001200002832 
RIP: 0x4006aa (cmp    cl,0x10)
R8 : 0x7ffff7ff4011 --> 0x0 
R9 : 0x0 
R10: 0x10 
R11: 0x246 
R12: 0x40077f (xor    ebp,ebp)
R13: 0x7fffffffe120 --> 0x1 
R14: 0x0 
R15: 0x0
EFLAGS: 0x202 (carry parity adjust zero sign trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x40069e:	mov    eax,0x601068
   0x4006a3:	add    rax,0x9
   0x4006a7:	mov    cl,BYTE PTR [rax-0x9]
=> 0x4006aa:	cmp    cl,0x10
   0x4006ad:	je     0x4006b6
   0x4006af:	mov    BYTE PTR [rdx],cl
   0x4006b1:	inc    rdx
   0x4006b4:	jmp    0x4006a3
[------------------------------------stack-------------------------------------]
0000| 0x7fffffffdfe0 --> 0x7ffff7a431a8 --> 0xc001200002832 
0008| 0x7fffffffdfe8 ('A' <repeats 16 times>)
0016| 0x7fffffffdff0 ("AAAAAAAA")
0024| 0x7fffffffdff8 --> 0x0 
0032| 0x7fffffffe000 --> 0x1 
0040| 0x7fffffffe008 --> 0x4008dd (add    rbx,0x1)
0048| 0x7fffffffe010 --> 0xf0b2dd 
0056| 0x7fffffffe018 --> 0x0 
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value

Breakpoint 2, 0x00000000004006aa in ?? ()
```
If we notice RBP we'll se that our flag has started. Some continue's  later:

```bash
 
Continuing.
[----------------------------------registers-----------------------------------]
RAX: 0x6011d0 --> 0x1010107910691010 
RBX: 0x7fffffffdfe8 ('A' <repeats 16 times>)
RCX: 0x4141414141414110 
RDX: 0x602037 --> 0x0 
RSI: 0x7ffff7ff4011 --> 0x0 
RDI: 0x7fffffffdff9 --> 0x100000000000000 
RBP: 0x602010 ("hackover15{I_USE_GOTO_WHEREEVER_I_W4NT}")
RSP: 0x7fffffffdfe0 --> 0x7ffff7a431a8 --> 0xc001200002832 
RIP: 0x4006aa (cmp    cl,0x10)
R8 : 0x7ffff7ff4011 --> 0x0 
R9 : 0x0 
R10: 0x10 
R11: 0x246 
R12: 0x40077f (xor    ebp,ebp)
R13: 0x7fffffffe120 --> 0x1 
R14: 0x0 
R15: 0x0
EFLAGS: 0x212 (carry parity ADJUST zero sign trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x40069e:	mov    eax,0x601068
   0x4006a3:	add    rax,0x9
   0x4006a7:	mov    cl,BYTE PTR [rax-0x9]
=> 0x4006aa:	cmp    cl,0x10
   0x4006ad:	je     0x4006b6
   0x4006af:	mov    BYTE PTR [rdx],cl
   0x4006b1:	inc    rdx
   0x4006b4:	jmp    0x4006a3
[------------------------------------stack-------------------------------------]
0000| 0x7fffffffdfe0 --> 0x7ffff7a431a8 --> 0xc001200002832 
0008| 0x7fffffffdfe8 ('A' <repeats 16 times>)
0016| 0x7fffffffdff0 ("AAAAAAAA")
0024| 0x7fffffffdff8 --> 0x0 
0032| 0x7fffffffe000 --> 0x1 
0040| 0x7fffffffe008 --> 0x4008dd (add    rbx,0x1)
0048| 0x7fffffffe010 --> 0xf0b2dd 
0056| 0x7fffffffe018 --> 0x0 
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value

Breakpoint 2, 0x00000000004006aa in ?? ()
gdb-peda$ 
Continuing.

ACCESS DENIED
[Inferior 1 (process 18192) exited normally]
Warning: not running or target is remote
gdb-peda$ 
```

Flag

> hackover15{I_USE_GOTO_WHEREEVER_I_W4NT}
