# Ghost in the system

#### Category: rev
#### Points: 1500

We get a binary `ls` which does what ls does.

Open the binary in ghidra and search for `rtcp`, the flag format.

We see there's a string and it is referenced in the main function of the binary. Go to the reference and scroll a bit down and we see the following code.

```c
      if (bVar4) {
        allocator();
                    /* try { // try from 00101296 to 0010129a has its CatchHandler @ 00101fcc */
        basic_string((char *)&otxt,
                     (allocator *)

                     "s}yvzezqr_6x45jx2yp4d38qq1mvnsl0u7w32lr12gi}t3i5kw0oewkqb_vv6726}}95cmfy_jfgyx25n1e9cuyvsor_0mijcnhoa2kpvdtjd9js2kstbe5}s6zgyil6qxtr}wbol}dzmg3t02466hu1gkpm2xv8u{ryn0s11uzu_426p8k4owb21f3buof6ok{cp9s2s88k3yhzdsq1d2u7n3}9ex}9sly0p0}lp5yxdi7m37_p82o54im1z7bw5u2tu9n2loybmr51jih8lxf7z6n62goh3_63cnnbfczhmsy4pe}ijluq9xbkk4d{c13s5hjkjldeww9z}78oyt1pog5qudz{6fkw_wgon99yc{7v4sakj6pddk5i1c_1g74e_xwivk7mmbm16it6zxfc1y6sdz{0zrmuvysbl}pmw8z6jb8ejmrqknxbu5w4sv542plnzs8_}znyq6b6x67ar0lsq04qu742uenp4ufoxz7ir8gzohi352}7{9hk{yu4_zbj7gmvl{c_24weh8rwxp_24dhp{giv9k}gz840uezqk9s}qxi{2u2lbbt4i}kq8gomrqewvrj65dgwaoitc99yh4jest6sccnz2wlgmap6f9k04lhanc3wmgpj6xawln_jce6c6vfttu{zws4odom7{h5hewr_{5}6fty4a14ar64q1vvg0s28zsik}nhpmw}j92s42k}zzxx0bn7cddk70iw4{f8wqguyj6a58s0u2}xzwh{0vdawdge8n88j6ms8uvt_r4hezvei3u2k179tlepun{c1l02_e92ijk9xx0o_a8gwnmp1jr9gtk2{cq7qnmrphvyecps}63cqvxcy{i5}d2r1r{rg1n}nufm7sue378uwdqe9ezscxoq90nme76}jx4}}b8ahe_paby2qxqwop63kc6eujs7}f90pkkiddlvfobb24wj52wzu2cnhoa_p4jjw4nh9kr5gif04ojbh1e_eec12"
                    );
        ~allocator((allocator<char> *)&__for_end);
                    /* try { // try from 001012b9 to 00101e09 has its CatchHandler @ 00101fe0 */
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x1f0);
        flg[0] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x192);
        flg[1] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x322);
        flg[2] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0xe4);
        flg[3] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x2f6);
        flg[4] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x2f4); flg[5] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x276);
        flg[6] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x27a);
        flg[7] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x2d6);
        flg[8] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0xce);
        flg[9] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x8e);
        flg[10] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x33d);
        flg[11] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x1cb);
        flg[12] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0xd3);
        flg[13] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x126);
        flg[14] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x22a);
        flg[15] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x125);
        flg[16] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x2ad);
        flg[17] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x1ab);
        flg[18] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x274);
        flg[19] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x117);
        flg[20] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x3a2);
        flg[21] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x1cb);
        flg[22] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x161);
        flg[23] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0xfb);
        flg[24] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x28a);
        flg[25] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0xa9);
        flg[26] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x216);
        flg[27] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x142);
        flg[28] = *pcVar7;
        pcVar7 = (char *)operator[]((basic_string<char,std--char_traits<char>,std--allocator<char>>
                                     *)&otxt,0x2f);
        flg[29] = *pcVar7;
```

It's C++ but its quite readable. We are generating the flag using the indices from the allocated string.

Let's script it and get the flag.


```python
s = "s}yvzezqr_6x45jx2yp4d38qq1mvnsl0u7w32lr12gi}t3i5kw0oewkqb_vv6726}}95cmfy_jfgyx25n1e9cuyvsor_0mijcnhoa2kpvdtjd9js2kstbe5}s6zgyil6qxtr}wbol}dzmg3t02466hu1gkpm2xv8u{ryn0s11uzu_426p8k4owb21f3buof6ok{cp9s2s88k3yhzdsq1d2u7n3}9ex}9sly0p0}lp5yxdi7m37_p82o54im1z7bw5u2tu9n2loybmr51jih8lxf7z6n62goh3_63cnnbfczhmsy4pe}ijluq9xbkk4d{c13s5hjkjldeww9z}78oyt1pog5qudz{6fkw_wgon99yc{7v4sakj6pddk5i1c_1g74e_xwivk7mmbm16it6zxfc1y6sdz{0zrmuvysbl}pmw8z6jb8ejmrqknxbu5w4sv542plnzs8_}znyq6b6x67ar0lsq04qu742uenp4ufoxz7ir8gzohi352}7{9hk{yu4_zbj7gmvl{c_24weh8rwxp_24dhp{giv9k}gz840uezqk9s}qxi{2u2lbbt4i}kq8gomrqewvrj65dgwaoitc99yh4jest6sccnz2wlgmap6f9k04lhanc3wmgpj6xawln_jce6c6vfttu{zws4odom7{h5hewr_{5}6fty4a14ar64q1vvg0s28zsik}nhpmw}j92s42k}zzxx0bn7cddk70iw4{f8wqguyj6a58s0u2}xzwh{0vdawdge8n88j6ms8uvt_r4hezvei3u2k179tlepun{c1l02_e92ijk9xx0o_a8gwnmp1jr9gtk2{cq7qnmrphvyecps}63cqvxcy{i5}d2r1r{rg1n}nufm7sue378uwdqe9ezscxoq90nme76}jx4}}b8ahe_paby2qxqwop63kc6eujs7}f90pkkiddlvfobb24wj52wzu2cnhoa_p4jjw4nh9kr5gif04ojbh1e_eec12"
flg = [0]*100
flg[0]  = s[0x1f0]
flg[1]  = s[0x192]
flg[2]  = s[0x322]
flg[3]  = s[0xe4]
flg[4]  = s[0x2f6]
flg[5]  = s[0x2f4]
flg[6]  = s[0x276]
flg[7]  = s[0x27a]
flg[8]  = s[0x2d6]
flg[9]  = s[0xce]
flg[10] = s[0x8e]
flg[11] = s[0x33d]
flg[12] = s[0x1cb]
flg[13] = s[0xd3] flg[14] = s[0x126]
flg[15] = s[0x22a]
flg[16] = s[0x125]
flg[17] = s[0x2ad]
flg[18] = s[0x1ab]
flg[19] = s[0x274]
flg[20] = s[0x117]
flg[21] = s[0x3a2]
flg[22] = s[0x1cb]
flg[23] = s[0x161]
flg[24] = s[0xfb]
flg[25] = s[0x28a]
flg[26] = s[0xa9]
flg[27] = s[0x216]
flg[28] = s[0x142]
flg[29] = s[0x2f]
flg[30] = s[0x21a]
flg[31] = s[0x325]
flg[32] = s[0x216]
flg[33] = s[0x164]
flg[34] = s[0x1e4]
flg[35] = s[0x1b9]
flg[36] = s[0x2df]
flg[37] = s[0x1e9]
flg[38] = s[0x3d]
flg[39] = s[0x1fe]
flg[40] = s[0x2d3]
flg[41] = s[0x1a1]
flg[42] = s[0x97]
flg[43] = s[0xaa]
flg[44] = s[0x123]
flg[45] = s[0x2d8]
flg[46] = s[0x184]
flg[47] = s[0x2d7]
flg[48] = s[0x90]
flg[49] = s[0x14]
flg[50] = s[0xd9]
flg[51] = s[0x5b]
flg[52] = s[0x346]
flg[53] = s[0x25c]
flg[54] = s[0x1f7]
flg[55] = s[0x1b6]
flg[56] = s[0xba]
flg[57] = s[0x1bd]
flg[58] = s[0x204]
flg[59] = s[0xf8]
flg[60] = s[0x135]
flg[61] = s[0x14c]
flg[62] = s[0xb3]
flg[63] = s[0x35b]
flg[64] = s[0xe9]
flg[65] = s[9]
flg[66] = s[0x1c3]
flg[67] = s[0x333]
flg[68] = s[0x3a1]
flg[69] = s[0xce]
flg[70] = s[0x2f7]
flg[71] = s[0x4f]
flg[72] = s[0x374]
flg[73] = s[0x164]
flg[74] = s[0xb8]
flg[75] = s[0x2c1]
flg[76] = s[0x1cb]
flg[77] = s[0x36f]
flg[78] = s[0x62]
flg[79] = s[0x123]
flg[80] = s[0x395]
flg[81] = s[0x4f]
flg[82] = s[0x12e]
flg[83] = s[0x1bd]
flg[84] = s[0x208]
flg[85] = s[0x142]
flg[86] = s[0xef]
flg[87] = s[0x1cb]
flg[88] = s[0x368]
flg[89] = s[0x2ee]
flg[90] = s[0xd]
flg[91] = s[0x28a]
flg[92] = s[0x3e2]
flg[93] = s[0x388]
flg[94] = s[0x39a]
flg[95] = s[0x3a5]
flg[96] = s[0xf2]
flg[97] = s[0xe5]
flg[98] = s[0x2f7]
flg[99] = s[0xe6]

print(''.join(flg))
```
