using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.Resources;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;

public class Test
{
	public static void Main()
	{
		Console.Out.WriteLine(Test.Encrypt("zV5/UFU8PUD3N2T49IBuCwvGzCLYz39tkMZts7rfBU4=","__ERROR_HANDLER"));
	}

    public static string Encrypt(string input, string pass)
        {
            string base64String;
            byte[] input1=Convert.FromBase64String(input);
            RijndaelManaged rijndaelManaged = new RijndaelManaged();
            MD5CryptoServiceProvider mD5CryptoServiceProvider = new MD5CryptoServiceProvider();
            try
            {
                byte[] numArray = new byte[32];
                byte[] numArray1 = mD5CryptoServiceProvider.ComputeHash(Encoding.ASCII.GetBytes(pass));
                Array.Copy(numArray1, 0, numArray, 0, 16);
                Array.Copy(numArray1, 0, numArray, 15, 16);
                rijndaelManaged.Key = numArray;
                rijndaelManaged.Mode = CipherMode.ECB;
                ICryptoTransform cryptoTransform = rijndaelManaged.CreateDecryptor();
                byte[] bytes =(input1);
                base64String = Convert.ToBase64String(cryptoTransform.TransformFinalBlock(bytes, 0, 32));
            }
            catch (Exception exception)
            {
                base64String = "";
            }
            return base64String;
        }
}