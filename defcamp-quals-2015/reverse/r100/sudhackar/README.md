[](ctf=defcamp-quals-2015)
[](type=exploit)
[](tags=shift-cipher)

We are given a [binary](../r100.bin).

```bash
$ file r100.bin 
r100.bin: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=0f464824cc8ee321ef9a80a799c70b1b6aec8168, stripped
```
On running it asks for a password and checks it.

```bash
$ ./r100.bin 
Enter the password: AAAAAA
Incorrect password!
```

A quick strace shows its protected from debugging using [ptrace](https://en.wikipedia.org/wiki/Ptrace).

```bash
$ strace ./r100.bin 
.
.
ptrace(PTRACE_TRACEME, 0, 0, 0)         = -1 EPERM (Operation not permitted)
```
So gdb won't work normally. The technique I used involved changing the return value in runtime during gdb debugging.

```bash
$ objdump -d sep_15/d-ctf/r100.bin | grep \<ptrace@plt\>
0000000000400600 <ptrace@plt>:
  4007da:	e8 21 fe ff ff       	callq  400600 <ptrace@plt>
```
```bash
gdb-peda$ b *0x4007df
Breakpoint 1 at 0x4007df
gdb-peda$ r
.
.
gdb-peda$ set $rax=0
``` 
This will do the job. Now back to reversing.
A brief decompilation gives us 
```c
int check(char *input)
{
  int i;
  char p1[8] = "Dufhbmf"; // [bp-20h]
  char p2[8] = "pG`imos"; // [bp-18h]
  char p3[8] = "ewUglpt"; // [bp-10h]
  for ( i = 0; i <= 11; ++i )
  {
    if ( p1[8 * (i % 3)] + 2 * (i / 3)) - (input[i]) != 1 )
      return 1;
  }
  return 0;
}
```
It is checking our input against the values in the fashion given above. The only effective chars we need 

> Dpef`Ubmlfst 

Our password should be 1 less than each of chars.
```bash
$ python -c "print (''.join(chr(ord(i)-1) for i in 'Dpef\`Ubmlfst'))"
Code_Talkers
```
Flag
> Code_Talkers