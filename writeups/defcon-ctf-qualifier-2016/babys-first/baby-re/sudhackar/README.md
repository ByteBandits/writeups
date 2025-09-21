[](ctf=defcon-qualifier-2015)
[](type=reverse)
[](tags=equation-solver)
[](tools=angr)

# baby-re (babys-first 1)
### ~~math required~~

We are given a file

```bash
$ file baby-re
baby-re: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=5d5783d23d78bf70b80d658bccbce365f7448693, not stripped
```
Test-run

```bash
$ ./baby-re
Var[0]: 10
Var[1]: 10
Var[2]: 10
Var[3]: 101
Var[4]: 10
Var[5]: 10
Var[6]: 10
Var[7]: 10
Var[8]: 10
Var[9]: 10
Var[10]: 10
Var[11]: 10
Var[12]: 10
Wrong
```
So the problem looks simple, a simple keygen-me. Throw it to Hopper and

```c
int main() {
    var_28 = *0x28;
    printf("Var[0]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60);
    printf(0x402a14);

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x4);
    printf("Var[2]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x8);
    printf("Var[3]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0xc);
    printf("Var[4]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x10);
    printf("Var[5]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x14);
    printf("Var[6]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x18);
    printf("Var[7]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x1c);
    printf("Var[8]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x20);
    printf("Var[9]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x24);
    printf("Var[10]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x28);
    printf("Var[11]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x2c);
    printf("Var[12]: ");

    fflush(rax);
    __isoc99_scanf(0x402a11, var_60 + 0x30);
    if (CheckSolution(var_60) != 0x0) {
            printf("The flag is: %c%c%c%c%c%c%c%c%c%c%c%c%c\n", var_60, var_5C, var_58, var_54, var_50, var_4C, var_48, var_44, var_40, var_3C, var_38, var_34, var_30);
    }
    else {
            puts("Wrong");
    }
    rax = 0x0;
    rbx = var_28 ^ *0x28;
    COND = rbx == 0x0;
    if (!COND) {
            rax = __stack_chk_fail();
    }
    return rax;
}
```

So main function takes 13 variables and passes it to CheckSolution for verifying. Hopper gives a pretty ugly decompilation for CheckSolution. So without actually reversing and fishing out the constraints for the equations we turn to [angr](http://angr.io/). The solution script is pretty straight. We set our target to find as the instruction which returns a non zero value from CheckSolution.

```python
import angr

proj = angr.Project('./baby-re', load_options={"auto_load_libs": False})
initial_state = proj.factory.entry_state()
path_group = proj.factory.path_group(initial_state)
path_group.explore(find=0x4025cc)

found = path_group.found[0]
print found.state.se.any_str(found.state.memory.load(found.state.regs.rbp, 200))
```

Running this for some 3-4 minutes on my machine will give us

```bash
$ python solve.py
Couldn't import dot_parser, loading of dot files will not be possible.
��������(@Math is hard!``�@�������
```

>FLAG : Math is hard!
