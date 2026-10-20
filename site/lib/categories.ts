/** canonical categories — metadata has rev/reverse/RE/exploit/... variants */
export const CATEGORY_MAP: Record<string, string> = {
  pwn: "pwn", pwning: "pwn", pwnable: "pwn", exploit: "pwn", exploitation: "pwn",
  rev: "rev", re: "rev", reverse: "rev", reversing: "rev", "reverse-engineering": "rev",
  crypto: "crypto", cryptography: "crypto",
  web: "web", webexp: "web",
  forensics: "forensics", forensic: "forensics",
  stego: "stego", steg: "stego", steganography: "stego",
  recon: "recon", reconnaissance: "recon", osint: "recon",
};

export const normalizeCategory = (raw: string) => {
  // some writeups stuff multiple values into type ("pwn,rev",
  // "analysis,reverse") — first part that maps to a canonical category wins
  const parts = raw.trim().toLowerCase().split(",").map((p) => p.trim());
  for (const p of parts) if (CATEGORY_MAP[p]) return CATEGORY_MAP[p];
  return parts[0];
};

export const CATEGORY_COLORS: Record<string, string> = {
  pwn: "#58a6ff",
  rev: "#d2707a",
  crypto: "#c9a227",
  web: "#39c5cf",
  forensics: "#3fb950",
  stego: "#bc8cff",
  recon: "#e8894a",
  misc: "#8b949e",
};
