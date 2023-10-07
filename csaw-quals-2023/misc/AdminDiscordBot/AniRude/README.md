[](ctf=csaw-quals-2023)
[](type=misc)
[](tags=pyjail)
[](tools=)

# [Admin Discord Bot](https://github.com/osirislab/CSAW-CTF-2023-Quals/tree/main/misc/AdminDiscordBot)

1. To get flag we need have to `admin` role, so make your own server where you have that role and invite the bot.
2. Second part is a pyjail. We did it with following payload

    ```
    !add list(open(\"flag.txt\"))
    ```
    ```
    Dentaku BOT:
    ['csawctf{Y0u_4r3_th3_fl4g_t0_my_pyj4il_ch4ll3ng3}\n']
    ```