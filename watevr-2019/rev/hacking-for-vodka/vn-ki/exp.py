import r2pipe

p = r2pipe.open('./vodka')

p.cmd('dor aslr=no,stdin="AAA"')
p.cmd('doo')
p.cmd('aa')


res = []
bps = [
    0x555555555304,
    0x555555554c03,
    0x555555554c21
]

for i in bps:
    p.cmd('db '+hex(i))

p.cmd('dbc 0x555555554c21 dr rip=0x555555554c37')

p.cmd('dc')
p.cmd('dr rip=0x555555555312')
p.cmd('dc')

while True:
    rax = p.cmdj('drj')['rax']
    if rax > 255:
        break
    res.append(rax)
    p.cmd('dc')
    p.cmd('dc')

print(res)
print(''.join(chr(i) for i in res))
