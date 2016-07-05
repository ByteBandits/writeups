***DEBUG32***

*category:reverse engineering*  *points:70*

When the given binary was analysed it was found to be a 32-bit,stripped file.

```bash
hulkbuster@Jarvis:~/Downloads$ file debug32
debug32: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=46b87dea3b50c74ec8cde885ccc9a4d9e5e260f3, stripped
```
Opening the file with IDA,Analyxing the code flow, it id=s found that there exists a funtion that "prints flag".

![bump](files/ida.png)

Now setting a random break point at an address then changing the pointer EIP to the above function's address prints the flag.

```bash
gdb-peda$ file debug32
Reading symbols from debug32...(no debugging symbols found)...done.
gdb-peda$ break *0x080483a0
Breakpoint 1 at 0x80483a0
gdb-peda$ r
Starting program: /home/hulkbuster/Downloads/debug32 
[----------------------------------registers-----------------------------------]
EAX: 0xf7ffd938 --> 0x0 
EBX: 0xf7ffd000 --> 0x22f08 
ECX: 0x0 
EDX: 0xf7fe91d0 (push   ebp)
ESI: 0xffffd7ec --> 0xffffd9b3 ("XDG_VTNR=2")
EDI: 0x80483a0 (xor    ebp,ebp)
EBP: 0x0 
ESP: 0xffffd7e0 --> 0x1 
EIP: 0x80483a0 (xor    ebp,ebp)
EFLAGS: 0x282 (carry parity adjust zero SIGN trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x804839a:	add    BYTE PTR [eax],al
   0x804839c:	add    BYTE PTR [eax],al
   0x804839e:	add    BYTE PTR [eax],al
=> 0x80483a0:	xor    ebp,ebp
   0x80483a2:	pop    esi
   0x80483a3:	mov    ecx,esp
   0x80483a5:	and    esp,0xfffffff0
   0x80483a8:	push   eax
[------------------------------------stack-------------------------------------]
0000| 0xffffd7e0 --> 0x1 
0004| 0xffffd7e4 --> 0xffffd990 ("/home/hulkbuster/Downloads/debug32")
0008| 0xffffd7e8 --> 0x0 
0012| 0xffffd7ec --> 0xffffd9b3 ("XDG_VTNR=2")
0016| 0xffffd7f0 --> 0xffffd9be ("XDG_SESSION_ID=c4")
0020| 0xffffd7f4 --> 0xffffd9d0 ("CLUTTER_IM_MODULE=")
0024| 0xffffd7f8 --> 0xffffd9e3 ("SESSION=gnome")
0028| 0xffffd7fc --> 0xffffd9f1 ("GPG_AGENT_INFO=/tmp/gpg-BPjAU3/S.gpg-agent:1719:1")
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value

Breakpoint 1, 0x080483a0 in ?? ()
gdb-peda$ set $eip=0x0804849b
gdb-peda$ c
Continuing.
Printing flag
***i_has_debugger_skill***

Program received signal SIGSEGV, Segmentation fault.
[----------------------------------registers-----------------------------------]
EAX: 0x0 
EBX: 0xf7ffd000 --> 0x22f08 
ECX: 0xf7fadad0 --> 0x0 
EDX: 0xa ('\n')
ESI: 0xffffd7ec --> 0xffffd9b3 ("XDG_VTNR=2")
EDI: 0x80483a0 (xor    ebp,ebp)
EBP: 0x0 
ESP: 0xffffd7e4 --> 0xffffd990 ("/home/hulkbuster/Downloads/debug32")
EIP: 0x1
EFLAGS: 0x10246 (carry PARITY adjust ZERO sign trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
Invalid $PC address: 0x1
[------------------------------------stack-------------------------------------]
0000| 0xffffd7e4 --> 0xffffd990 ("/home/hulkbuster/Downloads/debug32")
0004| 0xffffd7e8 --> 0x0 
0008| 0xffffd7ec --> 0xffffd9b3 ("XDG_VTNR=2")
0012| 0xffffd7f0 --> 0xffffd9be ("XDG_SESSION_ID=c4")
0016| 0xffffd7f4 --> 0xffffd9d0 ("CLUTTER_IM_MODULE=")
0020| 0xffffd7f8 --> 0xffffd9e3 ("SESSION=gnome")
0024| 0xffffd7fc --> 0xffffd9f1 ("GPG_AGENT_INFO=/tmp/gpg-BPjAU3/S.gpg-agent:1719:1")
0028| 0xffffd800 --> 0xffffda23 ("VTE_VERSION=4002")
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value
Stopped reason: SIGSEGV
0x00000001 in ?? ()
gdb-peda$ 
'''

TEAM BYTEBANDITS
