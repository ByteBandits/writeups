[](ctf=ekoparty-2015)
[](type=reverse)
[](tags=)
[](tools=retdec)
[](techniques=decompilation)

So we have [zip](../reversing25.zip)
On extracting it we get a single file.
```sh
$ file GIFT.exe 
GIFT.exe: PE32 executable (console) Intel 80386 (stripped to external PDB), for MS Windows
```
PE32! we give it to [retdec](https://retdec.com/decompilation/) for decompilation.
And we get [GIFT.c](../GIFT.c).

Going through the code we see something.
```c
            if (*v3 == 69) {
                // 0x401c2d
                if (*(char *)(g6 + 1) == 75) {
                    // 0x401c33
                    if (*(char *)(g6 + 2) == 79) {
                        // 0x401c39
                        if (*(char *)(g6 + 3) == 123) {
                            // 0x401c3f
                            if (*(char *)(g6 + 4) == 116) {
                                // 0x401c45
                                if (*(char *)(g6 + 5) == 104) {
                                    // 0x401c4b
                                    if (*(char *)(g6 + 6) == 105) {
                                        // 0x401c51
                                        if (*(char *)(g6 + 7) == 115) {
                                            // 0x401c57
                                            if (*(char *)(g6 + 8) == 95) {
                                                // 0x401c5d
                                                if (*(char *)(g6 + 9) == 105) {
                                                    // 0x401c63
                                                    if (*(char *)(g6 + 10) == 115) {
                                                        // 0x401c69
                                                        if (*(char *)(g6 + 11) == 95) {
                                                            // 0x401c6f
                                                            if (*(char *)(g6 + 12) == 97) {
                                                                // 0x401c75
                                                                if (*(char *)(g6 + 13) == 95) {
                                                                    // 0x401c7b
                                                                    if (*(char *)(g6 + 14) == 103) {
                                                                        // 0x401c81
                                                                        if (*(char *)(g6 + 15) == 105) {
                                                                            // 0x401c87
                                                                            if (*(char *)(g6 + 16) == 102) {
                                                                                // 0x401c8d
                                                                                if (*(char *)(g6 + 17) == 116) {
                                                                                    // 0x401c97
                                                                                    if (*(char *)(g6 + 18) == 125) {
                                                                                        // 0x401ca1
                                                                                        printf("Great! your flag is %s\n", v3);
                                                                                    }
```
Looks like ascii values are hardcoded.
```python
flag=[69,75,79,1123,116,104,105,115,95,105,115,95,97,95,103,105,102,116,125]
print ''.join(chr(i) for i in flag)
```

gives us FLAG

> EKO{this_is_a_gift}