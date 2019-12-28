def to_bin(param1):
    t = ['1'] * 5
    j = 3
    local1 = param1
    while local1 > 0:
        if (local1 & 1) == 0:
            t[j] = '1'
        else:
            t[j] = '0'
        j -= 1
        local1 = local1//2
    return ''.join(t)

def idx_in_1(p1: str, p2: str) -> int:
    idx = p1.find(p2)
    return idx

def rev_bs(s) -> int:
    return ~int(s, 2) & 0xf

# for i in range(15):
#     print(i, to_bin(i), f'{i:04b}' + '1', rev_bs(to_bin(i)))

stri = "1_4m_th3_wh1t3r0s3"

flag = ['*']* 0x24
s1 = "ADGJLQETUOZCBM10"
s2 = "sfhkwryipxvn5238"

i = 0
while i < len(stri):
    print(i)
    b = ord(stri[i])
    # b = bin(ord(b))[2:]
    b = f'{b:08b}'
    print(b)

    t1 = ''
    t2 = ''

    for idx in range(len(b)):
        if idx %2:
            t2 += b[idx]
        else:
            t1 += b[idx]

    print(t1, t2)

    flag[i*2] = s1[rev_bs(t1)]
    flag[i*2+1] = s2[rev_bs(t2)]
    i+=1

print(''.join(flag))
flag = ''.join(flag)

from pwn import *
# p = gdb.debug('./darkcrackme', 'b *0x004013cd')
p = process('./darkcrackme')
p.sendline(stri.encode())
p.sendline(flag.encode())
p.interactive()
