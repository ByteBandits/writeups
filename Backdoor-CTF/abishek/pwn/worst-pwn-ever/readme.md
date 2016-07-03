## Worst Pwn Ever (Pwn)

We get netcat connection parameters to work with.
After connecting to the server we get a custom command-line prompt, but typing some random things cause the connection to close.
Some fuzzing lead us to typing `1+()` which crashes with a nice python exception that we can't add int to a tuple.
This means that our input has to be evaluated by python interpreter.
We use this to run:

```python
__import__("pty").spawn("/bin/sh")
```

To get a real shell on the target machine.
After that we tried the standard aproach with `find flag` but it gave us nothing.
Fortunately we came back to task description which stated that the admin is `environmentalist` and so we typed `set` to see evn variables and there was a variable named `_F_L_AG` containing the flag itself.

