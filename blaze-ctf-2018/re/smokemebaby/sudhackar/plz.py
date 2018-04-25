import gdb

gdb.execute('file ../96667aaad70646abc06a8b44b1016e94e3897dd5a95dff21b6e7a9628a823d06')
gdb.execute("set verbose off")
gdb.execute("run < input > output")
gdb.execute("set confirm off")
exit = int(gdb.parse_and_eval("$_exitcode").cast(gdb.lookup_type('uint32_t')))
print(":::::%d:::::" % exit)
gdb.execute('quit')
