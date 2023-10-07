[](ctf=csaw-quals-2023)
[](type=misc)
[](tags=android,java)
[](tools=)


```java
/* package whatever; // don't place package name! */

import java.util.*;
import java.lang.*;
import java.io.*;

/* Name of the class has to be "Main" only if the class is public. */
class Ideone
{
	static byte[] notTheFlag;
	public static void main (String[] args) throws java.lang.Exception
	{
		String str = "bEVYCkNEWV5LRElPBgpFRApeQk8KWkZLRE9eCm9LWF5CBgpHS0QKQktOCktGXUtTWQpLWVlfR09OCl5CS14KQk8KXUtZCkdFWE8KQ0ReT0ZGQ01PRF4KXkJLRApORUZaQkNEWQpIT0lLX1lPCkJPCkJLTgpLSUJDT1xPTgpZRQpHX0lCCgcKXkJPCl1CT09GBgpkT10Kc0VYQQYKXUtYWQpLRE4KWUUKRUQKBwpdQkNGWV4KS0ZGCl5CTwpORUZaQkNEWQpCS04KT1xPWApORURPCl1LWQpHX0lBCktIRV9eCkNECl5CTwpdS15PWApCS1xDRE0KSwpNRUVOCl5DR08ECmhfXgpJRURcT1hZT0ZTBgpJWUtdSV5MUU5TRB5HG0l1RkUeTk94WXVYdUxfZAtXIF5CTwpORUZaQkNEWQpCS04KS0ZdS1NZCkhPRkNPXE9OCl5CS14KXkJPUwpdT1hPCkxLWApHRVhPCkNEXk9GRkNNT0ReCl5CS0QKR0tECgcKTEVYClpYT0lDWU9GUwpeQk8KWUtHTwpYT0tZRURZBA==";
		notTheFlag = Base64.getDecoder().decode(str);
		System.out.println(obf(275, 306, 42));
		// your code goes here
	}
	
	public static String obf(int i, int i2, int i3) {
        int i4 = i2 - i;
        char[] cArr = new char[i4];
        for (int i5 = 0; i5 < i4; i5++) {
            cArr[i5] = (char) (notTheFlag[i + i5] ^ i3);
        }
        return new String(cArr);
    }
}
```


`some.dex` is `dropped.dex` from here
```java
public class MainActivity extends C0342l {
    public final void onCreate(Bundle bundle) {
        Class<?> cls;
        Object obj;
        super.onCreate(bundle);
        setContentView(2131427356);
        try {
            byte[] decode = Base64.decode("ZGV4CjAzNQAWORryq3+hLJ+yXt9y3......", 0);
            FileOutputStream openFileOutput = openFileOutput("dropped.dex", 0);
            openFileOutput.write(decode);
            openFileOutput.flush();
            openFileOutput.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        StrictMode.setThreadPolicy(new StrictMode.ThreadPolicy.Builder().permitAll().build());
        File file = new File(getFilesDir(), "dropped.dex");
        Method method = null;
    }
}
```

`sources/com/example/dropper/MainActivity.java` in the original apk
This drops a dex at runtime and then loads ot
