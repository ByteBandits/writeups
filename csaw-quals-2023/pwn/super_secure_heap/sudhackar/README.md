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


The script ([`solve.py`](./solve.py)) is a copy of the UaF exploit from https://sudhackar.notion.site/Offsec-Writeups-e2512e8d0e0440e8b3868348e9d37a10?pvs=4

Its almost the same chall - same libc, similar vuln -use after free -> tcache poison to environ and then stack - because of full relro