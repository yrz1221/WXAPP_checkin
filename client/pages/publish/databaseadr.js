var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  data: {
    latitude: '',
    longitude: '',
    adrinfo: '',
    hideflag: false,
    buttonflag:true,
    value:'',
    autolist: [
      {id:1,name:'自动测试1',dis:'0.1km'},
      { id: 2, name: '自动测试2', dis: '0.2km'},
      ],
    searchlist: [
      { id: 3, name: '搜索测试1', dis: '0.1km' },
      { id: 4, name: '搜索测试2', dis: '0.15km' },
      ],
  },
  onLoad: function () {
    var that = this
    wx.getLocation({
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
      },
      //上传坐标值换回20个地名的列表

    })
  },
  searchstart: function (e) {
    this.setData({
      hideflag: true
    })
  },
  search:function(e){
    //清空之前的列表，上传该地址名称，返回的值建议头匹配

  },
  radioChangeAuto: function (e) {
    var that = this
    that.setData({
      adrinfo: e.detail.value,
      buttonflag: false
    })
  },
  radioChangeSearch: function (e) {
    var that = this
    that.setData({
      adrinfo: e.detail.value,
      buttonflag:false
    })
  },
  cancel:function(){
    this.setData({
      hideflag: false,
      userInput: ''
    })
  },
  confirmadr:function() {
    //加database的标识
    var adrinfo = this.data.adrinfo.split("|");
    wx.setStorageSync('source','database')
    wx.setStorageSync('adrname', adrinfo[1])
    wx.setStorageSync('adrid', adrinfo[0])
    wx.navigateBack({
      delta: 1
    })
  },
})