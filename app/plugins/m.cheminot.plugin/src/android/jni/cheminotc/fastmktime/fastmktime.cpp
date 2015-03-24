/*
 * Copyright (C) 2014 Mitchell Perilstein
 * Licensed under GNU LGPL Version 3. See LICENSING file for details.
 */

#include <time.h>
#include <stdlib.h>
#include <stdio.h>

namespace fastmktime
{
    time_t mk(struct tm *tm)
    {
        static struct tm cache = {0, 0, 0, 0, 0, 0, 0, 0, 0};
        static time_t time_cache = 0;
        time_t result;
        time_t hmsarg;

        hmsarg = 3600 * tm->tm_hour
                 +  60 * tm->tm_min
                 +       tm->tm_sec;

        if ( cache.tm_mday    == tm->tm_mday
                && cache.tm_mon  == tm->tm_mon
                && cache.tm_year == tm->tm_year )
        {
            result = time_cache + hmsarg;
            tm->tm_isdst  = cache.tm_isdst;
        }
        else
        {
            cache.tm_mday = tm->tm_mday;
            cache.tm_mon  = tm->tm_mon;
            cache.tm_year = tm->tm_year;
            time_cache    = mktime(&cache);
            tm->tm_isdst  = cache.tm_isdst;

            result = (-1 == time_cache) ? -1 : time_cache + hmsarg;
        }

        return result;
    }
}
