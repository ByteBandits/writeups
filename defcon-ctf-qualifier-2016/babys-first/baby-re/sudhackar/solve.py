import angr

proj = angr.Project('./baby-re', load_options={"auto_load_libs": False})
initial_state = proj.factory.entry_state()
path_group = proj.factory.path_group(initial_state)
path_group.explore(find=0x4025cc)

found = path_group.found[0]
print found.state.se.any_str(found.state.memory.load(found.state.regs.rbp, 200))