from pwn import *
import subprocess
#flag{don't_use_LCGs_for_any_guessing_competition}
s=remote('school.fluxfingers.net',1523)
a=s.recv(1000,timeout=1)
print a
all=re.search('have .* on',a).group()[5:13].split(':')
#s.send('78\n')
seed=20151021000000
seed+=int(all[0])*10000
seed+=int(all[1])*100
seed+=int(all[2])
res=subprocess.check_output(["./lol", str(seed)]).split()[::-1]
print res,"len",len(res)
for i in res:
	print i,
	s.send(str(i))
	a=s.recv(100)	
	print a