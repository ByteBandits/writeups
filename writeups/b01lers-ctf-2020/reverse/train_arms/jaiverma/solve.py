import codecs

r0 = codecs.decode(b'7049744c7b5e721e31447375641a6e5e5f42345c337561586d597d',
        'hex') + b'\x00'
r0 = bytearray(r0)

r1 = 0
r2 = 0

while True:
    r2 = r0[r1]
    if r0[r1] == 0x0:
        break
    r3 = r1 << 0
    r3 = r3 & 1
    if r3 == 0x0: # even
        pass
    else: # odd
        r0[r1] ^= 42
        r2 = r0[r1]
    r1 += 1

print(bytes(r0))
