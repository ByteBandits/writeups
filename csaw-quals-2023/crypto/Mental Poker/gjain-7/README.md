[](ctf=csaw-quals-2023)
[](type=crypto)
[](tags=bruteforce,rsa,PRNG)
[](tools=pwntools)

# [Mental Poker](https://github.com/osirislab/CSAW-CTF-2023-Quals/tree/main/crypto/mental-poker)

Given a `server.py` which is simulating a poker game.
In order to win the flag one needs to continously win with a streak of 10.

We have the control to shuffle the cards(encrypted) and player keys (`player_e` and `player_d`).

The latter do not matter if we simply set them to `1`.

Moving on, If we notice the `PRNG` implementation, in the state generation, only last 10 bits of `state.seed` are being used.

```py
class PRNG:
	def __init__(self, seed = int(os.urandom(8).hex(),16)):
		self.seed = seed
		self.state = [self.seed]
		self.index = 64
		for i in range(63):
			self.state.append((3 * (self.state[i] ^ (self.state[i-1] >> 4)) + i+1)%64)
```

We can then bruteforce the seed and find out the correct seed. 

To check the if a seed correct we decrpyt the cards using the private key derived from the seeds and check if the card name is sensible.

Once we find the `computer_e`, we arrange the cards in the winning order and send the encrypted versions back.


## Script
[`sol.py`](./sol.py)

flag: `csawctf{m3n74l_p0k3r_15_4n_1n73r3571n6_pr0bl3m.5h0u70u7_70_numb3rph1l3}`

