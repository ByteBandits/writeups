int memcmp(const char *s1, const char *s2, int n){
    int i;
    int cnt = 0;
    for(i=0; i < n; ++i){
        if(s1[i] == s2[i]) cnt++;
        else break;
    }
    return cnt;
}
