const audio = wx.createInnerAudioContext()
const app = getApp()
Page({
  data:{
    is_selected : false,
    rotationAngle : 0,
    music_url:'',
    Purchaser:'',
    musiclist:{},
    audioDuration:'',
    audioCurrent:'',
    audioPos: 0,
    isplay: false,
    nfc:null,
  },
    select:function () {
      audio.stop()
      app.globalData.song_id = this.data.musiclist.data.id
      app.globalData.song_name = this.data.musiclist.data.song_name
      app.globalData.singer_name = this.data.musiclist.data.singer_name
      wx.navigateTo({
        url: '../ssp/ssp',
      })
    },
  play:function () {
    if(!this.data.isplay)
    {
      audio.play();
      this.setData({isplay:true});

      let angle = 0;
      setInterval(() => {
        if(this.data.isplay){
          angle += 1;
          this.setData({
            rotationAngle:angle
          });
        }
      }, 50);

      audio.onTimeUpdate(() => {
        this.setData({
          audioPos : audio.currentTime / audio.duration * 100,
          audioCurrent: this.format(audio.currentTime)
        });
      })
    }
    else{
      audio.pause();
      this.setData({isplay:false});
    }
  },

  string2ArrayBuffer : function(str) {
    // 首先将字符串转为16进制
    let val = ""
    for (let i = 0; i < str.length; i++) {
        if (val === '') {
            val = str.charCodeAt(i).toString(16)
        } else {
            val += ',' + str.charCodeAt(i).toString(16)
        }
    }
    // 将16进制转化为ArrayBuffer
    return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function(h) {
        return parseInt(h, 16)
    })).buffer
  },


  export:function () {
    const nfc = wx.getNFCAdapter()
    this.nfc = nfc

    this.nfc.startDiscovery({
      success(){
      },
      fail(err){
      }
    })

    const records = [{
      id: this.string2ArrayBuffer("0"),
      payload: this.string2ArrayBuffer("text"),
      type: this.string2ArrayBuffer("0"),
      tnf: 1
    }];

    const onDiscoveredCallback = res => {
      const NFC = this.nfc.getNdef()
      NFC.connect({
        success:() => {
          NFC.writeNdefMessage({
            records:records,
            success:() => {
              wx.showToast({
                title: 'export successfully!',
              })
            },
            fail:(err) => {
              wx.showToast({
                title: err.errMsg,
              })
            },
            complete: res => {
              NFC.close()
              wx.showToast({
                title: res,
              })
            }
          })
        }
      })
      this.nfc.offDiscovered(onDiscoveredCallback)
    }

    this.nfc.onDiscovered(onDiscoveredCallback)
  },

  handle_slider_change:function (e) {
    const position = e.detail.value;
    var currentTime = position / 100 * audio.duration;
    audio.seek(currentTime);
    this.setData({
      audioPos:position,
      audioCurrent:this.format(currentTime)
    })
  },

  onLoad: function (options) {
    var that = this;
    const eventChannel = that.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', data => {
      console.log(data)
      that.setData({
        musiclist : data
      });
    });
    this.setData({
      is_selected:app.globalData.is_selected,
      music_url:app.globalData.pic_url
    })
    
    
    console.log(this.data.musiclist)
    console.log(Object.keys(this.data.musiclist).length)
    if(Object.keys(this.data.musiclist).length == 0)
    {
      this.setData({
        'musiclist.data.id' : app.globalData.song_id,
        'musiclist.data.singer_name' : app.globalData.singer_name,
        'musiclist.data.song_name' : app.globalData.song_name
      })
    }

    //console.log(this.data.musiclist)
    setTimeout(() => {
      audio.src = "https://music.163.com/song/media/outer/url?id=" + this.data.musiclist.data.id + ".mp3";
    }, 1000);
    

    audio.onCanplay(() => {
      audio.duration;
      setTimeout(() => {
        this.setData({
          audioDuration:this.format(audio.duration),
          audioCurrent:this.format(audio.currentTime)
        });
      }, 1000);
    });
    audio.onEnded((res) => {
      this.setData({
        isplay:false
      })
    });
  },

  onUnload:function () {
    audio.stop()
    if(this.nfc){
      this.nfc.stopDiscovery()
    }
  },

  format:function (t) {
    let time = Math.floor(t / 60) >= 10 ? Math.floor(t / 60) : '0' + Math.floor(t / 60);
    t = time + ':' + ((t % 60) / 100).toFixed(2).slice(-2);
    return t;
  }
});