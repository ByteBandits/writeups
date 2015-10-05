[](ctf=csaw-quals-2015)
[](type=crypto)
[](tags=cryptogram)
[](tools=rumkin)
[](techniques=)

# whiter0se (crypto-50)

We are given the cipher text:

EOY XF, AY VMU M UKFNY TOY YF UFWHYKAXZ EAZZHN. UFWHYKAXZ ZNMXPHN. UFWHYKAXZ EHMOYACOI. VH'JH EHHX CFTOUHP FX VKMY'U AX CNFXY FC OU. EOY VH KMJHX'Y EHHX IFFQAXZ MY VKMY'U MEFJH OU.

Could this be ceasar cipher? Let's check all 26 shifts:

```
yis rzz us pgo g oezhs nis sz ozqbseurt yuttbhb ozqbseurt thgrjbhb ozqbseurt ybgisuwicb pbudb ybbr wzniobj zr pegsuo ur whzrs zw iob yis pb egdbrus ybbr czzkurt gs pegsuo gyzdb iob
zjt saa vt qhp h pfait ojt ta parctfvsu zvuucic parctfvsu uihskcic parctfvsu zchjtvxjdc qcvec zccs xaojpck as qfhtvp vs xiast ax jpc zjt qc fhecsvt zccs daalvsu ht qfhtvp hzaec jpc
aku tbb wu riq i qgbju pku ub qbsdugwtv awvvdjd qbsdugwtv vjitldjd qbsdugwtv adikuwyked rdwfd addt ybpkqdl bt rgiuwq wt yjbtu by kqd aku rd gifdtwu addt ebbmwtv iu rgiuwq iabfd kqd
blv ucc xv sjr j rhckv qlv vc rctevhxuw bxwweke rctevhxuw wkjumeke rctevhxuw bejlvxzlfe sexge beeu zcqlrem cu shjvxr xu zkcuv cz lre blv se hjgeuxv beeu fccnxuw jv shjvxr jbcge lre
cmw vdd yw tks k sidlw rmw wd sdufwiyvx cyxxflf sdufwiyvx xlkvnflf sdufwiyvx cfkmwyamgf tfyhf cffv adrmsfn dv tikwys yv aldvw da msf cmw tf ikhfvyw cffv gddoyvx kw tikwys kcdhf msf
dnx wee zx ult l tjemx snx xe tevgxjzwy dzyygmg tevgxjzwy ymlwogmg tevgxjzwy dglnxzbnhg ugzig dggw besntgo ew ujlxzt zw bmewx eb ntg dnx ug jligwzx dggw heepzwy lx ujlxzt ldeig ntg
eoy xff ay vmu m ukfny toy yf ufwhykaxz eazzhnh ufwhykaxz znmxphnh ufwhykaxz ehmoyacoih vhajh ehhx cftouhp fx vkmyau ax cnfxy fc ouh eoy vh kmjhxay ehhx iffqaxz my vkmyau mefjh ouh
fpz ygg bz wnv n vlgoz upz zg vgxizlbya fbaaioi vgxizlbya aonyqioi vgxizlbya finpzbdpji wibki fiiy dgupviq gy wlnzbv by dogyz gd pvi fpz wi lnkiybz fiiy jggrbya nz wlnzbv nfgki pvi
gqa zhh ca xow o wmhpa vqa ah whyjamczb gcbbjpj whyjamczb bpozrjpj whyjamczb gjoqaceqkj xjclj gjjz ehvqwjr hz xmoacw cz ephza he qwj gqa xj moljzca gjjz khhsczb oa xmoacw oghlj qwj
hrb aii db ypx p xniqb wrb bi xizkbndac hdcckqk xizkbndac cqpaskqk xizkbndac hkprbdfrlk ykdmk hkka fiwrxks ia ynpbdx da fqiab if rxk hrb yk npmkadb hkka liitdac pb ynpbdx phimk rxk
isc bjj ec zqy q yojrc xsc cj yjalcoebd ieddlrl yjalcoebd drqbtlrl yjalcoebd ilqscegsml zlenl illb gjxsylt jb zoqcey eb grjbc jg syl isc zl oqnlbec illb mjjuebd qc zoqcey qijnl syl
jtd ckk fd arz r zpksd ytd dk zkbmdpfce jfeemsm zkbmdpfce esrcumsm zkbmdpfce jmrtdfhtnm amfom jmmc hkytzmu kc aprdfz fc hskcd kh tzm jtd am promcfd jmmc nkkvfce rd aprdfz rjkom tzm
kue dll ge bsa s aqlte zue el alcneqgdf kgffntn alcneqgdf ftsdvntn alcneqgdf knsuegiuon bngpn knnd ilzuanv ld bqsega gd itlde li uan kue bn qspndge knnd ollwgdf se bqsega sklpn uan
lvf emm hf ctb t brmuf avf fm bmdofrheg lhggouo bmdofrheg gutewouo bmdofrheg lotvfhjvpo cohqo looe jmavbow me crtfhb he jumef mj vbo lvf co rtqoehf looe pmmxheg tf crtfhb tlmqo vbo
mwg fnn ig duc u csnvg bwg gn cnepgsifh mihhpvp cnepgsifh hvufxpvp cnepgsifh mpuwgikwqp dpirp mppf knbwcpx nf dsugic if kvnfg nk wcp mwg dp surpfig mppf qnnyifh ug dsugic umnrp wcp
nxh goo jh evd v dtowh cxh ho dofqhtjgi njiiqwq dofqhtjgi iwvgyqwq dofqhtjgi nqvxhjlxrq eqjsq nqqg locxdqy og etvhjd jg lwogh ol xdq nxh eq tvsqgjh nqqg roozjgi vh etvhjd vnosq xdq
oyi hpp ki fwe w eupxi dyi ip epgriukhj okjjrxr epgriukhj jxwhzrxr epgriukhj orwyikmysr frktr orrh mpdyerz ph fuwike kh mxphi pm yer oyi fr uwtrhki orrh sppakhj wi fuwike woptr yer
pzj iqq lj gxf x fvqyj ezj jq fqhsjvlik plkksys fqhsjvlik kyxiasys fqhsjvlik psxzjlnzts gslus pssi nqezfsa qi gvxjlf li nyqij qn zfs pzj gs vxusilj pssi tqqblik xj gvxjlf xpqus zfs
qak jrr mk hyg y gwrzk fak kr gritkwmjl qmlltzt gritkwmjl lzyjbtzt gritkwmjl qtyakmoaut htmvt qttj orfagtb rj hwykmg mj ozrjk ro agt qak ht wyvtjmk qttj urrcmjl yk hwykmg yqrvt agt
rbl kss nl izh z hxsal gbl ls hsjulxnkm rnmmuau hsjulxnkm mazkcuau hsjulxnkm ruzblnpbvu iunwu ruuk psgbhuc sk ixzlnh nk paskl sp bhu rbl iu xzwuknl ruuk vssdnkm zl ixzlnh zrswu bhu
scm ltt om jai a iytbm hcm mt itkvmyoln sonnvbv itkvmyoln nbaldvbv itkvmyoln svacmoqcwv jvoxv svvl qthcivd tl jyamoi ol qbtlm tq civ scm jv yaxvlom svvl wtteoln am jyamoi astxv civ
tdn muu pn kbj b jzucn idn nu julwnzpmo tpoowcw julwnzpmo ocbmewcw julwnzpmo twbdnprdxw kwpyw twwm ruidjwe um kzbnpj pm rcumn ur djw tdn kw zbywmpn twwm xuufpmo bn kzbnpj btuyw djw
ueo nvv qo lck c kavdo jeo ov kvmxoaqnp uqppxdx kvmxoaqnp pdcnfxdx kvmxoaqnp uxceoqseyx lxqzx uxxn svjekxf vn lacoqk qn sdvno vs ekx ueo lx aczxnqo uxxn yvvgqnp co lacoqk cuvzx ekx
vfp oww rp mdl d lbwep kfp pw lwnypbroq vrqqyey lwnypbroq qedogyey lwnypbroq vydfprtfzy myray vyyo twkflyg wo mbdprl ro tewop wt fly vfp my bdayorp vyyo zwwhroq dp mbdprl dvway fly
wgq pxx sq nem e mcxfq lgq qx mxozqcspr wsrrzfz mxozqcspr rfephzfz mxozqcspr wzegqsugaz nzsbz wzzp uxlgmzh xp nceqsm sp ufxpq xu gmz wgq nz cebzpsq wzzp axxispr eq nceqsm ewxbz gmz
xhr qyy tr ofn f ndygr mhr ry nypardtqs xtssaga nypardtqs sgfqiaga nypardtqs xafhrtvhba oatca xaaq vymhnai yq odfrtn tq vgyqr yv hna xhr oa dfcaqtr xaaq byyjtqs fr odfrtn fxyca hna
```

Nothing meaningful. Could be substitution cipher. We don't have any other clue, so we have to manually do a crypt analysis. Before doing that let's try out some online tools.

Went to http://rumkin.com/tools/cipher/cryptogram-solver.php and entered the given cipher,

Aaand we get our flag:

> BUT NO, IT WAS A SHORT CUT TO SOMETHING BIGGER. SOMETHING GRANDER. SOMETHING BEAUTIFUL. WE'VE BEEN FOCUSED ON WHAT'S IN FRONT OF US. BUT WE HAVEN'T BEEN LOOKING AT WHAT'S ABOVE US.