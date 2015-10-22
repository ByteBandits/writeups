[](ctf=hack.lu-2015)
[](type=coding)
[](tags=random)

# GuessTheNumber (coding-150)

```
The teacher of your programming class gave you a tiny little task: just write a guess-my-number script that beats his script. He also gave you some hard facts:
he uses some LCG with standard glibc LCG parameters
the LCG is seeded with server time using number format YmdHMS (python strftime syntax)
numbers are from 0 up to (including) 99
numbers should be sent as ascii string
You can find the service on school.fluxfingers.net:1523
```

```bash
$ nc school.fluxfingers.net 1523
Welcome to the awesome guess-my-number game!
It's 22.10.2015 today and we have 13:01:49 on the server right now. Today's goal is easy: 
just guess my 100 numbers on the first try within at least 30 seconds from now on.
Ain't difficult, right?
Now, try the first one:
99
Wrong! You lost the game. The right answer would have been '61'. Quitting.
```
So here we have a random number generator and we have to guess 100 numbers on the server.
Searching about LCG we land on [this](http://rosettacode.org/wiki/Linear_congruential_generator#C) page.
The seed is given by the server in the message.It is the standard rand_r function in glibc with same parameters. Also all numbers are less than 100 so we need a mod 100 for each number.

```c
int main(int argc, char **argv)
{
	rseed = atoi(argv[1]);
	int i;
	for (i = 0; i <100; i++)
		printf("%d ", rand()%100);
 
	return 0;
}
```
By a little hit and trial we find that the server generates 100 numbers using the above algorithm and checks in reverse order.
So [here](guess.py) is a quick dirty client to handle the same.

```python
from pwn import *
import subprocess
s=remote('school.fluxfingers.net',1523)
a=s.recv(1000,timeout=1)
print a
all=re.search('have .* on',a).group()[5:13].split(':')
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
```

Flag

>flag{don't_use_LCGs_for_any_guessing_competition}
