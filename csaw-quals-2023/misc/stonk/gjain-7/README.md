[](ctf=csaw-quals-2023)
[](type=misc)
[](tags=python,implementation-gap)
[](tools=)

# [Stonks](https://github.com/osirislab/CSAW-CTF-2023-Quals/tree/main/misc/TradingGame)
Given an implementation of a trading platform, one has 2000 balance and needs 9000 to buy the flag.

One can do following operations:
- buy a stock 
- sell a stock
- trade a stock, with any lower valued stock.

### Finding gap

```py
def threadTransact():
    global QUEUE
    global TRADEPOST
    bkup = dict()
    while True:
        if QUEUE:
            key, action, s1, s2 = QUEUE.popleft()
            p = DB.getInstance().getUser(key)
            #process trading by posting trade request
            #onto the classified
            if action == 3:
                if(postTrade(key, s1)):
                    TRADEPOST.append((key, s1, s2))
            #money related actions is very costly to the server,
            #throttle if the user has more than 1 requests per second
            #over 10 second survey period
            if p.requests > 10:
                #Throttling, ignore request and attempts to restore
                if key in bkup:
                    p = DB.getInstance().getUser(key)
                    p.balance = bkup[key].balance
                    p.requests = bkup[key].requests
                    p.portfolio = bkup[key].portfolio
                continue
            bkup[key] = Portfolio.bkup(key, p.portfolio, p.balance, p.requests)
            if action == 1:
                buyDB(key, s1)
            elif action == 2:
                sellDB(key, s1)
```

If we pay attention to the `threadTransact` method, we can notice that 
- first the `s1` gets deducted from our portfolio
- then the trade pushed onto the `TRADING_POST`, which will add `s2` into the portfolio. 
- However if the number requests exceed a certain rate, portfolio is backed up (so we are at the previous state), but the `TRADING_POST` is not cleared, which is the gap.
- Now when the `TRADING_POST` gets processed, extra stocks get added into the portfolio.


We exploit this by creating two threads:
1. One will just buy and sell the same stock, to throttled the requests. 
2. Another one will be to trade between two securties, this is where we get extra stocks from.


## Script
[sol.py](./sol.py)

PS: Initially I ran the script locally and I got the stocks but was not able to sell them, for some reason my portfolio was getting resetted to the same state. However then I ran it on colab and it worked like a charm.

flag: `csawctf{R_Yu0_7h3_w0lf_0f_w4ll_57r337}`