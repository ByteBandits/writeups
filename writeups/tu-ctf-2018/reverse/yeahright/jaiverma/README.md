[](ctf=tu-ctf-2018)
[](type=reversing)
[](tags=malloc,memcpy)
[](tools=radare2,gdb-peda)

# yeahright

We are given a [binary](../yeahright) which accepts user input and does a memcmp with a string.

```bash
vagrant@amy:~/share/yeahright$ file yeahright
yeahright: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=0b6d0cc001d9c9c8fb8e1e61f8b082bcda503669, not stripped
```

```assembly
gdb-peda$ c
Continuing.
*Ahem*... password? aaaa
[----------------------------------registers-----------------------------------]
RAX: 0x555555756010 --> 0xa61616161 ('aaaa\n')
RBX: 0x0
RCX: 0x555555554a98 ("7h3_m057_53cr37357_p455w0rd_y0u_3v3r_54w")
RDX: 0x28 ('(')
RSI: 0x555555554a98 ("7h3_m057_53cr37357_p455w0rd_y0u_3v3r_54w")
RDI: 0x555555756010 --> 0xa61616161 ('aaaa\n')
RBP: 0x7fffffffe0f0 --> 0x555555554a10 (<__libc_csu_init>:  push   r15)
RSP: 0x7fffffffe0e0 --> 0x7fffffffe1d0 --> 0x1
RIP: 0x5555555549cf (<main+143>:    call   0x5555555547c0 <memcmp@plt>)
R8 : 0x7ffff7fec700 (0x00007ffff7fec700)
R9 : 0x14
R10: 0x37b
R11: 0x246
R12: 0x555555554810 (<_start>:  xor    ebp,ebp)
R13: 0x7fffffffe1d0 --> 0x1
R14: 0x0
R15: 0x0
EFLAGS: 0x203 (CARRY parity adjust zero sign trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x5555555549c4 <main+132>:   mov    edx,0x28
   0x5555555549c9 <main+137>:   mov    rsi,rcx
   0x5555555549cc <main+140>:   mov    rdi,rax
=> 0x5555555549cf <main+143>:   call   0x5555555547c0 <memcmp@plt>
   0x5555555549d4 <main+148>:   test   eax,eax
   0x5555555549d6 <main+150>:   je     0x5555555549ee <main+174>
   0x5555555549d8 <main+152>:   lea    rdi,[rip+0xf7]        # 0x555555554ad6
   0x5555555549df <main+159>:   call   0x555555554780 <puts@plt>
Guessed arguments:
arg[0]: 0x555555756010 --> 0xa61616161 ('aaaa\n')
arg[1]: 0x555555554a98 ("7h3_m057_53cr37357_p455w0rd_y0u_3v3r_54w")
arg[2]: 0x28 ('(')
arg[3]: 0x555555554a98 ("7h3_m057_53cr37357_p455w0rd_y0u_3v3r_54w")
[------------------------------------stack-------------------------------------]
0000| 0x7fffffffe0e0 --> 0x7fffffffe1d0 --> 0x1
0008| 0x7fffffffe0e8 --> 0x555555756010 --> 0xa61616161 ('aaaa\n')
0016| 0x7fffffffe0f0 --> 0x555555554a10 (<__libc_csu_init>: push   r15)
0024| 0x7fffffffe0f8 --> 0x7ffff7a2d830 (<__libc_start_main+240>:   mov    edi,eax)
0032| 0x7fffffffe100 --> 0x1
0040| 0x7fffffffe108 --> 0x7fffffffe1d8 --> 0x7fffffffe46a ("/home/vagrant/share/yeahright/yeahright")
0048| 0x7fffffffe110 --> 0x1f7ffcca0
0056| 0x7fffffffe118 --> 0x555555554940 (<main>:    push   rbp)
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value

Breakpoint 2, 0x00005555555549cf in main ()
```

Submitting the string `7h3_m057_53cr37357_p455w0rd_y0u_3v3r_54w` to the server gives us the flag.

Flag
> TUCTF{n07_my_fl46_n07_my_pr0bl3m}
