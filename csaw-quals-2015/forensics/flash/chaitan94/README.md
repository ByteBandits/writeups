[](ctf=csaw-quals-2015)
[](type=forensics)
[](tags=)

# Flash (forensics-100)

This was surprisingly very easy problem. After downloading the given [.img file](https://drive.google.com/file/d/0B_zt1fDAjfM_ZHJkSjdTYThPdmc/view), just running _strings_ on it gives away the flag:

```bash
$ strings flash_c8429a430278283c0e571baebca3d139.img | grep flag{
```

Aaand there's our flag:
> flag{b3l0w_th3_r4dar}
