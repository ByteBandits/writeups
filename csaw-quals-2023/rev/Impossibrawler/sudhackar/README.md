[](ctf=csaw-quals-2023)
[](type=pwn,rev)
[](tags=buffer-overflow,canary)
[](tools=pwntools,ida)

# [Impossibrawler](https://github.com/osirislab/CSAW-CTF-2023-Quals/tree/main/rev/Impossibrawler!)

decompilation for `impossibrawler`
```js
extends Node2D

var totalenemies = 0
var rng = RandomNumberGenerator.new()
var enemies_left = 0


func _process(delta):
    var mousepos = get_global_mouse_position()
    get_node("Crosshair").position = mousepos

    if enemies_left == 0:
        rng.seed = int(Vals.sd)
        var fbytes = rng.randf()
        Vals.sd = fbytes
        fbytes = str(fbytes)
        var flg = fbytes.to_ascii().hex_encode()
        $CanvasLayer / Label.set_text("csawctf{" + flg + "}")

func _on_Enemy_killed():
    enemies_left -= 1

func _on_Enemy_alive():
    totalenemies += 1
    enemies_left += 1

func _ready():

    Input.set_mouse_mode(Input.MOUSE_MODE_HIDDEN)
```

It is static analysis only.

Tried this
```js
extends Node2D


var totalenemies = 0
var rng = RandomNumberGenerator.new()
var enemies_left = 0


func _process(delta):
    var mousepos = get_global_mouse_position()
    get_node("Crosshair").position = mousepos

    if enemies_left == 0:
        rng.seed = Vals.hits ^ enemies_left ^ Vals.playerdmg
        var fbytes = rng.randf()
        Vals.sd = fbytes
        get_tree().change_scene("res://Scenes/Level_2.tscn")

func _on_Enemy_killed():
    enemies_left -= 1

func _on_Enemy_alive():
    totalenemies += 1
    enemies_left += 1

func _ready():

    Input.set_mouse_mode(Input.MOUSE_MODE_HIDDEN)
```

But then this finally worked!
```js
extends Node

var rng = RandomNumberGenerator.new()

func _ready():
    rng.seed = 0
    var fbytes1 = str(rng.randf())
    var flg = fbytes1.to_ascii().hex_encode()
    print("csawctf{" + flg + "}")
    pass
```

flag was `csawctf{302e323032323732}`
