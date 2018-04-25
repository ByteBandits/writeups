[](ctf=blaze-2018)
[](type=re)
[](tags=game)
[](techniques=bruteforce)

# magic-re (re-420)

```
One binary, two challenges - double the fun

magic-re: Reverse me | magic-pwn: Pwn me

Note: for magic-re, 4 flags can work, but only one makes sense and is the one to be submitted.

Author : DuSu

Solves : ~35
```

This was an interesting chall, but due to a side channel it was easier to brute force this like the other RE chall.
The input given was put into a code template and then executed byte by byte. The instructions allowed were


```python
>>> from pwn import *
>>> for i in xrange(0x40, 0x60):
...     print i, disasm(chr(i))
... 
64    0:   40                      inc    eax
65    0:   41                      inc    ecx
66    0:   42                      inc    edx
67    0:   43                      inc    ebx
68    0:   44                      inc    esp
69    0:   45                      inc    ebp
70    0:   46                      inc    esi
71    0:   47                      inc    edi
72    0:   48                      dec    eax
73    0:   49                      dec    ecx
74    0:   4a                      dec    edx
75    0:   4b                      dec    ebx
76    0:   4c                      dec    esp
77    0:   4d                      dec    ebp
78    0:   4e                      dec    esi
79    0:   4f                      dec    edi
80    0:   50                      push   eax
81    0:   51                      push   ecx
82    0:   52                      push   edx
83    0:   53                      push   ebx
84    0:   54                      push   esp
85    0:   55                      push   ebp
86    0:   56                      push   esi
87    0:   57                      push   edi
88    0:   58                      pop    eax
89    0:   59                      pop    ecx
90    0:   5a                      pop    edx
91    0:   5b                      pop    ebx
92    0:   5c                      pop    esp
93    0:   5d                      pop    ebp
94    0:   5e                      pop    esi
95    0:   5f                      pop    edi
```
based on how we manipulate stack/registers the context was then compared to an already saved state later. Since this was `memcmp` check it made me guess the key byte by byte.

First I LD_PRELOAD the implementation of `memcmp` such that it returns the number of bytes matched. Then based on the result I can deduce the best char for an iteration.

peloaded memcmp, built as a .so to LD_PRELOAD

```c
int memcmp(const char *s1, const char *s2, int n){
    int i;
    int cnt = 0;
    for(i=0; i < n; ++i){
        if(s1[i] == s2[i]) cnt++;
        else break;
    }
    return cnt;
}

```

driver script to bruteforce byte by byte

```python
import subprocess

prev = "^_^ONE_BYTE_INSTRUCTION_FLAG_IZ_CLASSY_AND_FUN"
for _ in xrange(20):
    cnt = []
    for i in xrange(0x40,0x60):
        open("input", "w+").write(prev+chr(i)) 
        d = subprocess.Popen("gdb -q -x ./magic.py ", shell=True, stdout=subprocess.PIPE).stdout.read().strip()
        try:
            c = int(d.split(":::::")[1])
        except:
            c = -1
        cnt.append((c, i))
    best = sorted(cnt ,key=lambda x: x[0], reverse=True)[0]
    prev += chr(best[1])
    print prev, best 
```

gdb script to check the value of memcmp

```python

import gdb

class MyBreakpoint(gdb.Breakpoint):
    def stop (self):
        eax = int(gdb.parse_and_eval("$eax").cast(gdb.lookup_type('uint32_t')))
        print(":::::%d:::::" % eax)
        return False

gdb.execute('file ./magic')
gdb.execute("set environment LD_PRELOAD /tmp/memcmp.so")
gdb.execute("set verbose off")
MyBreakpoint("*0x8048947")
gdb.execute("run < input > output")
gdb.execute("set confirm off")
gdb.execute('quit')
```
