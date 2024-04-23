
const app = getApp()
Page({
  data:{
    content : '',
    message:'',
    nfc:null,
    imageUrl:'',
    hintText:'Insert Your Photo',
    background:["../sources/index1.jpg",
                "../sources/index2.jpg",
                "../sources/index3.jpg"
  ],
  // sample:[
  //   "../sources/sample/sample1.jpg",
  //   "../sources/sample/sample2.jpg",
  //   "../sources/sample/sample3.jpg",
  //   "../sources/sample/sample4.jpg",
  //   "../sources/sample/sample5.jpg",
  //   "../sources/sample/sample6.jpg"
  // ],
  },
  
  scan:function () {
    
    const nfc = wx.getNFCAdapter()
    this.nfc = nfc


    this.nfc.startDiscovery({
      success:(res) => {
        this.setData({
          message:'Place the device in the nfc identification zone'
        })
        console.log(5555, res)
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

  onHide(){
    if(this.nfc){
      this.nfc.stopDiscovery()
    }
  },

  jump:function (e) {
    let index = e.currentTarget.dataset.index;
    var url;
    switch(index)
    {
      case 'ssp':
        url = '../ssp/ssp';
        break;
      case 'wp':
        url = '../wp/wp';
        break;
      case 'mpc':
        url = '../mpc/mpc';
        break;
    }
    console.log(url);
    wx.navigateTo({
      url: url,
    })
  },
});