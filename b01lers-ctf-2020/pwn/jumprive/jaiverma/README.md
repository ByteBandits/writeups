[](ctf=b01lers-ctf-2020)
[](type=pwn)
[](tags=format-string)
[](tools=python)

# jumpdrive

The given [binary](../jumpdrive) has a format string vulnerability. The flag is
stored on the stack. Using the format string vulnerability, we can leak the
stack and get the flag.

Solver script is [here](./solve.py).

```sh
python solve.py
[+] Opening connection to pwn.ctf.b01lers.com on port 1002: Done
[+] Opening connection to pwn.ctf.b01lers.com on port 1002: Done
[+] Opening connection to pwn.ctf.b01lers.com on port 1002: Done
[+] Opening connection to pwn.ctf.b01lers.com on port 1002: Done
b'pctf{pr1nTf_1z_4_St4R_m4p}\n\x00?\x7f\x00'
```
