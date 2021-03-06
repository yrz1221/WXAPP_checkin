// pages/place/placehomepage.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    endtime: '',
    searchLoading: true, //"上拉加载"的变量，默认true，显示  
    searchLoadingComplete: false,  //“没有更多”的变量，默认false，隐藏
    list: [],
    adrname:'',
    adrid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(options)
    that.setData({
      adrid: options.adrid,
    })
    var starttime = new Date().getTime();

    qcloud.request({
      url: config.service.placeUrl,
      data: {
        adrid: options.adrid,
        starttime: starttime
      },
      login: true,
      header: { 'Content-Type': 'application/json' },
      success: function (res) {
        console.log(res.data)
        var index = res.data.length - 1;
        if (index == -1) {
          that.setData({
            searchLoading: false,
            searchLoadingComplete: true
          })
          return
        }
        var endtime = res.data[index].date;
        that.setData({
          endtime: endtime
        })

        var templist = res.data;
        var textid = [];
        for (var i = 0; i < res.data.length; i++) {
          var date = new Date(res.data[i].date);
          var Y = date.getFullYear() + '-';
          var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
          var D = date.getDate() + ' ';
          var h = date.getHours() + ':';
          var m = date.getMinutes() + ':';
          var s = date.getSeconds();
          var sendtime = Y + M + D + h + m + s;
          templist[i].sendtime = sendtime;
          textid.push(templist[i].rid);
        }
        that.setData({
          list: templist,
        })
        qcloud.request({
          url: config.service.likegroupUrl,
          data: {
            recordid: JSON.stringify(textid)
          },
          login: true,
          header: { 'Content-Type': 'application/json' },
          success: function (res) {
            console.log(res.data)
            for (var i = 0; i < templist.length; i++) {
              var likenumber = res.data[i].length;
              var liked = false;
              for (var j = 0; j < res.data[i].length; j++) {
                if (res.data[i][j].ori_id == getApp().globalData.userId) {
                  liked = true;
                  break;
                }
              }
              templist[i].liked = liked;
              templist[i].likenumber = likenumber;
            }
            that.setData({
              list: templist,
            })
          }
        })
      }
    })
  },
  fetchSearchList: function () {
    var that = this;
    var starttime = that.data.endtime;
    qcloud.request({
      url: config.service.placeUrl,
      data: {
        adrid: that.data.adrid,
        starttime: starttime
      },
      login: true,
      header: { 'Content-Type': 'application/json' },
      success: function (res) {
        console.log(res.data)
        var index = res.data.length - 1;
        if (index == -1) {
          that.setData({
            searchLoading: false,
            searchLoadingComplete: true
          })
          return
        }
        var endtime = res.data[index].date;
        that.setData({
          endtime: endtime
        })

        var templist = res.data;
        var textid = [];
        var orilength = that.data.list.length;
        for (var i = 0; i < res.data.length; i++) {
          var date = new Date(res.data[i].date);
          var Y = date.getFullYear() + '-';
          var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
          var D = date.getDate() + ' ';
          var h = date.getHours() + ':';
          var m = date.getMinutes() + ':';
          var s = date.getSeconds();
          var sendtime = Y + M + D + h + m + s;
          templist[i].sendtime = sendtime;
          textid.push(templist[i].rid);    
        }
        var searchList = that.data.list.concat(templist)
        qcloud.request({
          url: config.service.likegroupUrl,
          data: {
            recordid: JSON.stringify(textid)
          },
          login: true,
          header: { 'Content-Type': 'application/json' },
          success: function (res) {
            console.log(res.data)
            for (var i = 0; i < templist.length; i++) {
              var likenumber = res.data[i].length;
              var liked = false;
              for (var j = 0; j < res.data[i].length; j++) {
                if (res.data[i][j].ori_id == getApp().globalData.userId) {
                  liked = true;
                  break;
                }
              }
              searchList[i + orilength].liked = liked;
              searchList[i + orilength].likenumber = likenumber;
            }
            console.log(searchList+"searchList");
            that.setData({
              list: searchList,
            })
          }
        })
      }
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var imageList = [];
    imageList[0] = current;
    wx.previewImage({
      current: current,
      urls: imageList
    })
  },
  like: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    var textid = that.data.list[index].id;
    qcloud.request({
      url: config.service.likeUrl,
      data: {
        id: getApp().globalData.userId,
        textid: textid
      },
      login: true,
      header: { 'Content-Type': 'application/json' },
      //返回userID或者未注册过的标识
      success: function (res) {
        var listliked = "list[" + index + "].liked";
        var listlikenumber = "list[" + index + "].likenumber";
        var likenumber = that.data.list[index].likenumber + 1;
        that.setData({
          [listliked]: 'true',
          [listlikenumber]: likenumber
        })
      }
    })
  },
  backtoSwitch: function () {
    wx.switchTab({
      url: '../timeline/timeline',
    })
  },
  gotoHP: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    wx.navigateTo({
      url: '../personal/homepage?id=' + that.data.list[index].user_id + '&username=' + that.data.list[index].user_name
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    var starttime = new Date().getTime();

    qcloud.request({
      url: config.service.placeUrl,
      data: {
        adrid: that.data.adrid,
        starttime: starttime
      },
      login: true,
      header: { 'Content-Type': 'application/json' },
      success: function (res) {
        console.log(res.data)
        var index = res.data.length - 1;
        if (index == -1) {
          that.setData({
            searchLoading: false,
            searchLoadingComplete: true
          })
          return
        }
        var endtime = res.data[index].date;
        that.setData({
          endtime: endtime
        })

        var templist = res.data;
        var textid = [];
        for (var i = 0; i < res.data.length; i++) {
          var date = new Date(res.data[i].date);
          var Y = date.getFullYear() + '-';
          var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
          var D = date.getDate() + ' ';
          var h = date.getHours() + ':';
          var m = date.getMinutes() + ':';
          var s = date.getSeconds();
          var sendtime = Y + M + D + h + m + s;
          templist[i].sendtime = sendtime;
          textid.push(templist[i].rid);
        }
        that.setData({
          list: templist,
        })
        qcloud.request({
          url: config.service.likegroupUrl,
          data: {
            recordid: JSON.stringify(textid)
          },
          login: true,
          header: { 'Content-Type': 'application/json' },
          success: function (res) {
            console.log(res.data)
            for (var i = 0; i < templist.length; i++) {
              var likenumber = res.data[i].length;
              var liked = false;
              for (var j = 0; j < res.data[i].length; j++) {
                if (res.data[i][j].ori_id == getApp().globalData.userId) {
                  liked = true;
                  break;
                }
              }
              templist[i].liked = liked;
              templist[i].likenumber = likenumber;
            }
            that.setData({
              list: templist,
            })
          }
        })
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if (that.data.searchLoading && !that.data.searchLoadingComplete) {
      that.fetchSearchList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})