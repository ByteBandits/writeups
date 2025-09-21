[](ctf=csaw-quals-2023)
[](type=pwn,rev)
[](tags=buffer-overflow,canary)
[](tools=pwntools,ida)

# [Unlimited Subway](https://github.com/osirislab/CSAW-CTF-2023-Quals/tree/main/pwn/unlimited_subway)

Given a binary.
```sh
csaw23/Subway » checksec --file=/usr/bin/cat          2 ↵
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```
Doing a quick checksec, notice that it has canary.

Having a look on the [decompiled binary](./dec.c)  we need to call `print_flag()`.

We have control over input buffer, so we need to overflow the frame pointer, with the `print_flag` address.

But doing so would also corrupt the canary, so first we need to leak the canary exploting ubnounded reads through `view_account`.


## Script
[`sol.py`](./sol.py)

flag: `csawctf{my_n4m3_15_079_4nd_1m_601n6_70_h0p_7h3_7urn571l3}`