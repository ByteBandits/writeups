[](ctf=b01lers-ctf-2020)
[](type=reversing)
[](tags=z3,angr)
[](tools=z3)

# chugga chugga

We are given a [binary](../chugga) which has been written in `Go`.

The `Go` binary which consists of a set of constraints that we can reverse and
model with an SMT solver like `Z3`.

We just have to find the function where the core logic lies and not waste our
time with all the bloat that Go adds.

The `main.main` function at `0x492eb0` is responsible for checking our input.

Ghidra decompiler makes it easy for us to model the constraints:

```c
void main.main(void)

{
  undefined **ppuVar1;
  char cVar2;
  char cVar3;
  char *pcVar4;
  char *pcVar5;
  char **ppcVar6;
  char cVar7;
  byte bVar8;
  long in_FS_OFFSET;
  char **local_a0;
  undefined *local_28;
  undefined1 *local_20;
  undefined *local_18;
  char **local_10;
  
  ppcVar6 = local_a0;
  ppuVar1 = (undefined **)(*(long *)(in_FS_OFFSET + 0xfffffff8) + 0x10);
  if (&local_28 < *ppuVar1 || &local_28 == (undefined **)*ppuVar1) {
    runtime.morestack_noctxt();
    main.main();
    return;
  }
  runtime.newobject();
  while( true ) {
    runtime.convT64();
    local_28 = &DAT_004a4c40;
    local_20 = main.statictmp_2;
    local_18 = &DAT_004a4480;
    local_10 = local_a0;
    fmt.Fprintln();
    fmt.Fprintln();
    local_a0 = os.Stdin;
    fmt.Fscan();
    pcVar4 = ppcVar6[1];
    pcVar5 = *ppcVar6;
    if (pcVar4 < (char *)0x3) break;
    if (pcVar5[2] == 't') {
      if (pcVar4 < &DAT_0000000a) break;
      if (pcVar5[9] != 'c') goto code_r0x00493067;
      if (pcVar4 < &DAT_00000011) break;
      if (pcVar5[0x10] != 'n') goto code_r0x00493067;
      if (pcVar4 < &DAT_00000016) break;
      if (pcVar5[0x15] != 'z') goto code_r0x00493067;
      if (pcVar4 < &DAT_00000017) break;
      if (((((pcVar5[0x16] != '}') || (pcVar5[5] != 's')) || (pcVar5[3] != 'f')) ||
          ((pcVar5[1] != 'c' || (pcVar5[7] != 'd')))) ||
         ((pcVar5[0xc] != pcVar5[0xd] || (pcVar5[0x13] != 'z')))) goto code_r0x00493067;
      cVar2 = pcVar5[6];
      if (((((char)(cVar2 + pcVar5[0xe]) != 'h') || (pcVar5[4] != '{')) ||
          (pcVar5[0xf] != pcVar5[8])) || (pcVar5[8] != '_')) goto code_r0x00493067;
      cVar3 = pcVar5[0x11];
      if (((((char)(-0x5b - cVar3) != pcVar5[0xb]) ||
           (cVar7 = pcVar5[0x12] - cVar3,
           (char)(((pcVar5[0xb] + -0x73) - pcVar5[0x12]) + cVar3) != cVar7)) ||
          (bVar8 = cVar2 - cVar3, *pcVar5 != (byte)((bVar8 >> 1) * cVar7 + 'n'))) ||
         ((((char)(pcVar5[0xd] + '\x01') != pcVar5[10] ||
           ((byte)(bVar8 * '\x03' + '\\') != pcVar5[10])) ||
          (((char)(pcVar5[0x14] + -99) != (char)(cVar7 * '\x02') ||
           ((bVar8 != (byte)(cVar7 * '\x04') || (cVar2 != pcVar5[0xe])))))))) goto code_r0x00493067;
      main.win();
    }
    else {
code_r0x00493067:
      local_a0 = os.Stdout;
      fmt.Fprintln();
    }
  }
  runtime.panicindex();
  do {
    invalidInstructionException();
  } while( true );
}
```

The sovler script is [here](./solve.py).

```sh
$ python solve.py
sat
b'pctf{s4d_chugg4_n01zez}'
```
