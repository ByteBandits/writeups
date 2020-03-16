[](ctf=b01lers-ctf-2020)
[](type=pwn)
[](tags=misc)
[](tools=)

# X-Wing Part 1

This was more of a misc challenge than a pwn.
We are given a link to a YouTube video. The video contains a link to a URL
which has the actual challenge. You can see the link here:

- [https://youtu.be/bYAoGTywR5c?t=3](https://youtu.be/bYAoGTywR5c?t=3)
- [http://xwing.pwn.ctf.b01lers.com/](http://xwing.pwn.ctf.b01lers.com/)

Viewing the source of this page, there is a `Dockerfile`.

```Dockerfile
FROM archlinux:20200106

# Change example to the name of your challenge.
ENV USER xwing

WORKDIR /home/$USER

RUN useradd -ms /bin/bash $USER
RUN pacman -Sy gcc make xinetd --noconfirm

COPY $USER.xinetd /etc/rc.d/$USER
COPY $USER.c /home/$USER/
COPY memdump.c /home/$USER/
COPY memdump.h /home/$USER/
COPY $USER.Makefile /home/$USER/Makefile
COPY $USER.sh /home/$USER/$USER.sh
COPY flag1.txt /home/$USER/flag1.txt
COPY flag2.txt /home/$USER/flag2.txt
COPY flag3.txt /home/$USER/flag3.txt
COPY flag4.txt /home/$USER/flag4.txt

RUN make -C /home/$USER/

RUN chown -R root:$USER /home/$USER
RUN chmod -R 550 /home/$USER
RUN chmod -x /home/$USER/flag1.txt
RUN chmod -x /home/$USER/flag2.txt
RUN chmod -x /home/$USER/flag3.txt
RUN chmod -x /home/$USER/flag4.txt
RUN touch /var/log/xinetdlog

# TODO: Change 1337 to your challenge port
EXPOSE 1337

CMD xinetd -f /etc/rc.d/$USER && sleep 2 && tail -f /var/log/xinetdlog
```

Connecting to the server on port `1337`, we are asked for a password.

The password can be viewed in the hex-dump shown in the YouTube video:

- [https://youtu.be/bYAoGTywR5c?t=21](https://youtu.be/bYAoGTywR5c?t=21)
- `LeiaIsCute`

Entering the password on the server prints the flag.

```sh
X-Wing Control Panel
User:                    Luke Skywalker
Droid:                   R2-D2
Callsign:                Red 5
Ship Status:             Critical
Destination:             Death Star
Distance Remaining:      9999960
Speed:                   10
Hyperdrive:              Off

Fly to the Death Star. pctf{Im_afraid_the_battl3stati0n_iz_Fully_Operational...}


> 
```
```
