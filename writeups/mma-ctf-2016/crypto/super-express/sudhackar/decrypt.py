m="805eed80cbbccb94c36413275780ec94a857dfec8da8ca94a8c313a8ccf9"
def process(a,b,m):
	return "".join(map(chr,map(lambda x: (x*a+b)%251,map(ord,m.decode('hex')))))
for i in xrange(255):
	for j in xrange(255):
		if "TWCTF" in process(i,j,m):
			print process(i,j,m)

