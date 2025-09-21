[](ctf=csaw-quals-2023)
[](type=pwn)
[](tags=heap)
[](tools=pwntools)

# [Super Secure Heap](https://github.com/osirislab/CSAW-CTF-2023-Quals/tree/main/pwn/super_secure_heap)
It crashes on last stage on remote for some reason

Debugged it in docker. Looks like a stack alignment issue.

```sh
$ cat flag.txt
[DEBUG] Sent 0xd bytes:
    b'cat flag.txt\n'
[DEBUG] Received 0x2d bytes:
    b'csawctf{_d0es_Borat_aPpr0ve_oF_tH3_n3w_SsH?}\n'
csawctf{_d0es_Borat_aPpr0ve_oF_tH3_n3w_SsH?}
```

Actually solved this chall without a debugger 🙂

## Script
[`solve.py`](./solve.py)