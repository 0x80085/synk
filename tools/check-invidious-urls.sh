#!/bin/bash

urls=(
    "https://vid.puffyan.us/api/v1/videos/77Vw-trjScI"
    "https://yt.artemislena.eu/api/v1/videos/77Vw-trjScI"
    "https://invidious.projectsegfau.lt/api/v1/videos/77Vw-trjScI"
    "https://invidious.slipfox.xyz/api/v1/videos/77Vw-trjScI"
    "https://invidious.privacydev.net/api/v1/videos/77Vw-trjScI"
    "https://vid.priv.au/api/v1/videos/77Vw-trjScI"
    "https://iv.melmac.space/api/v1/videos/77Vw-trjScI"
    "https://iv.ggtyler.dev/api/v1/videos/77Vw-trjScI"
    "https://invidious.lunar.icu/api/v1/videos/77Vw-trjScI"
    "https://inv.zzls.xyz/api/v1/videos/77Vw-trjScI"
    "https://inv.tux.pizza/api/v1/videos/77Vw-trjScI"
    "https://invidious.protokolla.fi/api/v1/videos/77Vw-trjScI"
    "https://iv.nboeck.de/api/v1/videos/77Vw-trjScI"
    "https://invidious.private.coffee/api/v1/videos/77Vw-trjScI"
    "https://yt.drgnz.club/api/v1/videos/77Vw-trjScI"
    "https://iv.datura.network/api/v1/videos/77Vw-trjScI"
    "https://invidious.fdn.fr/api/v1/videos/77Vw-trjScI"
    "https://invidious.perennialte.ch/api/v1/videos/77Vw-trjScI"
    "https://yt.cdaut.de/api/v1/videos/77Vw-trjScI"
    "https://invidious.drgns.space/api/v1/videos/77Vw-trjScI"
    "https://inv.us.projectsegfau.lt/api/v1/videos/77Vw-trjScI"
    "https://invidious.einfachzocken.eu/api/v1/videos/77Vw-trjScI"
    "https://invidious.nerdvpn.de/api/v1/videos/77Vw-trjScI"
    "https://inv.n8pjl.ca/api/v1/videos/77Vw-trjScI"
    "https://youtube.owacon.moe/api/v1/videos/77Vw-trjScI"
    "https://yewtu.be/api/v1/videos/77Vw-trjScI"
)

success_urls=()

for url in "${urls[@]}"; do
    response=$(curl -s "$url")
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [[ $status_code -eq 200 ]]; then
        title=$(echo "$response" | jq -r '.title')
        video_id=$(echo "$response" | jq -r '.videoId')
        
        echo "URL: $url"
        echo "Status code: $status_code"
        echo "Video ID: $video_id"
        echo "Title: $title"
        echo "-------------------"
        
        success_urls+=("$url")
    fi
done

echo "JavaScript-compatible array of URLs that returned 200:"
echo "["
for ((i = 0; i < ${#success_urls[@]}; i++)); do
    if [ $i -eq $((${#success_urls[@]} - 1)) ]; then
        echo "  '${success_urls[$i]}'"
    else
        echo "  '${success_urls[$i]}',"
    fi
done
echo "]"