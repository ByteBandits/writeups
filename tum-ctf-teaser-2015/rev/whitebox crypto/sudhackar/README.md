[](ctf=tum-ctf-teaser-2015)
[](type=rev)
[](tags=xtea)
[](tool=pwntools)

# whitebox crypto (rev 20)

So we have an [executable](../xtea)

Problem statement
```
Do not panic, it's only XTEA! I wonder what the key was...
```

Little bit of google we get this piece of code from [Wikipedia](https://en.wikipedia.org/wiki/XTEA)
```c
void encipher(unsigned int num_rounds, uint32_t v[2], uint32_t const key[4]) {
    unsigned int i;
    uint32_t v0=v[0], v1=v[1], sum=0, delta=0x9E3779B9;
    for (i=0; i < num_rounds; i++) {
        v0 += (((v1 << 4) ^ (v1 >> 5)) + v1) ^ (sum + key[sum & 3]);
        sum += delta;
        v1 += (((v0 << 4) ^ (v0 >> 5)) + v0) ^ (sum + key[(sum>>11) & 3]);
    }
    v[0]=v0; v[1]=v1;
}
```
Given file
```bash
$ file ./xtea
./xtea: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=331f96cc8eefbf07d5752cf9e8cf4facb32ba8ff, not stripped
```

A little bit of analysis shows we have to give something as argv[1] of length 16 as input

```bash
$ ./xtea AAAAAAAAAAAAAAAA
4a584fe6 116e650b
```

It returns the input "encrypted". We have to find the key.
The code from Wikipedia says key[4] would be having 4 blocks of length 4. So the key is of length 16.
sum=0 at the start of the process and it cumulatively adds delta to it which is added to key[i] in some fashion.
We see an encipher function in the file.

```objdump
gdb-peda$ pdisass encipher
Dump of assembler code for function encipher:
   0x00000000004005a0 <+0>:		mov    ecx,DWORD PTR [rdi+0x4]
   0x00000000004005a3 <+3>:		push   r12
   0x00000000004005a5 <+5>:		push   rbp
   0x00000000004005a6 <+6>:		push   rbx
   0x00000000004005a7 <+7>:		mov    edx,ecx
   0x00000000004005a9 <+9>:		mov    eax,ecx
   0x00000000004005ab <+11>:	shr    edx,0x5
   0x00000000004005ae <+14>:	shl    eax,0x4
   0x00000000004005b1 <+17>:	xor    eax,edx
   0x00000000004005b3 <+19>:	add    eax,ecx
   0x00000000004005b5 <+21>:	xor    eax,0x7b707868
   0x00000000004005ba <+26>:	add    eax,DWORD PTR [rdi]
   0x00000000004005bc <+28>:	mov    r10d,eax
   0x00000000004005bf <+31>:	mov    edx,eax
   0x00000000004005c1 <+33>:	shl    eax,0x4
   0x00000000004005c4 <+36>:	shr    r10d,0x5
   0x00000000004005c8 <+40>:	xor    r10d,eax
   0x00000000004005cb <+43>:	add    r10d,edx
   0x00000000004005ce <+46>:	xor    r10d,0x1b58ea2e
   0x00000000004005d5 <+53>:	lea    r11d,[r10+rcx*1]
   0x00000000004005d9 <+57>:	mov    r9d,r11d
   0x00000000004005dc <+60>:	mov    eax,r11d
   0x00000000004005df <+63>:	shl    eax,0x4
   0x00000000004005e2 <+66>:	shr    r9d,0x5
   0x00000000004005e6 <+70>:	xor    r9d,eax
   0x00000000004005e9 <+73>:	add    r9d,r11d
   0x00000000004005ec <+76>:	xor    r9d,0xba9ae30
   0x00000000004005f3 <+83>:	lea    eax,[r9+rdx*1]
   0x00000000004005f7 <+87>:	mov    r12d,eax
   0x00000000004005fa <+90>:	mov    edx,eax
   0x00000000004005fc <+92>:	shl    edx,0x4
   0x00000000004005ff <+95>:	shr    r12d,0x5
   0x0000000000400603 <+99>:	xor    r12d,edx
   0x0000000000400606 <+102>:	add    r12d,eax
   0x0000000000400609 <+105>:	xor    r12d,0x9bd661db
   0x0000000000400610 <+112>:	lea    r10d,[r12+r11*1]
   0x0000000000400614 <+116>:	mov    r8d,r10d
   0x0000000000400617 <+119>:	mov    edx,r10d
   0x000000000040061a <+122>:	shl    edx,0x4
   0x000000000040061d <+125>:	shr    r8d,0x5
   0x0000000000400621 <+129>:	xor    r8d,edx
   0x0000000000400624 <+132>:	add    r8d,r10d
   0x0000000000400627 <+135>:	xor    r8d,0x9bd661db
   0x000000000040062e <+142>:	lea    r9d,[r8+rax*1]
   0x0000000000400632 <+146>:	mov    ebp,r9d
   0x0000000000400635 <+149>:	mov    eax,r9d
   0x0000000000400638 <+152>:	shl    eax,0x4
   0x000000000040063b <+155>:	shr    ebp,0x5
   0x000000000040063e <+158>:	xor    ebp,eax
   0x0000000000400640 <+160>:	add    ebp,r9d
   0x0000000000400643 <+163>:	xor    ebp,0x4818a1a2
   0x0000000000400649 <+169>:	lea    r12d,[rbp+r10*1+0x0]
   .
   .
   .

```
Looking at it we can say the key is hardcoded here.
So we start with sum=0 and keep it increasing by delta .The hardcoded values in hex are (sum + key[sum & 3]) and (sum + key[(sum>>11) & 3])
Little bit of unpacking to do.

```python
>>> from pwn import *
>>> p32(0x7b707868)
'hxp{'
>>> delta=0x9e3779b9
>>> p32((0x1b58ea2e-delta)&0xffffffff)
'up!}'
>>> p32((0xba9ae30-delta)&0xffffffff)
'w4rm'
>>> p32((0x9bd661db-delta*2)&0xffffffff)
'ing_'
```

gives us flag
>hxp{w4rming_up!}

