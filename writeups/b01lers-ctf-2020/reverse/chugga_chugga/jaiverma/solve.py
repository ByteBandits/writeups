from z3 import *

s = Solver()

v = [BitVec(f'{i}', 32) for i in range(23)]
for i in v:
    s.add(i >= 21)
    s.add(i <= 127)
    s.add(i != 0x20)

s.add(v[0] == ord('p'))
s.add(v[2] == ord('t'))
s.add(v[9] == ord('c'))
s.add(v[16] == ord('n'))
s.add(v[21] == ord('z'))
s.add(v[22] == ord('}'))

s.add(v[5] == ord('s'))
s.add(v[3] == ord('f'))
s.add(v[1] == ord('c'))
s.add(v[7] == ord('d'))
s.add(v[12] == v[13])
s.add(v[19] == ord('z'))
s.add((v[14] + v[6]) == ord('h'))
s.add(v[4] == ord('{'))
s.add(v[15] == ord('_'))
s.add(v[8] == ord('_'))

s.add(v[11] == (ord('}') - v[17] + 0x28))
s.add(v[18] == (v[11] - 0x73 - v[18] + (2 * v[17])))
s.add(v[0] == ((v[6] - v[17]) >> 1) * (v[18] - v[17]) + ord('n'))
s.add(v[13] + 1 == v[10])
s.add(((v[6] - v[17]) * 3 + ord('\\')) == v[10])
s.add((v[20] - 99) == ((v[18] - v[17]) * 2))
s.add((v[6] - v[17]) == ((v[18] - v[17]) * 4))
s.add(v[6] == v[14])

print(s.check())
m = s.model()
ans = bytearray()
for i in v:
    ans.append(m[i].as_long())

ans = bytes(ans)
print(ans)
with open('i', 'wb') as f:
    f.write(ans)
