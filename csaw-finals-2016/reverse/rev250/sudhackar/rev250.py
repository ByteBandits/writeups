from z3 import *

for i in xrange(6):
	globals()['a%i' % i]=BitVec('a%i' %i,32)

for i in xrange(16):
	globals()['xor_%i' % i]=BitVec('xor_%i' %i,32)

solver=Solver()

cons=[a2+a4 == 0xE1D4E090,a5+a4 == 0x94E860D0,a1+a4 == 0xCDD6D8C1,a0+a3 == 0x93E1A69F,a1+a2 == 0xCD929799,a3+a4 == 0x9FA6CFD3,a2+a3 == 0xA490E3A5,a0+a5 == 1440507088,a5+a3 == 1382146771,a1+a3 == 0xCDD8A69F,a0+a5 == 1419240896,a0+a2 == 0x939B9799,a4+a0 == 0xA1DCD2C0,a1+a5 == 0x8FD364D0,a1+a0 == 0x92C8DEC3,a2+a5 == 0x80A79399]
xor_a=[0xB93E4867,0xB9F7A2FF,0x7E3C14CD,0x21DDC691,0x65AAFD58,0x372F660E,0xCBFF9345,0x453057E3,0xE8D28FD7,0xCE71DD4A,0xC30B088B,0xB2C58526,0xA47E904C,0x4D663570,0x5F3CEEE9,0xBD87BD77]

for i in xrange(16):
	globals()['xor_%i' % i]=xor_a[i]

xor_w=BitVecVal(0x35E4EEBF,32)

temp=BitVec('temp',32)

for i in xrange(16):
	temp=xor_w^globals()['xor_%i' % i]
	xor_w=If((cons[i]),temp,xor_w)

solver.add(xor_w == 0xDEADBEA7)

print solver.check()

modl=solver.model()

res=""
for i in xrange(6):
    obj=globals()['a%i' % i]
    c=modl[obj].as_long()
    res += hex(c)[2:].decode('hex')[::-1]

print("Result: flag{%s}"%res)
