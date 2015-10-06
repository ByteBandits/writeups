[](ctf=trend-micro-ctf-2015)
[](type=prog)
[](tags=)
[](tools=PIL)
[](techniques=)

# Click on the different color (prog-100)

Problem statement is straightforward. We are given a square grid:

![Squares](../squares.png)

We have to click on the tile which has the odd color. After each such click, the grid gets larger and larger. Obviously, we need to automate this, so wrote down a [quick script](bot.py), and let it play for a few minutes. After our bot plays for about 80 levels, we get the flag:

> TMCTF{U must have R0807 3Y3s!}
