[](ctf=ekoparty-2015)
[](type=misc)
[](tags=scraping)
[](tools=)
[](techniques=)

# Get the flag (misc-50)

Problem description says:
> GET all the flags! literally.
>
> Hints: Source code anyone? GET them all

GET in capital suggests a HTTP GET request, so maybe we should download all the flags from the website?

Worth the try, so I opened up [scoreboard](https://ctf.ekoparty.org/prectf-scoreboard) and ran the following javascript in the console:

```javascript
var flags = [];
var imgs = $("table img");
for (var i=0; i<imgs.size(); ++i) {
    var url = imgs[i].src;
    var country = url.split('/')[6].split(".")[0];
    if (flags.indexOf(country) == -1)
        flags.push(country);
}
console.log(flags.join(","));
```

This gives out all the codes of countries, might not be necessarily exhaustive, but good enough data for now.

> "RUS,MNG,UKR,VNM,INT,GBR,USA,TWN,FRA,ARG,COL,ESP,HUN,EUR,BRA,NLD,DEU,URY,IDN,KOR,IND,MEX,BHR,HKG,MKD,BHS,EGY,SMR,JPN,THA,MLT,IRN,CHN,AUS,ITA,AND,CHL,TUR,UZB,ALB,MDA,CAN,BOL,PER,BGR,SVK,AFG,ECU,JOR,ISL,AGO,MAR,DZA,FIN,AZE,CZE,CRI"

Now, we can use wget and download all the flags.

```bash
$ for i in RUS MNG UKR VNM INT GBR USA TWN FRA ARG COL ESP HUN EUR BRA NLD DEU URY IDN KOR IND MEX BHR HKG MKD BHS EGY SMR JPN THA MLT IRN CHN AUS ITA AND CHL TUR UZB ALB MDA CAN BOL PER BGR SVK AFG ECU JOR ISL AGO MAR DZA FIN AZE CZE CRI ; do wget https://ctf.ekoparty.org/static/img/flags/$i.png ; done
```
Now let's look for the flag
```bash
strings *.png | grep EKO
```
Aand there's the flag:
> EKO{misc_challenges_are_really_bad}
