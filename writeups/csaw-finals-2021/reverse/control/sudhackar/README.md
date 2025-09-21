[](ctf=csaw-finals-2021)
[](type=reverse)
[](tags=ida)
[](tools=ida,pin,gdb)

# control (re)

```sh
[csaw] file control control.bin
control:     ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=4276a8d2c0e4c4a4e0e444f7f10d3f4b2c2b0409, for GNU/Linux 3.2.0, stripped
control.bin: data
```

2 files were provided. ELF was about 15K in size and the bin file was about 21K. The ELF is not obfuscated and easily decompiles in IDA to a very simple C code.

The binary has implemented a custom VM and control.bin is the bytecode. `main` function loads the bytecode and has the vm evaluation loop.

```c
  while ( op >= 0 )
  {
    op = ptr[vip];
    if ( (op & 0x40000) != 0 )
      c = r6 + r7;
    if ( (op & 0x80000) != 0 )
      c = r6 * r7;
    if ( (op & 0x20000) != 0 )
    {
      if ( r7 <= 0 )
        v3 = r6 << -(char)r7;
      else
        v3 = (unsigned int)r6 >> r7;
      c = v3;
    }
    if ( (op & 0x100000) != 0 )
      c = r6 ^ r7;
    if ( (op & 0x200000) != 0 )
      c = r6 == r7;
    if ( (op & 4) != 0 )
      ridx = r1;
    if ( (op & 0x20) != 0 )
      ridx = r2;
    if ( (op & 0x100) != 0 )
      ridx = r3;
    if ( (op & 0x800) != 0 )
      ridx = r4;
    if ( (op & 0x4000) != 0 )
      ridx = r5;
    if ( (op & 2) != 0 )
      c = r1;
    if ( (op & 0x10) != 0 )
      c = r2;
    if ( (op & 0x80) != 0 )
      c = r3;
    if ( (op & 0x400) != 0 )
      c = r4;
    if ( (op & 0x2000) != 0 )
      c = r5;
    if ( (op & 0x800000) != 0 )
      c = dword_4080[ridx];
    if ( (op & 0x4000000) != 0 )
      c = ptr[vip + 1];
    if ( (op & 0x8000000) != 0 )
      c = ptr[ridx];
    if ( (op & 0x2000000) != 0 )
      c = getchar();
    if ( (op & 1) != 0 )
      r1 = c;
    if ( (op & 8) != 0 )
      r2 = c;
    if ( (op & 0x40) != 0 )
      r3 = c;
    if ( (op & 0x200) != 0 )
      r4 = c;
    if ( (op & 0x1000) != 0 )
      r5 = c;
    if ( (op & 0x8000) != 0 )
      r6 = c;
    if ( (op & 0x10000) != 0 )
      r7 = c;
    if ( (op & 0x400000) != 0 )
      dword_4080[ridx] = c;
    if ( (op & 0x1000000) != 0 )
      putchar(c);
    if ( (op & 0x10000000) != 0 )
      ++vip;
    if ( (op & 0x20000000) != 0 )
      vip += 2;
    if ( (op & 0x40000000) != 0 )
      vip = c;
  }
```

The code is pretty simple and can be copied to python to write a disassembler - I lost this script but have the bytecode disassembled which looked something like this
```
0x0 : c = ffff
r5 = c
vip += 2
0x2 : c = 47e
vip = c
...
0x47e : c = 594
r1 = c
vip += 2
0x480 : ridx = r5
c = 488
dword_4080[ridx] = c
vip += 2
0x482 : c = r5
r6 = c
++vip
0x483 : c = ffffffff
r7 = c
vip += 2
0x485 : c = r6 + r7
r5 = c
++vip
0x486 : c = 51
vip = c
0x487 : c = r2
r1 = c
r3 = c
0x488 : c = 9ad
r1 = c
vip += 2
```

I worked on this text file for a while and found some patterns than can fix this ugly mess to a single line for almost all instructions using simple search and replace in vscode.

```
0x0 : r5 = ffff
0x2 : vip = 47e
...
0x47e : r1 = 594
0x480 : ridx = r5
dword_4080[ridx] = 488
0x482 : r6 = r5
0x483 : r7 = ffffffff
0x485 : r5 = r6 + r7
0x486 : vip = 51
0x487 : r1 = r2
r3 = c
0x488 : r1 = 9ad
```

Base on this I started analysing the vm code annotating the disassembly with comments something like

```
0x51 : ridx = r5 ; print text to stdout
0x19b : r6 = r1 ; length check flag{AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA}
0x1b6 : r7 = 7d ; close bracket check
0x1f6 : r3 = 41c64e6d ; rand
0x218 : ridx = r5 ; fuck 3 bit split
0x232 : dword_4080[ridx] = r4 ; save lsb and right shift loop for r1
0x24b : r3 = 0 ; fuck 2
0x257 : r4 = dword_4080[ridx] ; input bytes after flag{
0x26e : vip = 218 ; go to split to bits
0x30a : ridx = r5 ; change bits
0x314 : r3 = dword_4080[ridx] ; bit xchange
0x3ce : ridx = r5 ; fuck 1
0x421 : r6 = r1 ; fuck this check only
0x530 : r6 = r1 ; initial check succcess??
0x544 : r1 = d42 ; print Checking flag...
0x55d : r6 = r6 == r7 ; last check but what?
```

After spending some time I got a vague idea of what the VM was doing. To verify my guesses I wrote a [pintool](tool.cpp) which logged some registers and some stack on each iteration of the evaluator loop. Here is the hook for each interation loop of the vm evaluation

```cpp
VOID logme(ADDRINT ip, CONTEXT *ctx)
{
  if ((ip & 0xff) != 0x6a)
  {
    return;
  }
  PIN_REGISTER regval;
  PIN_GetContextRegval(ctx, REG_EDX, reinterpret_cast<UINT8 *>(&regval));
  outFile << std::hex << regval.dword[0] << "::::";
  ADDRINT value;
  for(int i = 0; i <= 10; i++) {
    ADDRINT *op2 = (ADDRINT *)(ip + 11474 + i*4);
    PIN_SafeCopy(&value, op2, sizeof(ADDRINT));
    outFile << (value & 0xffffffff) << " ";
  }
  outFile << endl;
}
```

This let me build the dump with concrete input bytes and trace the vm execution with my guessed inputs. Additionally just for fun I used the disassembler code to generate valid x86 which could be assembled and run [script](diss.py).

```
[csaw] python diss.py > a1.asm
[csaw] nasm -f elf32 a1.asm && ld -m elf_i386 a1.o
[csaw] ./a.out
Hello...
Do you have:
 ██████╗ ██████╗ ███╗   ██╗████████╗██████╗  ██████╗ ██╗   ██████╗
██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔═══██╗██║   ╚════██╗
██║     ██║   ██║██╔██╗ ██║   ██║   ██████╔╝██║   ██║██║     ▄███╔╝
██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██╗██║   ██║██║     ▀▀══╝
╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║╚██████╔╝███████╗██╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝
(y/N): Nice!
And do you have:
 █████╗     ███████╗██╗      █████╗  ██████╗██████╗
██╔══██╗    ██╔════╝██║     ██╔══██╗██╔════╝╚════██╗
███████║    █████╗  ██║     ███████║██║  ███╗ ▄███╔╝
██╔══██║    ██╔══╝  ██║     ██╔══██║██║   ██║ ▀▀══╝
██║  ██║    ██║     ███████╗██║  ██║╚██████╔╝ ██╗
╚═╝  ╚═╝    ╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═╝
(y/N): Give flag: Checking flag...
 ██████╗ ██████╗ ██████╗ ██████╗ ███████╗ ██████╗████████╗██╗
██╔════╝██╔═══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝╚══██╔══╝██║
██║     ██║   ██║██████╔╝██████╔╝█████╗  ██║        ██║   ██║
██║     ██║   ██║██╔══██╗██╔══██╗██╔══╝  ██║        ██║   ╚═╝
╚██████╗╚██████╔╝██║  ██║██║  ██║███████╗╚██████╗   ██║   ██╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝   ╚═╝   ╚═╝
```

I opened generated x86 the binary in IDA, the trace and VM disassembly in vscode and simultaneously spent some time annotating parts of code.
The bytecode had a long loop which did nothing but printing out to stdout slower just to look cool, Once I understood the bytecode I patched that out too.

The VM bytecode had a LCG based pseudo RNG too. Here's what it did

+ Print fancy colored text on stdout
+ Ask for y/n for input
+ Ask for flag input
+ read flag byte by byte using `getchar`
+ check if starts with flag{ and ends with } and length is 0x2e
    + Failure gives Segfault style output
+ took bytes after flag{ in froup of 8
+ split them to individual bits 8b -> 64 bits
+ Seed LCG with 0 - increment each iteration of 8 bytes. 40 bytes - 5 count
+ Use the LCG to generate a couple of indexes - swap those 2 bits - 0x1337 times
+ Use the LCG to generate index to flip the bits - 0x1337 times
+ Load stored set of bytes from the bytecode at index 0x148b
+ split that to bits and compare with transformed input bits

The operations performed on the input are easy to reverse and the harcoded bytes can be loaded like this

```python
In [1]: from pwn import *

In [2]: sc = open("./control.bin", "rb").read()

In [3]: [hex(u32(sc[i*4:(i+1)*4])) for i in range(0x148b, 0x148b+40)]

```
Precalc all needed LCG values and consume them in reverse while reversing the operations.

```python
x = [0x85, 0xf5, 0xdd, 0xa8, 0x1, 0xc8, 0x8, 0xba, 0xaa, 0xf8, 0xb8, 0xc1, 0x95, 0x4a, 0x5b, 0xa, 0x4c, 0xb1, 0x88, 0xc5, 0xf7, 0x99, 0x30, 0x2, 0x92, 0xe8, 0x93, 0x9f, 0xdb, 0xc, 0x5a, 0x81, 0x97, 0xfc, 0xf1, 0xae, 0xed, 0x31, 0x91, 0x9a]

c = 0
def r():
    global c
    c = (0x41C64E6D * c + 0x3039) & 0xffffffff
    c = (c << 1) & 0xffffffff
    c = c >> 1
    return c

def bit_not(n, numbits=1):
    return (1 << numbits) - 1 - n

f = ""
for _i in range(5):
    c = _i
    all_r = [0] + [r()%64 for i in range(0x1337*3)]

    bits = [0 for i in range(64)]
    for i in range(8):
        for j in range(8):
            bits[i*8+j] = (x[(_i*8)+i] >> j) & 1

    for i in range(0x1337):
        bits[all_r[(0x1337*3)-i]] = bit_not(bits[all_r[(0x1337*3)-i]])
    for i in range(0x1337):
        t = bits[all_r[(0x1337*2)-(i*2)]]
        s = bits[all_r[(0x1337*2)-(i*2+1)]]
        bits[all_r[(0x1337*2)-(i*2)]] = s
        bits[all_r[(0x1337*2)-(i*2+1)]] = t

    m = [0 for i in range(8)]
    for i in range(8):
        for j in range(8):
            m[i] |= (bits[i*8+j] << j)

    f+="".join(map(chr, m))

print(f)
```

Get the flag
```
flag{wh0_n33ds_opc0des_wh3n_you_h4ve_CONTROL?}
```
