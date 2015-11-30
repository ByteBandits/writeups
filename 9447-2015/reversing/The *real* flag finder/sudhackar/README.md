[](ctf=9447-2015)
[](type=reversing)
[](tags=xor,memcmp)
[](tools=gdb-peda,Hopper)

# The *real* flag finder (Reversing 70)
So we are given an [executable](../flagFinderRedux-e72e7ac9b16b8f40acd337069f94d524).

```bash
$ file  flagFinderRedux-e72e7ac9b16b8f40acd337069f94d524
flagFinderRedux-e72e7ac9b16b8f40acd337069f94d524: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=8c0c9c0d5c39ff0cc1954fa8682288b6169b8fff, stripped
```

A quick decompilation.

```c
  if ( argc == 2 )
  {
    v10 = (unsigned int)n - 1LL;
    v3 = alloca(16 * (((unsigned __int64)(unsigned int)n + 15) / 0x10));
    dest = (char *)&v6;
    strcpy((char *)&v6, src);
    v9 = 0;
    v8 = 0;
    while ( memcmp(dest, "9447", 4uLL) )
    {
      v4 = v8 % (unsigned int)n;
      v5 = dest[v8 % (unsigned int)n];
      dest[v4] = (unsigned __int64)sub_40060D() ^ v5;
      ++v8;
    }
    if ( !memcmp(dest, *(const void **)(v6 + 8), (unsigned int)n) )
      printf("The flag is %s\n", *(_QWORD *)(v6 + 8), v6);
    else
      puts("Try again");
    result = 0LL;
  }
  else
  {
    printf("Usage: %s <password>\n", *(_QWORD *)v6, v6);
    result = 1LL;
  }
  return result;
```

As it is quite clear all we have to do is to check the last memcmp string to which the given password is compared.
We objdump the file and find memcmp in it and check its passed parameters- All in this snippet.

```bash
sudhakar@Hack-Machine:~/Desktop/ctf/sep_15/9447-ctf/reversing$ objdump -S ./flagFinderRedux-e72e7ac9b16b8f40acd337069f94d524 | grep memcmp
0000000000400500 <memcmp@plt>:
  400703:	e8 f8 fd ff ff       	callq  400500 <memcmp@plt>
  400729:	e8 d2 fd ff ff       	callq  400500 <memcmp@plt>
sudhakar@Hack-Machine:~/Desktop/ctf/sep_15/9447-ctf/reversing$ gdb -q ./flagFinderRedux-e72e7ac9b16b8f40acd337069f94d524 
Reading symbols from ./flagFinderRedux-e72e7ac9b16b8f40acd337069f94d524...(no debugging symbols found)...done.
gdb-peda$ b *0x400729
Breakpoint 1 at 0x400729
gdb-peda$ r lol
Starting program: /home/sudhakar/Desktop/ctf/sep_15/9447-ctf/reversing/flagFinderRedux-e72e7ac9b16b8f40acd337069f94d524 lol
warning: the debug information found in "/lib64/ld-2.19.so" does not match "/lib64/ld-linux-x86-64.so.2" (CRC mismatch).

[----------------------------------registers-----------------------------------]
RAX: 0x7fffffffe0d0 ("9447{C0ngr47ulaT1ons_p4l_buddy_y0Uv3_solved_the_re4l__H4LT1N6_prObL3M}")
RBX: 0x3 
RCX: 0x7fffffffe57f --> 0x5f474458006c6f6c ('lol')
RDX: 0x46 ('F')
RSI: 0x7fffffffe57f --> 0x5f474458006c6f6c ('lol')
RDI: 0x7fffffffe0d0 ("9447{C0ngr47ulaT1ons_p4l_buddy_y0Uv3_solved_the_re4l__H4LT1N6_prObL3M}")
RBP: 0x7fffffffe170 --> 0x0 
RSP: 0x7fffffffe0d0 ("9447{C0ngr47ulaT1ons_p4l_buddy_y0Uv3_solved_the_re4l__H4LT1N6_prObL3M}")
RIP: 0x400729 (call   0x400500 <memcmp@plt>)
R8 : 0x46 ('F')
R9 : 0x0 
R10: 0x7fffffffde90 --> 0x0 
R11: 0x7ffff7b9dc70 --> 0xfffdb3e0fffdb10f 
R12: 0x7fffffffe120 --> 0x7fffffffe258 --> 0x7fffffffe519 ("/home/sudhakar/Desktop/ctf/sep_15/9447-ctf/reversing/flagFinderRedux-e72e7ac9b16b8f40acd337069f94d524")
R13: 0x69 ('i')
R14: 0x0 
R15: 0x0
EFLAGS: 0x216 (carry PARITY ADJUST zero sign trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x40071f:	mov    rax,QWORD PTR [rbp-0x28]
   0x400723:	mov    rsi,rcx
   0x400726:	mov    rdi,rax
=> 0x400729:	call   0x400500 <memcmp@plt>
   0x40072e:	test   eax,eax
   0x400730:	jne    0x400751
   0x400732:	mov    rax,QWORD PTR [rbp-0x50]
   0x400736:	add    rax,0x8
Guessed arguments:
arg[0]: 0x7fffffffe0d0 ("9447{C0ngr47ulaT1ons_p4l_buddy_y0Uv3_solved_the_re4l__H4LT1N6_prObL3M}")
arg[1]: 0x7fffffffe57f --> 0x5f474458006c6f6c ('lol')
arg[2]: 0x46 ('F')
arg[3]: 0x7fffffffe57f --> 0x5f474458006c6f6c ('lol')
[------------------------------------stack-------------------------------------]
0000| 0x7fffffffe0d0 ("9447{C0ngr47ulaT1ons_p4l_buddy_y0Uv3_solved_the_re4l__H4LT1N6_prObL3M}")
0008| 0x7fffffffe0d8 ("gr47ulaT1ons_p4l_buddy_y0Uv3_solved_the_re4l__H4LT1N6_prObL3M}")
0016| 0x7fffffffe0e0 ("1ons_p4l_buddy_y0Uv3_solved_the_re4l__H4LT1N6_prObL3M}")
0024| 0x7fffffffe0e8 ("_buddy_y0Uv3_solved_the_re4l__H4LT1N6_prObL3M}")
0032| 0x7fffffffe0f0 ("0Uv3_solved_the_re4l__H4LT1N6_prObL3M}")
0040| 0x7fffffffe0f8 ("ved_the_re4l__H4LT1N6_prObL3M}")
0048| 0x7fffffffe100 ("re4l__H4LT1N6_prObL3M}")
0056| 0x7fffffffe108 ("LT1N6_prObL3M}")
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value

Breakpoint 1, 0x0000000000400729 in ?? ()
```

will give us flag

> 9447{C0ngr47ulaT1ons_p4l_buddy_y0Uv3_solved_the_re4l__H4LT1N6_prObL3M}