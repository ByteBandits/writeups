So what we have here is a [zip](../BestShell_d3bed024e5edcddeadade8a638247f5e.zip) file. On extracting it we get a single executable.

```bash
$ file bestshell
bestshell: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=8b4c45947ca2795d92a94c560d91183710b4fea2, not stripped
```

A little bit of analysis shows us it was written in [Golang](https://github.com/golang). So I had to install Go as I had never used it before.

Its brief output!!


```bash
$ ./bestshell 
     _               _       _          _ _ 
	| |__   ___  ___| |_ ___| |__   ___| | |
	| '_ \ / _ \/ __| __/ __| '_ \ / _ \ | |
	| |_) |  __/\__ \ |_\__ \ | | |  __/ | |
	|_.__/ \___||___/\__|___/_| |_|\___|_|_| 

Available commands: 5azWRE, Ax7lIl, 312TUo, UgZInz
>> 5azWRE 
total 84
-rwxr-x--x 1 sudhakar sudhakar 36632 Oct  8 21:46 bestshell
-rw-r--r-- 1 sudhakar sudhakar 38191 Oct 10 10:22 bestshell.c
-rw-r--r-- 1 sudhakar sudhakar    59 Oct 10 14:36 peda-session-bestshell.txt
-rw-r--r-- 1 sudhakar sudhakar     1 Oct 10 12:56 peda-session-ls.txt

>> Ax7lIl 
Tue Oct 13 19:16:55 IST 2015

>> 312TUo 
Really? You think it's thaat easy?

>> UgZInz
Just... GO home. Please.

>> 
```

Gives no hint too. Lets load it in gdb-peda. Go has C-like main function as main.main. Lets set up a breakpoint and start. Stepping through the program we see

```bash
gdb-peda$ 
[----------------------------------registers-----------------------------------]
RAX: 0x4044d3 ("fOaFIcEPA*usHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RBX: 0xc210000030 --> 0xc210012120 --> 0x0 
RCX: 0x80000 
RDX: 0x68 ('h')
RSI: 0x1cb50 
RDI: 0x40005555 ('UU')
RBP: 0x7ffff7e55f60 --> 0x7ffff7e55f80 --> 0x0 
RSP: 0x7ffff7e556f0 --> 0x0 
RIP: 0x4020c4 (<main.main+318>:	movzx  eax,BYTE PTR [rax])
R8 : 0xbfffbfffbfffbfff 
R9 : 0x40000000 ('')
R10: 0x4000 ('')
R11: 0x7ffff7dd0950 --> 0x400000001 
R12: 0x7ffff74c9aa0 (cmp    rsp,QWORD PTR fs:0x70)
R13: 0xc210002200 --> 0x7ffff7b1a4a0 --> 0x7ffff7564170 (cmp    rsp,QWORD PTR fs:0x70)
R14: 0x0 
R15: 0x0
EFLAGS: 0x206 (carry PARITY adjust zero sign trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x4020b8 <main.main+306>:	mov    rax,QWORD PTR [rbp-0x48]
   0x4020bc <main.main+310>:	mov    BYTE PTR [rax+0x9],dl
   0x4020bf <main.main+313>:	mov    eax,0x4044d3
=> 0x4020c4 <main.main+318>:	movzx  eax,BYTE PTR [rax]
   0x4020c7 <main.main+321>:	mov    BYTE PTR [rbp-0x640],al
   0x4020cd <main.main+327>:	mov    eax,0x4044e7
   0x4020d2 <main.main+332>:	movzx  eax,BYTE PTR [rax]
   0x4020d5 <main.main+335>:	mov    BYTE PTR [rbp-0x63f],al
[------------------------------------stack-------------------------------------]
0000| 0x7ffff7e556f0 --> 0x0 
0008| 0x7ffff7e556f8 --> 0x0 
0016| 0x7ffff7e55700 --> 0x0 
0024| 0x7ffff7e55708 --> 0x0 
0032| 0x7ffff7e55710 --> 0x0 
0040| 0x7ffff7e55718 --> 0x0 
0048| 0x7ffff7e55720 --> 0x0 
0056| 0x7ffff7e55728 --> 0x0 
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value
0x00000000004020c4	41	in /home/kishor/code/go/src/github.com/kbhat95/bestshell/bestshell.go
```

Notice RAX and the next instruction. $al='f'
Seems like starting of flag :p

Stepping though we find similar strings in the flow.


```RAX: 0x4044d3 ("fOaFIcEPA*usHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x66 ('f')
RAX: 0x4044e7 ("l)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x6c ('l')
RAX: 0x4044d5 ("aFIcEPA*usHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x61 ('a')
RAX: 0x404504 --> 0x7d7b264c67 ('gL&{}')
RAX: 0x67 ('g')
RAX: 0x404507 --> 0x7d7b ('{}')
RAX: 0x7b ('{')
RAX: 0x4044c4 ("oVq39bNjS2nG^#XfOaFIcEPA*usHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x6f ('o')
RAX: 0x4044e4 ("h$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x68 ('h')
RAX: 0x4044fc ("mDZrxU@YgL&{}")
RAX: 0x6d ('m')
RAX: 0x4044f9 ("y6zmDZrxU@YgL&{}")
RAX: 0x79 ('y')
RAX: 0x4044cf ("G^#XfOaFIcEPA*usHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x47 ('G')
RAX: 0x4044d4 ("OaFIcEPA*usHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x4f ('O')
RAX: 0x4044f0 ("dK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x64 ('d')
RAX: 0x4044dd ("usHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x75 ('u')
RAX: 0x4044f5 ("Rt87y6zmDZrxU@YgL&{}")
RAX: 0x52 ('R')
RAX: 0x4044e9 ("41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x34 ('4')
RAX: 0x4044e0 ("wivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x77 ('w')
RAX: 0x4044c7 ("39bNjS2nG^#XfOaFIcEPA*usHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x33 ('3')
RAX: 0x4044de ("sHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x73 ('s')
RAX: 0x30 ('0')
RAX: 0x4044fc ("mDZrxU@YgL&{}")
RAX: 0x6d ('m')
RAX: 0x4044c7 ("39bNjS2nG^#XfOaFIcEPA*usHwivkh$Jl)41BTWeQdK!CpRt87y6zmDZrxU@YgL&{}")
RAX: 0x33 ('3')
RAX: 0x404508 --> 0x7d ('}')
RAX: 0x7d ('}')
```


We have our flag

> flag{ohmyGOduR4w3s0m3}


Yea! and so are you ;)