data = []

with open('usbcap.txt') as f:
    data = f.readlines()

data = [bytearray.fromhex(''.join(i.strip().split(':'))) for i in data]

def map_key(data):
    '''
    https://patchwork.kernel.org/patch/10761581/
    reset (X)    : data[3] & 0x2
    select (A)   : data[3] & 0x8
    down         : data[5] & 0x1
    up           : data[5] & 0x2
    right        : data[5] & 0x4
    left         : data[5] & 0x8
    '''
    if data[3] & 0x2:
        return 'reset'
    elif data[3] & 0x8:
        return 'select'
    elif data[5] & 0x1:
        return 'down'
    elif data[5] & 0x2:
        return 'up'
    elif data[5] & 0x4:
        return 'right'
    elif data[5] & 0x8:
        return 'left'
    else:
        return None

actions = []
last_action = None
for d in data:
    action = map_key(d)
    if action != last_action:
        last_action = action
        if action is not None:
            actions.append(action)

for action in actions:
    print(f'handleButtons("{action}", true)')
