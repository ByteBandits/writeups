[](ctf=csaw-finals-2019)
[](type=reverse)
[](tags=ida)
[](tools=ida)

# counting (re-200)

[Binary](../counting)

The flag was referenced in different functions to check one byte each. IDA xrefs
did not work properly. So we just grep over the disassembly to find all 30
bytes in the flag.

```python
from idautils import *
from idaapi import *
from idc import *
from sark import *
flag = [32 for i in xrange(32)]

for segea in Segments():
    for funcea in Functions(segea, SegEnd(segea)):
        functionName = GetFunctionName(funcea)
        print functionName
        f = Function(funcea)
        last_idx = 0
        for line in f.lines:
            if "cs:flag" in line.disasm:
                if "+" in line.disasm:
                    last_idx = int(line.disasm.split("+")[1].replace("h", ""), 16)
            elif "sub     cl" in line.disasm:
                try:
                    print last_idx
                    b = int(line.disasm.split(",")[1].replace("h", ""), 16)
                    flag[last_idx] = b
                except:
                    pass

for i, j in enumerate("flag{"):
    flag[i] = ord(j)

flag[30] = ord("}")

print "".join(map(chr,flag))
```
