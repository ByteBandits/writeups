[](ctf=csaw-quals-2023)
[](type=rev)
[](tags=)
[](tools=)

This is the source for rox that I rewrote. [`food.py`](./food.py)

If one can invert the logic in test such that test returns 74 - that would be the solution to it.

I did try a sidechannel but was not able to get the flag fully

The flag looks something like `aN0ther_HeRRing_or_.....`
```sh
osboxes@osboxes:~ $ python3 /tmp/else.py
aN0ther_HeRRing_or_i (20, 'i')
aN0ther_HeRRing_or_ir (21, 'r')
aN0ther_HeRRing_or_irh (22, 'h')
aN0ther_HeRRing_or_irht (23, 't')
aN0ther_HeRRing_or_irhtH (24, 'H')
aN0ther_HeRRing_or_irhtH3 (25, '3')
aN0ther_HeRRing_or_irhtH3e (26, 'e')
aN0ther_HeRRing_or_irhtH3ew (27, 'w')
aN0ther_HeRRing_or_irhtH3ewi (28, 'i')
aN0ther_HeRRing_or_irhtH3ewiT (49, 'T')
aN0ther_HeRRing_or_irhtH3ewiTn (30, 'n')
aN0ther_HeRRing_or_irhtH3ewiTn0 (30, '0')
aN0ther_HeRRing_or_irhtH3ewiTn00 (30, '0')
```

I wasted doing a sidechannel on the binary without any promising results

These are the sidechannel I tried with gdb but without any luck.\
[`some.py`](./some.py) [`else.py`](./else.py)