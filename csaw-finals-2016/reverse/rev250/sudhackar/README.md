[](ctf=csaw-finals-2016)
[](type=reverse)
[](tags=z3, constraint solving)
[](tools=z3)
[](techniques=constraint solving, symbolic execution)

# packer (rev-250)

We are given a [file](../packer-release)

```bash
$file packer-release
packer-release: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=30e7a8e386f33bb6bdf8a7701d7169584f9db7a9, stripped
```
Opening it in hopper gives a pretty neat decompilation.

```c
main() {
    esi = arg1;
    if (arg0 == 0x2) {
            eax = malloc(0x1f);
            ebx = eax;
            *0x804a034 = eax;
            eax = *(esi + 0x4);
            strncpy(ebx, eax, 0x1f);
            *(int8_t *)(ebx + 0x1e) = 0x0;
            edx = *(ebx + 0xd);
            eax = *(ebx + 0x15);
            if (eax + edx == 0xe1d4e090) {
                    *0x804a030 = *0x804a030 ^ 0xb93e4867;
            }
            if (eax + *(ebx + 0x19) == 0x94e860d0) {
                    *0x804a030 = *0x804a030 ^ 0xb9f7a2ff;
            }
            esi = *(ebx + 0x9);
            if (esi + eax == 0xcdd6d8c1) {
                    *0x804a030 = *0x804a030 ^ 0x7e3c14cd;
            }
            ecx = *(ebx + 0x11);
            if (ecx + *(ebx + 0x5) == 0x93e1a69f) {
                    *0x804a030 = *0x804a030 ^ 0x21ddc691;
            }
            if (esi + edx == 0xcd929799) {
                    *0x804a030 = *0x804a030 ^ 0x65aafd58;
            }
            if (eax + ecx == 0x9fa6cfd3) {
                    *0x804a030 = *0x804a030 ^ 0x372f660e;
            }
            if (edx + ecx == 0xa490e3a5) {
                    *0x804a030 = *0x804a030 ^ 0xcbff9345;
            }
            sub_8048513();
            eax = *0x804a034;
            ecx = *(eax + 0x5);
            edx = *(eax + 0x19);
            esi = edx + ecx;
            if (esi == 0x55dc64d0) {
                    *0x804a030 = *0x804a030 ^ 0x453057e3;
            }
            edi = *(*0x804a034 + 0x11);
            if (edi + edx == 0x5261e2d3) {
                    *0x804a030 = *0x804a030 ^ 0xe8d28fd7;
            }
            ebx = *(*0x804a034 + 0x9);
            if (edi + ebx == 0xcdd8a69f) {
                    *0x804a030 = *0x804a030 ^ 0xce71dd4a;
            }
            if (esi == 0x5497e5c0) {
                    *0x804a030 = *0x804a030 ^ 0xc30b088b;
            }
            esi = *(*0x804a034 + 0xd);
            if (esi + ecx == 0x939b9799) {
                    *0x804a030 = *0x804a030 ^ 0xb2c58526;
            }
            if (ecx + *(*0x804a034 + 0x15) == 0xa1dcd2c0) {
                    *0x804a030 = *0x804a030 ^ 0xa47e904c;
            }
            if (ebx + edx == 0x8fd364d0) {
                    *0x804a030 = *0x804a030 ^ 0x4d663570;
            }
            if (ecx + ebx == 0x92c8dec3) {
                    *0x804a030 = *0x804a030 ^ 0x5f3ceee9;
            }
            if (edx + esi == 0x80a79399) {
                    *0x804a030 = *0x804a030 ^ 0xbd87bd77;
            }
            if (*0x804a030 == 0xdeadbea7) {
                    eax = sub_80484f0();
            }
            else {
                    eax = sub_80484cd();
            }
    }
    else {
            stack[2042] = *esi;
            __printf_chk(0x1, "usage: %s flag\n", stack[2042]);
            eax = 0xffffffff;
    }
    return eax;
}

sub_8048513() {
    if ((((*(int8_t *)(*0x804a034 + 0x4) == 0x7b) && (*(int8_t *)(*0x804a034 + 0x2) == 0x61)) && (*(int8_t *)(*0x804a034 + 0x1) == 0x6c)) && (*(int8_t *)*0x804a034 == 0x66)) {
            if (*(int8_t *)(*0x804a034 + 0x3) == 0x67) {
                    if (*(int8_t *)(*0x804a034 + 0x1d) == 0x7d) {
                            *0x804a030 = *0x804a030 ^ 0x35e4eebf;
                    }
            }
    }
    return *0x804a034;
}
```

The logic is pretty straight forward. main() checks if the flag is in argv[1] and then checks the constraints on it. sub_8048513() checks if the flag is of format flag{%s} and then sets *0x804a030=0x35E4EEBF.

Its very easy to figure out the contraints here. 0x804a030 stores a xor checksum which should be equal to 0xdeadbea7 for the correct flag.

Since the remote hosts given to us were not so powerful to run angr and we did not have root on the local machines, I used z3 model this binary from the decompilation produced by hopper [here](rev250.py).

```python
from z3 import *

for i in xrange(6):
	globals()['a%i' % i]=BitVec('a%i' %i,32)

for i in xrange(16):
	globals()['xor_%i' % i]=BitVec('xor_%i' %i,32)

solver=Solver()

cons=[a2+a4 == 0xE1D4E090,a5+a4 == 0x94E860D0,a1+a4 == 0xCDD6D8C1,a0+a3 == 0x93E1A69F,a1+a2 == 0xCD929799,a3+a4 == 0x9FA6CFD3,a2+a3 == 0xA490E3A5,a0+a5 == 1440507088,a5+a3 == 1382146771,a1+a3 == 0xCDD8A69F,a0+a5 == 1419240896,a0+a2 == 0x939B9799,a4+a0 == 0xA1DCD2C0,a1+a5 == 0x8FD364D0,a1+a0 == 0x92C8DEC3,a2+a5 == 0x80A79399]
xor_a=[0xB93E4867,0xB9F7A2FF,0x7E3C14CD,0x21DDC691,0x65AAFD58,0x372F660E,0xCBFF9345,0x453057E3,0xE8D28FD7,0xCE71DD4A,0xC30B088B,0xB2C58526,0xA47E904C,0x4D663570,0x5F3CEEE9,0xBD87BD77]

for i in xrange(16):
	globals()['xor_%i' % i]=xor_a[i]

xor_w=BitVecVal(0x35E4EEBF,32)

temp=BitVec('temp',32)

for i in xrange(16):
	temp=xor_w^globals()['xor_%i' % i]
	xor_w=If((cons[i]),temp,xor_w)

solver.add(xor_w == 0xDEADBEA7)

print solver.check()

modl=solver.model()

res=""
for i in xrange(6):
    obj=globals()['a%i' % i]
    c=modl[obj].as_long()
    res += hex(c)[2:].decode('hex')[::-1]

print("Result: flag{%s}"%res)
```

gives us flag{alg3bra_1z_sti11_fun_y0!} in no time.
