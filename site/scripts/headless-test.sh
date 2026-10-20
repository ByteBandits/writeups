#!/bin/bash
# Headless browser smoke tests against the dev server.
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://localhost:3000"
PASS=0; FAIL=0

check() {
  local name="$1" url="$2" pattern="$3" budget="${4:-4000}"
  local dom
  dom=$("$CHROME" --headless=new --disable-gpu --virtual-time-budget="$budget" --dump-dom "$url" 2>/dev/null)
  if echo "$dom" | grep -qE "$pattern"; then
    echo "PASS  $name"
    PASS=$((PASS+1))
  else
    echo "FAIL  $name  (pattern: $pattern)"
    FAIL=$((FAIL+1))
  fi
}

check "home renders"            "$BASE/"                                              'ByteBandits|recent writeups'
check "home stats real"         "$BASE/"                                              '11[0-9]</b> writeups'
check "hero search present"     "$BASE/"                                              'search writeups — heap'
check "writeup title"           "$BASE/writeups/csaw-quals-2023/pwn/super_secure_heap/sudhackar/" '<h1[^>]*>Super Secure Heap'
check "writeup breadcrumb"      "$BASE/writeups/csaw-quals-2023/pwn/super_secure_heap/sudhackar/" 'csaw-quals-2023</a>'
check "writeup code block"      "$BASE/writeups/csaw-quals-2023/pwn/super_secure_heap/sudhackar/" '<pre'
check "writeup spaced-name"     "$BASE/writeups/csaw-quals-2023/crypto/Mental%20Poker/gjain-7/"   'Mental Poker'
check "writeups index"          "$BASE/writeups/"                                   'all writeups'
check "ctf page"                "$BASE/ctfs/csaw-quals-2023/"                       'csaw-quals-2023'
check "author page"             "$BASE/authors/sudhackar/"                          'sudhackar'
check "tags page"               "$BASE/tags/"                                       '>tags<|tags \('
check "multi-author problem"    "$BASE/writeups/csaw-quals-2023/pwn/unlimited_subway/"  'unlimited_subway'
# NOTE: search behavior is tested in browser-test.mjs (puppeteer) —
# dump-dom cannot await the async WASM search engine.
check "search page renders"     "$BASE/search/?q=heap"                              'search' 8000
check "asset served"            "$BASE/content/csaw-quals-2023/pwn/super_secure_heap/sudhackar/README.md" 'Super Secure Heap'

echo "---"
echo "PASS=$PASS FAIL=$FAIL"
