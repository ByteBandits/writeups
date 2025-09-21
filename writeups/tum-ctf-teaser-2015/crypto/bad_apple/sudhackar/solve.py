import hashpumpy
original='hello pls'
add='flag pls'
hash_old='2628455f6617ecea024895a48578ebce00fa9204983d09b6d1757d05dc430567'
limit=100
for i in xrange(limit):
	f=open('lol/'+str(i),'w')
	l=hashpumpy.hashpump(hash_old,original,add,i)
	f.write(l[0].decode('hex')+l[1])
	f.close()
