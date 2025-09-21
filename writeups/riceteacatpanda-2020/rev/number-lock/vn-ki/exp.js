//let blah = String.raw`rplUD1U}0WNU}Wm}T0}Nm}u02}3U`.split``
let blah = String.raw(Buffer.from("cnCBbJlVRDFVfZUwV05VfVdtfVQwgH1ObZV9dTAyfTNVnw==", 'base64').toString()).split``

let t = 255
// 77 106 174
for (let i=1; i<t; i++) {
  for (let j=1; j<t; j++) {
    for (let k=1; k<t; k++) {
      let s = blah.map(zz=>([a,b,c]=[i, j, k],String).fromCharCode(((a-zz.charCodeAt())^b)+c)).join``
      console.log(s)
      console.log(i, j, k)
      if (s.includes('rt')) {
        process.exit(0)
      }
    }
  }
}
