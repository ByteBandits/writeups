// gcc -zexecstack -Os shellcodeme.c -o shellcodeme
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>

#define BUF_SIZE (0x4096 & ~(getpagesize()-1))

int main() {
    setbuf(stdout, NULL);
    unsigned char seen[257], *p, *buf;
    void (*f)(void);
    memset(seen, 0, sizeof seen);
    buf = mmap(0, BUF_SIZE, PROT_READ | PROT_WRITE | PROT_EXEC, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    puts("Shellcode?");
    fgets(buf, BUF_SIZE, stdin);
    fflush(stdin);
    for(p=buf; *p != '\n'; p++) {
        seen[256] += !seen[*p];
        seen[*p] |= 1;
    }
    if(seen[256] > 7) {
        puts("Shellcode too diverse.");
        _exit(1);
    } else {
        *(void**)(&f) = (void*)buf;
        f();
        _exit(0);
    }
}
