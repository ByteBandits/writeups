import gdb

class MyBreakpoint(gdb.Breakpoint):
    def stop (self):
        eax = int(gdb.parse_and_eval("$eax").cast(gdb.lookup_type('uint32_t')))
        print(":::::%d:::::" % eax)
        return False

gdb.execute('file ./magic')
gdb.execute("set environment LD_PRELOAD /tmp/memcmp.so")
gdb.execute("set verbose off")
MyBreakpoint("*0x8048947")
gdb.execute("run < input > output")
gdb.execute("set confirm off")
gdb.execute('quit')
