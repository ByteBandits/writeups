package com.tm.ctf.trendgacha;

public class GachaAPI
{
    static
    {
        System.loadLibrary("native-lib");
    }

    public static native int[] getGacha(int paramInt);
}
