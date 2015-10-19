[](ctf=hackover-2015)
[](type=web)
[](tags=headers)
[](tools=burp-proxy)

# hack-the-planet (web-50)

```
Hacking a site is basic task for any skilled hacker.
Methods range from brute force to talking to people.
No matter which method you choose, don't forget to use head.

HINT: His question is the answer 
http://hack-the-planet.hackover.h4q.it
```
Partial code from [source](../hack-the-planet-275983b5101b4c089443f0486c6bfb03.go).

```go
package main

const (
	flagPW = "XXX"
	flag   = "hackover15{XXX}"
)


func login(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "HEAD":
		hint(w, r)
	case "POST":
		check(w, r)
	default:
		gotoFail(w, r, "/fail.jpg", http.StatusMethodNotAllowed)
	}
}

func hint(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("X-XXX") == "XXX" {
		w.Header().Set("X-XXX", flagPW)
		w.WriteHeader(http.StatusAccepted)
		return
	}
	w.Header().Set("X-XXX", "XXX")
	w.WriteHeader(http.StatusPartialContent)
}

func check(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		gotoFail(w, r, "fail.jpg", 401)
	}
	if r.PostForm.Get("pw") != flagPW {
		gotoFail(w, r, "fail.jpg", 401)
	}

	w.WriteHeader(http.StatusAccepted)
	if _, err := w.Write([]byte(flag)); err != nil {
	}
}
```

The hint is pretty obvious and the code block too.
We use burp pxoxy to change the verb to HEAD.
In the response we get "X-Hackers-Kate-Libby": "make it my first-born!"
Searching for this we find Its a dialogue from "Hackers" movie.

```
Kate Libby: You wish! You'll do shitwork, scan, crack copyrights...
Dade Murphy: And if I win?
Kate Libby: Make it my first-born!
Dade Murphy: Make it our first-date!
Kate Libby: I don't DO dates. But I don't lose either, so you're on!
```
And the hint: 

HINT: His question is the answer 

So we send a header:
```
"X-Hackers-Dade-Murphy": "And if I win?"
```
We get 
```
"X-Hackers-The-Five-Most-Used-Passwords-Are": "password,secret,love,god,sex"
```
in the response.
Use password,secret,love,god,sex as password to login. We get the flag.

> hackover15{Thepoolontheroofnusthavealeak}