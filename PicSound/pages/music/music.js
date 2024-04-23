const app = getApp()
Page({
  data:{
    keyword:'',
    musiclist:[{'id':475072483,
                'singer_name':'The Chainsmokers',
                'song_name':'Something Just Like This'}]
  },

  jump_to_play:function (e) {
    app.globalData.is_selected = true
    const index = e.currentTarget.dataset.index
    const musicdata = this.data.musiclist[index]
    wx.navigateTo({
      url: '../display/display',
      success:(res) =>{
        res.eventChannel.emit('acceptDataFromOpenerPage', {data: musicdata})
      }
    })
  },

  onLoad:function (options) {
    this.getMusic()
  },

  keywordInput:function (options) {
      var that = this;
      that.setData({
        keyword : options.detail.value
      })
  },

  searching:function () {
    this.getMusic(this.data.keyword)
  },

  getMusic:function () {
    var that = this;
    if(this.data.keyword == '')
    {
      wx.request({
        url: 'http://localhost:3000/personalized/newsong?limit=20',
        dataType:'json',
        success:(result) => {
          let dic = [];
          for(let re in result.data.result)
          {
            var id = result.data.result[re].id
            var song_name = result.data.result[re].name
            var singer_name = result.data.result[re].song.artists[0].name
            dic.push({id:id, song_name: song_name, singer_name:singer_name})
          }
          that.setData({
            musiclist:dic,
          });
        }
      })
    }
    else{
      wx.request({
        url: 'http://localhost:3000/search?keywords=' + this.data.keyword,
        dataType:'json',
        success:(result) => {
          var Songs = result.data.result.songs
          console.log(Songs)
          console.log(Object.keys(Songs).length)
          let dic = [];
          for (let i = 0; i < Songs.length; i++) {
            console.log(Songs[i])
            var id = Songs[i].id;
            var song_name = Songs[i].name;
            var singer_name = Songs[i].artists[0].name;
            dic.push({id:id, song_name: song_name, singer_name:singer_name})
          }
          that.setData({
            musiclist:dic,
          });
        }
      })
    }
  }
});