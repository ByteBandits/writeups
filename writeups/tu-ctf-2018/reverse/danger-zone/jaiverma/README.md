[](ctf=tu-ctf-2018)
[](type=reversing)
[](tags=python,pyc)
[](tools=uncompyle6,python)

# Danger Zone
We are given a python bytecode [file](../dangerzone.pyc).

We can decompile it with **uncompyle6**.

```bash
vagrant@amy:~/share/Danger Zone$ uncompyle6 dangerzone.pyc
# uncompyle6 version 3.2.4
# Python bytecode 2.7 (62211)
# Decompiled from: Python 2.7.10 (default, Oct  6 2017, 22:29:07)
# [GCC 4.2.1 Compatible Apple LLVM 9.0.0 (clang-900.0.31)]
# Embedded file name: ./dangerzone.py
# Compiled at: 2018-11-22 12:44:11
import base64

def reverse(s):
    return s[::-1]


def b32decode(s):
    return base64.b32decode(s)


def reversePigLatin(s):
    return s[-1] + s[:-1]


def rot13(s):
    return s.decode('rot13')


def main():
    print 'Something Something Danger Zone'
    return '=YR2XYRGQJ6KWZENQZXGTQFGZ3XCXZUM33UOEIBJ'


if __name__ == '__main__':
    s = main()
    print s
# okay decompiling dangerzone.pyc
```

The flag can be found by calling each of these functions successively after `main`.

```python
import dangerzone as dz

s = dz.main()
s = dz.reverse(s)
s = dz.b32decode(s)
s = dz.reversePigLatin(s)
s = dz.rot13(s)

print s
```

```bash
vagrant@amy:~/share/Danger Zone$ python exploit.py
Something Something Danger Zone
TUCTF{r3d_l1n3_0v3rl04d}
```

Flag
> TUCTF{r3d_l1n3_0v3rl04d}
