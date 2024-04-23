## 微信小程序文档： Photo NFC

开发环境： Weixin Devtools Stable 1.06.2402030

微信小程序库（WeChatLib）的版本号： 3.3.4



文件夹neteasecloudmusicapi内，是网易云音乐api的nodejs版本

文件夹PicSound是微信小程序



Warning：本项目因为在本地部署，没有开启云服务，所以没有后端和数据库，所有的数据基本都将用全局变量保存在前端，设有默认值。



### 初始页面（index）关键函数

#### scan函数

​	用于启动NFC功能的函数，绑定于一个button或者其他组件上，点击后开启：

​	初始化nfc后，开始扫描检测是否有设备进入nfc扫描区域（函数 startDiscovery）。

​	随后定义了一个onDiscoveredCallback函数，用于读取NFC tag中的二进制数据，并将其转化为ASCILL码，保保存数据后跳转到播放页面。

​	nfc对象调用onDiscovered，传入onDiscoveredCallback函数，执行上述操作。



**注意：在微信小程序开发工具中，无法看到nfc的效果，必须将小程序上线后，通过安卓手机进行测试，比较麻烦。**

```js
scan:function () {
    
    const nfc = wx.getNFCAdapter()
    this.nfc = nfc

    this.nfc.startDiscovery({
      success:(res) => {
        this.setData({
          message:'Place the device in the nfc identification zone'
        })
      },
      fail:(err) => {
        console.log('err:', err)
        this.setData({
          message:err.errMsg
        })
      },
      complete: res => {
        console.log(res)
      }
    })

    const onDiscoveredCallback = res => {
      var buffer = res.messages[0].records[0].payload;
      var dataview = new DataView(buffer);
      var ints = new Uint8Array(buffer);
      var shuzu = ints.slice(3);
      let uint8Arr = new Uint8Array(shuzu);
      let encodedString = String.fromCharCode.apply(null, uint8Arr),
          decodedString = decodeURIComponent(escape((encodedString)));
      this.setData({
        content:decodedString,
      })
      this.nfc.offDiscovered(onDiscoveredCallback);

      wx.navigateTo({
        url: '../display/display',
      })
    }

    this.nfc.onDiscovered(onDiscoveredCallback);

  },
```



当页面隐藏的时候，nfc功能停止扫描，防止不必要的操作和跳转。

```js
  onHide(){
    if(this.nfc){
      this.nfc.stopDiscovery()
    }
  }
```



### Standard single Photograph（ssp）页面关键函数

#### 1.chooseImage函数

功能：选择图片功能，选择一张图片并设置为页面的图片URL，同时更新全局数据中的图片URL。

```js
chooseImage: function() {
  var that = this;
  wx.chooseMedia({
    count: 1,
    mediaType: ['image'],
    maxDuration: 30,
    camera: 'back',
    success(res) {
      console.log(res.tempFiles[0].size)
      console.log(res.tempFiles[0].tempFilePath)
      that.setData({
        imageUrl: res.tempFiles[0].tempFilePath,
        hintText: '',
      });
      app.globalData.pic_url = that.data.imageUrl
      wx.showToast({
        title: 'upload sucess!!!',
        icon: 'loading',
        duration: 500
      })
    }
  })
}
```



#### 2. deleteImg函数

功能：删除图片功能，弹出确认对话框，确认删除后清空图片URL。

```js
deleteImg: function (e) {
  var that = this;
  wx.showModal({
    title: 'Tip',
    content: 'Are you sure to delete the photo?',
    complete: (res) => {
      if (res.confirm) {
        console.log('delete!!!');
      }
      
      if (res.cancel) {
        console.log("cancel!!!");
        return false;
      }
      that.setData({
        hintText: 'Insert Your Photo',
        imageUrl: ''
      });
    }
  }j's
}
```



#### 3. previewImg函数

功能：预览图片功能，预览当前页面中的图片。

```js
previewImg: function () {
  var photo = this.data.imageUrl;
  console.log(photo)
  wx.previewImage({
    current: photo,
    urls: photo
  })
}
```



**但是在微信小程序中并不能看到效果。**



### music页面

#### 1. 接口请求

**需要下载其他音乐的api接口，这里用的是网易云音乐 NodeJS 版 API，见附件。**

在其文件的根目录下启动

```c
node app.js
```

在本地开启服务。



1. 获取推荐音乐列表：`http://localhost:3000/personalized/newsong?limit=20`
2. 搜索音乐：`http://localhost:3000/search?keywords={keyword}`

其他接口详情可以查看文档[网易云音乐 NodeJS 版 API (neteasecloudmusicapi.js.org)](https://neteasecloudmusicapi.js.org/#/?id=neteasecloudmusicapi)



#### 2. get_music函数

首先，函数会检查用户是否输入了搜索关键字。如果用户没有输入关键字（即`this.data.keyword`为空），则会发起一个HTTP请求到`http://localhost:3000/personalized/newsong?limit=20`，该请求会返回推荐的新歌列表。

如果用户输入了搜索关键字，函数会根据用户输入的关键字发起一个HTTP请求到`http://localhost:3000/search?keywords={keyword}`，其中`{keyword}`为用户输入的搜索关键字。请求成功后，会解析返回的音乐信息

**warning：有些歌没有版权，请检查**

```
getMusic: function () {
  var that = this;
  if (this.data.keyword == '') {
    wx.request({
      url: 'http://localhost:3000/personalized/newsong?limit=20',
      dataType: 'json',
      success: (result) => {
        let dic = [];
        for (let re in result.data.result) {
          var id = result.data.result[re].id
          var song_name = result.data.result[re].name
          var singer_name = result.data.result[re].song.artists[0].name
          dic.push({ id: id, song_name: song_name, singer_name: singer_name })
        }
        that.setData({
          musiclist: dic,
        });
      }
    })
  } else {
    wx.request({
      url: 'http://localhost:3000/search?keywords=' + this.data.keyword,
      dataType: 'json',
      success: (result) => {
        var Songs = result.data.result.songs
        let dic = [];
        for (let i = 0; i < Songs.length; i++) {
          var id = Songs[i].id;
          var song_name = Songs[i].name;
          var singer_name = Songs[i].artists[0].name;
          dic.push({ id: id, song_name: song_name, singer_name: singer_name })
        }
        that.setData({
          musiclist: dic,
        });
      }
    })
  }
```



### display页面

#### 1. onload函数

功能：用于页面加载时的初始化操作。在该函数中，页面会接收来自打开页面的数据，并根据数据进行相应的处理，设置页面数据和音乐播放链接

```js
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
```

#### 步骤：

1. 获取页面实例`that`，并通过`getOpenerEventChannel()`获取事件通道`eventChannel`。
2. 监听事件通道`acceptDataFromOpenerPage`，并在接收到数据时将数据设置到页面的`musiclist`中。
3. 设置页面数据`is_selected`和`music_url`为全局数据`app.globalData.is_selected`和`app.globalData.pic_url`。
4. 打印`musiclist`数据和其长度。
5. 如果`musiclist`为空，则根据全局数据设置`musiclist`的相关属性。
6. 在延迟1秒后，设置音频的src为音乐链接。
7. 监听音频`audio`的`onCanplay`事件，获取音频时长和当前时间，并进行格式化处理。
8. 监听音频`audio`的`onEnded`事件，当音频播放结束时将`isplay`设置为false。





#### 2. play函数

```js
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
  }
```

- 功能：实现音乐的播放和暂停功能，同时旋转图片以展示播放状态。监听音乐的播放进度，更新页面显示当前播放时间和进度条。



#### 2. handle_slider_change函数

功能：处理进度条滑动事件，实现音乐播放进度的调节。

```js
  handle_slider_change:function (e) {
    const position = e.detail.value;
    var currentTime = position / 100 * audio.duration;
    audio.seek(currentTime);
    this.setData({
      audioPos:position,
      audioCurrent:this.format(currentTime)
    })
  }
```





#### 4. export函数

功能：启动NFC功能，并写入NDEF消息到NFC标签。当发现NFC标签时，将消息写入标签。

```js
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
  }
```

##### 步骤

1. 使用`wx.getNFCAdapter()`获取NFC适配器，并将其存储在`nfc`变量中。
2. 使用`nfc.startDiscovery()`开始NFC发现过程。
3. 定义一个NDEF消息记录数组。每个记录包含ID、负载、类型和TNF（类型名称格式）。
4. 定义一个`onDiscoveredCallback`函数，当发现NFC标签时将触发该函数。
5. 在onDiscoveredCallback函数内部：
   - 从NFC适配器获取NDEF对象。
   - 连接到NFC标签。
   - 使用定义的记录将NDEF消息写入NFC标签。
   - 如果写入操作成功，则显示成功消息。
   - 如果写入操作失败，则显示错误消息。
   - 在写入消息后关闭NFC连接。
6. 注册在发现NFC标签时调用`onDiscoveredCallback`函数。
7. 在调用后取消注册`onDiscoveredCallback`函数。



#### 5. 其他辅助函数

1. `string2ArrayBuffer`函数：将字符串转换为ArrayBuffer格式的数据。

1. `format`函数：将时间格式化为`mm:ss`的形式。