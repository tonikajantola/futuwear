#define DEBUG

#ifdef DEBUG
    #define LOG(x) Serial.println(x)
#else
    #define LOG(x)
#endif
