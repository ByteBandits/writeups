export function lev(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return dp[b.length];
}

const isSubsequence = (t: string, e: string) => {
  let i = 0;
  for (const ch of e) if (ch === t[i]) i++;
  return i === t.length;
};

/** 1.0 exact, 0.9 prefix, 0.8 substring, 0.7 small typo, 0.5 subsequence, 0 no match */
export function scoreToken(t: string, e: string): number {
  if (e === t) return 1.0;
  if (e.startsWith(t)) return 0.9;
  if (e.includes(t)) return 0.8;
  if (lev(t, e) <= Math.max(1, Math.floor(e.length / 4))) return 0.7;
  if (t.length >= 3 && isSubsequence(t, e)) return 0.5;
  return 0;
}
