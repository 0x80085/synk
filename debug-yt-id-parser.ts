const urls = [
  "http://www.youtube.com/watch?v=-wtIMTCHWuI",

  "http://www.youtube.com/v/-wtIMTCHWuI?version=3&autohide=1",

  "http://youtu.be/-wtIMTCHWuI",

  "http://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch?v%3D-wtIMTCHWuI&format=json",

  "http://www.youtube.com/attribution_link?a=JdfC0C9V6ZI&u=%2Fwatch%3Fv%3DEhxJLojIE_o%26feature%3Dshare",

  "https://www.youtube.com/attribution_link?a=8g8kPrPIi-ecwIsS&u=/watch%3Fv%3DyZv2daTWRZU%26feature%3Dem-uploademail",

  "https://www.youtube.com/watch?v=yZv2daTWRZU&feature=em-uploademail",

  "https://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index",

  "https://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/QdK8U-VIH_o",

  "https://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0",

  "https://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s",

  "https://www.youtube.com/embed/0zM3nApSvMg?rel=0",

  "www.youtube-nocookie.com/embed/up_lNV-yoK4?rel=0",

  "https://www.youtube-nocookie.com/embed/up_lNV-yoK4?rel=0",

  "http://www.youtube.com/user/Scobleizer#p/u/1/1p3vcRhsYGo",

  "http://www.youtube.com/watch?v=cKZDdG9FTKY&feature=channel",

  "http://www.youtube.com/watch?v=yZ-K7nCVnBI&playnext_from=TL&videos=osPknwzXEas&feature=sub",

  "http://www.youtube.com/ytscreeningroom?v=NRHVzbJVx8I",

  "http://www.youtube.com/watch?v=6dwqZw0j_jY&feature=youtu.be",

  "http://www.youtube.com/user/Scobleizer#p/u/1/1p3vcRhsYGo?rel=0",

  "http://www.youtube.com/embed/nas1rJpm7wY?rel=0",

  "https://www.youtube.com/watch?v=peFZbP64dsU",

  "http://youtube.com/v/dQw4w9WgXcQ?feature=youtube_gdata_player",

  "http://youtube.com/?v=dQw4w9WgXcQ&feature=youtube_gdata_player",

  "http://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtube_gdata_player",

  "http://youtube.com/?vi=dQw4w9WgXcQ&feature=youtube_gdata_player",

  "http://youtube.com/watch?v=dQw4w9WgXcQ&feature=youtube_gdata_player",

  "http://youtube.com/watch?vi=dQw4w9WgXcQ&feature=youtube_gdata_player",

  "http://youtube.com/vi/dQw4w9WgXcQ?feature=youtube_gdata_player",

  "http://youtu.be/dQw4w9WgXcQ?feature=youtube_gdata_player",

  "http://www.youtube.com/user/SilkRoadTheatre#p/a/u/2/6dwqZw0j_jY",

  "https://www.youtube.com/watch?v=ishbTyLs6ps&list=PLGup6kBfcU7Le5laEaCLgTKtlDcxMqGxZ&index=106&shuffle=2655",

  "http://www.youtube.com/v/0zM3nApSvMg?fs=1&hl=en_US&rel=0",

  "http://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index",

  "http://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s",

  "http://www.youtube.com/embed/dQw4w9WgXcQ",

  "http://www.youtube.com/v/dQw4w9WgXcQ",

  "http://www.youtube.com/e/dQw4w9WgXcQ",

  "http://www.youtube.com/?v=dQw4w9WgXcQ",

  "http://www.youtube.com/watch?feature=player_embedded&v=dQw4w9WgXcQ",

  "http://www.youtube.com/?feature=player_embedded&v=dQw4w9WgXcQ",

  "http://www.youtube.com/user/IngridMichaelsonVEVO#p/u/11/KdwsulMb8EQ",

  "http://www.youtube-nocookie.com/v/6L3ZvIMwZFM?version=3&hl=en_US&rel=0",

  "http://www.youtube.com/user/dreamtheater#p/u/1/oTJRivZTMLs",

  "https://youtu.be/oTJRivZTMLs?list=PLToa5JuFMsXTNkrLJbRlB--76IAOjRM9b",

  "http://www.youtube.com/watch?v=oTJRivZTMLs&feature=youtu.be",

  "http://youtu.be/oTJRivZTMLs&feature=channel",

  "http://www.youtube.com/ytscreeningroom?v=oTJRivZTMLs",

  "http://www.youtube.com/embed/oTJRivZTMLs?rel=0",

  "http://youtube.com/vi/oTJRivZTMLs&feature=channel",

  "http://youtube.com/?v=oTJRivZTMLs&feature=channel",

  "http://youtube.com/?feature=channel&v=oTJRivZTMLs",

  "http://youtube.com/?vi=oTJRivZTMLs&feature=channel",

  "http://youtube.com/watch?v=oTJRivZTMLs&feature=channel",

  "http://youtube.com/watch?vi=oTJRivZTMLs&feature=channel",

  "https://m.youtube.com/watch?v=m_kbvp0_8tc",

  "https://www.youtube.com/watch?v=6KEnzhHQhoo"
];

urls.forEach((url) => {
  const id = YouTubeGetID(url);
  const id2 = YouTubeGetID_V2(url);
  const idNode = `<p>(V1) ${id}</p>`;
  const id2Node = `<p>(V2) ${id2}</p>`;
  const urlNode = `<p>${url}</p>`;

  document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", idNode);
  document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", id2Node);
  document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", urlNode);
  document.getElementsByTagName("body")[0].insertAdjacentHTML("beforeend", `<hr>`);
});

function YouTubeGetID(url) {
  const regx = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
  const isValid = regx.test(url);

  if (!isValid) {
    return "❌";
  }
  let ID;
  const ytID = url
    .replace(/(>|<)/gi, "")
    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (ytID[2] !== undefined) {
    ID = ytID[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  } else {
    ID = ytID;
  }
  return `✅ ${ID}`;
}

function YouTubeGetID_V2(url) {
  const regx = /(?:\/|%3D|v=|vi=)([0-9A-z-_]{11})(?:[%#?&]|$)/;
  const isValid = regx.test(url);

  if (!isValid) {
    return "❌";
  }
  let ID;
  const ytID = url
    .replace(/(>|<)/gi, "")
    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if (ytID[2] !== undefined) {
    ID = ytID[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  } else {
    ID = ytID;
  }
  return `✅ ${ID}`;
}
