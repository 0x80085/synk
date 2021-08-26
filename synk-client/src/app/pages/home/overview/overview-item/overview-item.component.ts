import { Component, Input } from '@angular/core';
import { YouTubeGetID } from 'src/app/pages/channel/media/youtube/youtube.component';
import { ChannelOverviewItem } from '../../overview.service';

@Component({
  selector: 'app-overview-item',
  templateUrl: './overview-item.component.html',
  styleUrls: ['./overview-item.component.scss']
})
export class OverviewItemComponent {

  @Input() channel: ChannelOverviewItem;

  constructor() { }

  getThumbnailForYoutubeVid() {
    if (!this.channel.nowPlaying.url) {
      return null
    }
    const id = YouTubeGetID(this.channel.nowPlaying.url)
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  }

}
