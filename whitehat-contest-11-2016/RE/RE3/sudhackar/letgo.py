import os

def gothrough():
    key = 1
    roomtogo = [r for r in os.listdir(os.curdir)if os.path.isdir(r)]
    for room in roomtogo:
        key *= int(room)
        os.system("start cmd /k echo Room number " + room + ": get key part")
    if (key == 1000012277050240711531267079):
        os.system("start cmd /k echo Congrats! Where did you get these key parts?")
    else:
        os.system("start cmd /k echo Nothing here! wrong key parts")

gothrough()

