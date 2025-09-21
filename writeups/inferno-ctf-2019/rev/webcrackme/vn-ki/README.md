# Web Crackme

#### Category: rev
#### Pts: 399

http://104.197.168.32:17030/#challenge

Looking at sources, we see some code is constructed and evaled and there are 2 wasm functions.

```js
   async execute() {

			var key = document.getElementById('key').value;
			var stringFromKey = "";
			for (var i = 0; i < key.length; i++) {
  				stringFromKey+=key.charCodeAt(i).toString(16);
			}
            const parsedWat = wabtCompiler.parseWat("", this.wat);
            const buffer = parsedWat.toBinary({}).buffer;
            const wasmModule = await WebAssembly.compile(buffer);

            eval(this.js);

            return 0;
        }
```

Put a breakpoint in one of the function and enter some input.

Go up the call stack.

We will see the generated evaled script.

```js
const wasmInstance = new WebAssembly.Instance(wasmModule, {});
const { myFunction1,myFunction2 } = wasmInstance.exports;

let res1 = myFunction1().toString(16);
let res2 = myFunction2().toString(16);

let finalres = res1 + res2;

if (finalres ==  stringFromKey){
	alert("Here you go infernoCTF{"+key+"}");
}
else{
	
	alert("Naah, Remember I'm the future!!");
	
}
```

In the console, check the variable `finalres`


```
>finalres
"665579592d4d6539"
```

Converting to ascii, we get the flag.
