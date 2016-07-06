/*'use script'*/
/**
 * @author zhangyuliang
 * @date 2016-06
 * @brief 洪五爷珠宝
 **/
var config = {
    'api': 'http://app.hong5ye.com/api/backend/web/index.php',
    'page': {
        'confirm_order': 'myorder-placeorder.html',//订单确认页
        'select_address': 'address-select.html',
        'cart' : 'shoppingCart.html', //购物车
        'login': 'login.html', //登录页
        'home': 'index.html', //首页
        'address_edit': 'address-edit.html', //地址编辑页面
        'order_pay': 'myorder-paymode.html', //订单支付页面
        'order_detail': 'myorder-details.html',
        'user_king' : 'king.html',
        'user_supplier' : 'supplier.html',
        'collection': 'collection.html', //我的收藏
        'income_king' : 'myincome-king.html', //我的收入
        'income_supplier' : 'myincome-captain-mymember.html', //我的收入- 供应商
    },
    'navi_show_page':[
        'king.html', 'index.html', 'allproduct.html',
    ],
};
//错误码
var ErrorCode = {
    NO_LOGIN: 12, //没有登录
}
var Const = {
    GOODS_STATUS_ON_SELL: 1, //在售
    USER_ROLE_SUPPLIER : 4,
    USER_ROLE_SUPPLIER_LEADER : 5,
}

//消息盒子相关
var messageBox = {
    toast: function(msg) {
        alert(msg);
    }
    
};

String.prototype.replaceAll = function(s1,s2) { 
    return this.replace(new RegExp(s1,"gm"),s2); 
}

//分页
var Page = function(target){
    
    return {
        target: target,
        addClickEvent: function(clickFunc) {
            var me = this;
            $(me.target).delegate('a', 'click', clickFunc);
        },
        render: function(page, page_count) {
            var me = this;
            if ( page_count > 1) {
                //页面大于1，显示分页
                var page_info = "";
                var prefx = "";
                var tail    = "";
                if (page_count > 4) {
                    //大于4页
                    prefx = "<a href='javascript:;' data='1'>首</a>";
                    tail = "<a href='javascript:;' data='"+page_count+"'>尾</a>";

                }
                var start = page - 2 > 0 ?   page - 2 : 1;
                var end  = start + 4 > page_count ? page_count : start + 4;
                if (end == page_count) {
                    start = end - 4 > 0 ? end - 4 : start;
                }
                for (i = start; i<= end; i++) {
                        var item = "<a href='javascript:;' data='"+i+"'>"+i+"</a>";
                        if (i == page) {
                            item = "<a href='javascript:;' class='number'>"+i+"</a>";
                        }
                        page_info += item;
                }
                $(me.target).html(prefx + page_info + tail);
            } else {
                $(me.target).html('');
            }
        }
        
        
    };
};


var Template = {
    id: 0,
    template: '',
    renderById: function(id, data) {
        this.id = id;
        this.template = $('#'+id).html();
        var html = this.template;
        for (i in data) {
            html = html.replace("{$"+i+"}", data[i]);
        }
        return html;
    },
    renderByTempate: function(template, data) {
        var html = template;
        for (i in data) {
            html = html.replaceAll("\{\\$"+i+"\}", data[i]);
        }
        return html;
    }
    

};
//公共工具
var Util = {
    //防止注入，将字符串转义
    escape: function(s) {
        var regx_html_encode = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
        return (typeof s != "string") ? s :
          s.replace(regx_html_encode,
                    function($0){
                        var c = $0.charCodeAt(0), r = ["&#"];
                        c = (c == 0x20) ? 0xA0 : c;
                        r.push(c); r.push(";");
                        return r.join("");
                    });
    }
    //获取请求参数
    ,getQueryString: function(name) {
        var url = window.location.search;
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
          var str = url.substr(1);
          strs = str.split("&");
          for(var i = 0; i < strs.length; i ++) {
             theRequest[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
          }
       }
       if (name in theRequest) {
           return decodeURI(theRequest[name]);
       }
       return ''; 
    }
    //跳转登录
    ,goLogin: function(redistrict) {
        var callback = redistrict ? redistrict : config.page.home; 
        window.location.href = config.page.login + "?redirect=" + callback;
        
    }
    //同步请求
    ,syncRequest: function(api, data, callback, method) {
        var me = this;
        me.showLoading();
        var beforeCallback = function(data) {
              me.hideLoading();
             if (data.errno  == ErrorCode.NO_LOGIN) {
                 //没有登录，直接去登录
                 //messageBox.toast("请先登录");
                 var url = location.href;
                 me.goLogin(url);
                 return ;
             }
            return callback(data);
        }
        if (!method) {
            method = 'get';
        }
        var url = config.api + api;
        $.ajax({
            url: url,
            type: method,
            async: false,
            dataType: 'json',
            data: data,
            success: beforeCallback,
            error: function() {
                me.hideLoading();
                messageBox.toast("服务器出错啦");
            }
        });
    }
    //请求接口
    ,requestApi: function(api, data, callback, type) {
        
        var me = this;
        me.showLoading();
        var beforeCallback = function(data) {
              me.hideLoading();
             if (data.errno  == ErrorCode.NO_LOGIN) {
                 //没有登录，直接去登录
                 //messageBox.toast("请先登录");
                 var url = location.href;
                 me.goLogin(url);
                 return ;
             }
            return callback(data);
        }
        var url = config.api + api;
        var dataType = 'jsonp';
        var method = 'get';
        if (type == 'post') {
            dataType = 'json';
            method = 'post';
        }
        $.ajax({
            url: url,
            type: method,
            dataType: dataType,
            data: data,
            success: beforeCallback,
            error: function() {
                me.hideLoading();
                messageBox.toast("服务器出错啦");
            }
        });
    }
    //是否在微信浏览器
    ,isWeiXin: function (){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                return true;
            }else{
                return false;
            }
    }
    ,goGoodsDetail: function(id) {
        window.location.href = "details.html?id=" + id ;
    }
    ,getHash: function() {
        return location.hash.replace('#', '');  
    }
    ,setHash: function(str) {
        location.hash = str;
    }
    //公众号内登录
    ,goWxLogin: function(redirect) {
        var url = config.api + "?r=user/loginwx";
        if (redirect) {
            url += "&redirect=" + redirect;
        }
        window.location.href = url;
    }
    //微信扫码登录
    ,goWxQrLogin: function(redirect) {
        
    }
    ,showTips: function(target, tips) {
        var div = "<div style='text-align:center;padding-top:100px;'>"+tips+"</div>";
        target.html(div);
    }
    ,isCorrectMobile: function(mobile) {
        var reg = /^0?(13[0-9]|15[012356789]|17[0678]|18[0-9]|14[57])[0-9]{8}$/;
        return reg.test(mobile);
    }
    ,loadingId: 0
    ,showLoading: function(){
         var html = '<div  id="loading_box"><div style="position: fixed;top: 0;width: 100%;height: 100%;background: #ECE6E6;opacity: 0.2;z-index: 10;"></div>'
                      + '<div style="position: fixed;top: 50%;left: 50%;margin-left: -54px;margin-top: -54px;width: 108px;height: 108px;z-index: 13;border-radius: 4px;text-align: center;line-height: 108px;background: #565353;">'
                      + '<img src="img/loading.gif" style="width: 56px;"></div></div>';
        if (this.loadingId == 0) {
            //延迟150ms出现
            this.loadingId = setTimeout(function(){$('body').append(html);}, 150);
        }
            
    }
    ,hideLoading: function() {
        clearTimeout(this.loadingId);
        $("#loading_box").remove();
    }
    //获取微信版本号
    ,getWxVer: function() {
        var ua = window.navigator.userAgent.toLowerCase();
        var preg = /MicroMessenger\/([0-9\.]+)/i;
        var a = ua.match(preg);
        if (a) {
            return a[1];
        }
        return false;
    }
    ,canWeixinPay: function() {
        //var isWeixin =  this.isWeiXin();
        var ver = this.getWxVer();
        if (ver == false) {
            return false;
        }
        var vers = ver.split('.');
        console.log(vers);
        if (parseInt[vers[0]] < 5) {
            return false;
        }
        return true;
    }
    ,goPage: function(page) {
        window.location.href = page;
        return;
    }
};
//存储相关
var Storge = {
    removeItem: function(e) {
        return localStorage.removeItem(e);
    }
    ,getItem: function(e, d) {
        var r = localStorage.getItem(e);
        if (d != undefined && r == undefined) {
            return d;
        }
        return r;
    }
    ,setItem: function(k, e) {
        return localStorage.setItem(k, e);
    }
    
};  

//功能导航
var FuncNavi = {
    data: {},
    funcs: [], //回调函数列表
    html: function(data) {
        var html = '<div class="u-bottomnav">'
                     + '<a href="index.html">'
                     + '<img src="img/hw_72.png">'
                     + '<p>首页</p>'
                     + '{$idx_num}</a>'
                     + '<a href="allproduct.html">'
                     + '<img src="img/hw_74.png">'
                     + '<p>所有产品</p>'
                     + '{$prod_num}</a>'
                     + '<a href="javascript:;">'
                     + '<img src="img/hw_76.png">'
                     + '<p>发现</p>'
                     + '{$find_num}</a>'
                     + '<a id="navi_goods_cart" href="{$cart_action}">'
                     + '<img src="img/hw_78.png">'
                     + '<p>购物车</p>'
                     + '{$cart_num}</a>'
                     + '<a id="navi_ucenter" href="{$ucenter_action}">'
                     + '<img src="img/hw_80.png">'
                     + '<p>个人中心</p>'
                     + '{$uc_num}</a></div>';
         //shoppingCart.html , king.html
        var clickNone = 'javascript:;';
        var conf = {
            idx_num: '',
            prod_num: '',
            find_num: '',
            cart_num: '',
            uc_num: '',
        };
        var htmlStr = html;
        
        
        for (i in conf) {
            var vn = conf[i];
            if (data && data[i]) {
                vn = data[i];
            }
            if (vn) {
                htmlStr = htmlStr.replace("{$"+i+"}", "<span>"+vn+"</span>");
            } else {
                htmlStr = htmlStr.replace("{$"+i+"}", '');
            }
            
        }
        if (data && data.is_login) {
            //已登陆
            //to-do 不同角色，不同页面
            
            var ucenter_page = "king.html?" + Math.random();
            if (data.user.role >= Const.USER_ROLE_SUPPLIER) {
                ucenter_page = "supplier.html?"+ Math.random();
            }
            htmlStr = htmlStr.replace('{$cart_action}', 'shoppingCart.html')
                                     .replace('{$ucenter_action}', ucenter_page);
                                 
        } else if (data && data.is_login == 0){
            htmlStr = htmlStr.replace('{$cart_action}', 'login.html?redirect=' + config.page.cart)
                                     .replace('{$ucenter_action}', 'login.html?redirect=' + config.page.user_king);
        } else {
            //初始化，不允许点击
             htmlStr = htmlStr.replace('{$cart_action}', clickNone)
                                      .replace('{$ucenter_action}', clickNone);
        }
        
        return htmlStr;
    }
    ,rendNavi: function(data) {
         var me = this;
         var html = me.html(data);
         $('.u-bottomnav').remove();
         $('body').append(html);
    }
    //加载提醒数据
    ,loadNaviData: function() {
          var api = config.api + "?r=center/navi";
          var me = this;
          if ( true) {
              $.ajax({
                  url: api,
                  dataType : "jsonp",
                  success: function(data) {
                       if (data.errno ==0) {
                           me.data = data.data;
                           data.data  && me.rendNavi(data.data);
                       }
                       
                       for (i in me.funcs) {
                           me.funcs[i].func(me.data, me.funcs[i].proxy);
                       }
                  }
                  
            });
          }
          
    }
    ,addCallback: function (func, proxy) {
        var me = this;
        if (typeof func == 'function') {
            me.funcs.push({
                'proxy': proxy,
                'func'  : func
            });
        }
    }
    ,run: function() {
        //this.rendNavi();
        $('.u-bottomnav').remove();
        this.loadNaviData();
    }
};

//搜索工具
var SearchBox = {
    cacheKey: 'ecs_search'
    ,cacheKeep: 10 //缓存保留记录数
    ,addKeyWord: function(words) {
        var list = this.getCaches();
        var length = 1;
        var idx = this.isKeywordExists(words, list);
        if (idx) {
            //已经存在，暂不处理
            length = list.length;
        } else {
            length = list.unshift(words);
        }
        if (length > this.cacheKeep) {
            list.pop();
        }
        Storge.setItem(this.cacheKey, list.join('|'));
    }
    
    ,isKeywordExists: function(needle, arr) {
        for (i in arr) {
            if (arr[i] == needle) {
                return i;
            }
        }
        return false;
    }
    ,clearCache: function() {
        Storge.removeItem(this.cacheKey);
    }
    ,getCaches: function() {
        var list = Storge.getItem(this.cacheKey);
        if (list) {
            return list.split('|');
        } else {
            return [];
        }
    }
    //渲染搜索列表
    ,renderHistory: function() {
        var me = this;
        var list = me.getCaches();
        var html = "";
        for(i in list) {
            item = decodeURI(list[i]);
            html += "<li>"+Util.escape(item)+"</li>";
        }
        $('#js-searchHistory-li').html(html);
    }
    //在搜索框显示
    ,showinbox: function(word) {
        $('#js-search').val(word);
    }
    //绑定搜索事件
    ,bindSearchBntEvent: function() {
        var me = this;
        
        $('#js-titleSubmit').click(function(){
            var keyword = $.trim($('#js-search').val());
            if (keyword) {
                keyword = encodeURI(keyword);
                me.addKeyWord(keyword);
                //me.renderHistory();
                window.location.href = "allproduct.html?k="+keyword;
            }
        });
    
        //删除历史记录
        $('.u-button-storkmain').click(function(){
            me.clearCache();
            me.renderHistory();
        });
        
        $('#js-search').keydown(function(e){
            if (event.keyCode == "13") {
                //回车
                $('#js-titleSubmit').trigger('click');
            }
        });
    }
    ,run: function() {
        this.bindSearchBntEvent();
        this.renderHistory();
    }
};

//购物车相关操作
var goodsCart = {
    
    
    add: function(goodsId) {
        var api = config.api + "?r=cart/add";
            $.ajax({
                url: api,
                dataType : "jsonp",
                data: {goods_id: goodsId, num:1},
                success: function(data) {
                    messageBox.toast(data.errmsg);
                }
            });
    }
    //购物车操作
    ,bindAddEvent: function() {
        var me = this;
        $('#add').click(function(){
            var goodsId = $(this).attr('data-id');
            me.add(goodsId);
        });
        
    }
    
    //绑定购物车列表页事件
    ,bindCartListEvent: function() {
        
        //购物车勾选事件
        $('.u-shoppingCartlist').delegate('.u-checkbox', 'change', function() { 
             //购物车勾选变化
             //遍历所有checkbox
             var goodCnt = 0;
             var goodPrice = 0;
             //计算勾选的货品数量，价格总额
             $(".u-shoppingCartlist input[type=checkbox]:checked").each(function(i){
                  var dataInfo = $(this).attr('data-info').split('|');
                  var num = parseInt(dataInfo[2]);
                  var price = parseFloat(dataInfo[1]).toFixed(2);
                  goodCnt++;
                  goodPrice += price * num;
             });
             if (goodCnt) {
                $('#cart_num').html("("+goodCnt+")"); //
                $('#settlement').html("("+goodCnt+")");  //结算
                $('#money').html(goodPrice); 
             } else {
                $('#cart_num').html('');
                $('#money').html(0);
                $('#settlement').html("(0)"); 
             }

        }); 
        
        //全选事件
        $(".u-pay input[type=checkbox]").change(function(){
             if ($(this).attr('checked') ) {
                $('.u-shoppingCartlist input[type=checkbox]').prop('checked', true).trigger('change');
              
                 
             } else {
                //取消全选
                $('.u-shoppingCartlist input[type=checkbox]').prop('checked', false).trigger('change');
             
                 
             }
        });
        
        //结算
        $('.u-pay .paynow').click(function() {
            var goodsIds = $(".u-shoppingCartlist input[type=checkbox]:checked").map(function(){
                var info = $(this).attr('data-info').split('|');
                return info[0];   
            }).get().join(',');
            if (goodsIds) {
                //跳转到订单提交页面
                window.location.href = config.page.confirm_order + "?goods_ids=" + goodsIds;
            } else {
                messageBox.toast("请选择商品");
            }
            
        });
    }
    //渲染购物车列表
    ,renderCartList: function(data) {
        var template = $('#cart_template').html();
        var html = "";
        for (i in data.list) {
            var item = data.list[i];
            var datainfo = item.goods_id+"|"+item.goods_price+"|"+item.goods_num;
            html += template.replace('{$title}', item.goods_name)
                            .replace('{$money}', item.goods_price)
                            .replace('{$img}', item.goods_img)
                            .replace('{$number}', item.goods_num)
                            .replace('{$data}', datainfo);
        }
        if (html) {
            $('.u-shoppingCartlist').html(html);
        } else {
            $('.u-shoppingCartlist .empty').show();
        }
       
    }
    ,loadmyGoodsCart: function() {
        //加载我的购物车
        var me = this;
        var api = config.api + "?r=cart/get";
            $.ajax({
                url: api,
                dataType : "jsonp",
                success: function(data) {
                    if (data.errno == 0) {
                        data.data && me.renderCartList(data.data);
                    } else {
                        messageBox.toast(data.errmsg);
                    }
                }
            });
    }
    //进入购物车
    ,runGoodsCart: function() {
        this.loadmyGoodsCart();
        this.bindCartListEvent();
    }
    
};

//首页&&商品详情&&搜索
var Bootstrap = {
    data: []
    ,toast: function(msg) {
        messageBox.toast(msg);
    }
    ,searchQuery: {p:1,hasMore:1}
    //渲染首页按分类的商品列表
    ,renderHomeCategoryPage: function(data) {
        for (i in data) {
            //
            var item = data[i];
            var show = $('.u-box-left33-right66').eq(i);
            show.find('.content img').map(function(idx,ix){
                $(ix).attr('src',item['goods'][idx].img)
                     .attr('data-role', 'good')
                     .attr('good-id',item['goods'][idx].id);
            });
            var box = $('.u-threerowsbox').eq(i);
            box.find('.content img').map(function(idx,ix){
                idx += 3;
                $(ix).attr('src',item['goods'][idx].img)
                     .attr('data-role', 'good')
                     .attr('good-id',item['goods'][idx].id);
            });
        }
    }
    //渲染商品详情
    ,renderGoodsDetail: function(data) {
        console.log(data);
        $(".details-infobox .cont").html(data.detail);
        var attrHtml = "";
        var attrItemTemplate = "<p>{$key}: {$value}</p>";
        //轮播图模版
        var slideTemplate = '<div class="slide-list"><img src="{$src}" alt=""></div>';
        for (i in data.attr) {
            var item = data.attr[i];
            if (item.value != '') {
                attrHtml += attrItemTemplate.replace('{$key}', item.key)
                            .replace('{$value}', item.value);
            }
        }
        var slideHtml = '';
        for (i in data.pics) {
            var item = data.pics[i];
            slideHtml += slideTemplate.replace('{$src}', item);
        }
        $(".productinfo-head .title").html(data.title); 
        $(".productinfo-head .shop_price").html(data.price); 
        $(".productinfo-head .view").html(data.view_cnt); 
        $(".productinfo-head .likes").html(data.likes_cnt); 
        $(".productinfo-list .cont").html(attrHtml);
        $(".details-slide .slides").html(slideHtml);
        $("#add,#buy,#detail_collect,#detail_likes_up").attr('data-id', data.id);
        $("#detail_collect").attr('data-collected', data.is_collected);
        var swiper = new hlSwiper("#hl-swiper", {
            loop: true, //是否循环
            autoloop: true, //是否自动循环
            speed: 3000 //间隔时间毫秒
        });
    }
    //渲染搜索/所有产品页面
    ,renderSearch: function(data, append) {
        //console.log(data);
        var me = this;
        me.hasMore = data.hasMore;
        var template = $('#search-list-item').html();
        var html = '';
        for (i in data.list) {
            var item = data.list[i];
            html += template.replace('{$id}', item.id)
                    .replace('{$title}', item.title)
                    .replace('{$fav_cnt}', item.fav_cnt)
                    .replace('{$price}', item.price)
                    .replace('{$img}', item.img);
        }
        if (append == false) {
            if (html){
                $('.u-productlist').html(html);
            } else {
                $('.u-productlist').html($("#search-empty").html());
            }
        } else {
           $('.u-productlist').append(html);
        }
        
    }
    ,bindEvent: function(){
        //查看商品详情
        $('.content img').click(function(e){
            var goodId = $(this).attr('good-id');
            if (goodId) {
                window.location.href = "details.html?id="+goodId;
            }
        });
    }
    ,loadHomeCategoryGoods: function() {
        var api = config.api + '?r=good/index';
        var me = this;
        $.ajax({
            url : api,
            dataType : "jsonp",
            success: function(data) {
                if (data.errno == 0) {
                    data.category_goods && me.renderHomeCategoryPage(data.category_goods);
                } else {
                    me.toast(data.errmsg);
                }
            }
        });
    }
    ,loadGoodsDetail: function(goodsId) {
        var api = config.api + '?r=good/detail';
        var me = this;
        $.ajax({
            url: api,
            data: {id:goodsId},
            dataType: 'jsonp',
            success: function(data) {
                if (data.errno == 0) {
                    data.data && me.renderGoodsDetail(data.data);
                } else if (data.errno = 404) {
                    me.toast("商品不存在货已经下架");
                }
            }
        });
    }
    //搜索
    ,loadSearch: function(query, append) {
        var api = config.api + '?r=good/search';
        var me = this;
        Util.showLoading();
        $.ajax({
            url: api,
            data: query,
            dataType: 'jsonp',
            success: function(data) {
                Util.hideLoading();
                if (data.errno == 0) {
                    data.data && me.renderSearch(data.data,append);
                }
            }
        });
    
    }
    //检查滚动条是否到底部了
    ,checkWindowAtButtom: function() {
        return $(window).scrollTop() >= $(document).height()-$(window).height();
    }
    //处理搜索列表下拉
    ,handleSearchPull: function() {
        var me = Bootstrap;
        if (me.checkWindowAtButtom()) {
            if (me.searchQuery.hasMore) {
                me.searchQuery.p += 1;
                me.loadSearch(me.searchQuery);
            }
            
        }
    }
    //渲染搜索分类
    ,reanderCategoriesArea: function(data) {
        //部位
        if (data[2]) {
            var html = '';
            list = data[2].list;
            for (i in list) {
                var item = list[i];
                html += "<option value="+item.name+" data_id= "+item.id+">"+item.name+"</option>";
            }
            $("div[data-role=buwei] select").append(html);
        }
        //材质
        if (data[1]) {
            var html = '';
            list = data[1].list;
            for (i in list) {
                var item = list[i];
                html += "<option value="+item.name+" data_id= "+item.id+">"+item.name+"</option>";
            }
            $("div[data-role=caizhi] select").append(html);
        }
        //筛选
        if (data[3]) {
            var list = data[3].list;
            for (i in list) {
                item = list[i];
                var html = "<div><span class=\"name\">"+ item.name +"</span></div><div class=\"priceboxes\">";
                for (j in item.children) {
                    var cat = item.children[j];
                    html += "<a javascript:;  data-name='"
                         + cat.name+"' data-id='"+cat.id+"' >"
                         + cat.name+"</a>";
                }
                html += "</div>";
                $(html).insertBefore('#js-shaixuan-bnt');
            }
            
        }
    }
    //加载搜索的分类
    ,loadSearchCategories: function() {
        var api = config.api + '?r=good/getcategories';
        var me = this;
        $.ajax({
            url: api,
            dataType: 'jsonp',
            success: function(data) {
                if (data.errno == 0) {
                    data.data && me.reanderCategoriesArea(data.data);
                }
            }
        });
    }
    //产品搜索，监听滚动条事件
    ,bindSearchScroll: function() {
        var me = this;
        $(window).scroll(me.handleSearchPull);
    }
    //搜索变化事件
    ,triggerSearchChange: function() {
        var me = this;
        var cids = [];
        $('#js-chooseclass .cont').each(function(i,e){
            cids.push($(e).attr('data_cat_id'));
        });
        me.searchQuery['cids'] = cids.join(',');
        me.searchQuery.p = 1; //重置页码
        me.loadSearch(me.searchQuery, false);
    }
    ,bindSearchEvent: function() {
    
        var me = this;
        $('#js-navSelect select').change(function() {
            //获取查询条件
            me.triggerSearchChange();
        });
    }
    //绑定详情页事件
    ,bindDetailEvent: function() {
        var me = this;
        //detail_collect
        //收藏
        $('#detail_collect').click(function(){
            var goodsId = $(this).attr('data-id');
            if (!goodsId) return;
            if ($(this).attr('data-collected') == '1') {
                //移除
                var api = config.api + "?r=collect/remove";
                $.ajax({url: api,dataType:'jsonp',
                    data: {goods_ids: goodsId},
                    success:function(data){
                        //成功
                        messageBox.toast(data.errmsg);
                        $(this).attr('data-collected', 0);
                }});
            } else {
                //可以收藏
                var api = config.api + "?r=collect/add";
                $.ajax({url: api,dataType:'jsonp',
                    data: {goods_id: goodsId},
                    success:function(data){
                        //成功
                        messageBox.toast(data.errmsg);
                        $(this).attr('data-collected', 1);
                }});
            }
        });
        //detail_likes_up
        //点赞
        $('#detail_likes_up').click(function(){
            var goodsId = $(this).attr('data-id');
            if (!goodsId) {
                return ;
            }
            var key = 'gl_' + goodsId;
            var likeCnt = parseInt(Storge.getItem(key, 0));
            if (isNaN(likeCnt)) {
                likeCnt = 0;
            }
            if (likeCnt >= 15) {
                messageBox.toast("只能点赞15次");
                return ;
            }
            var api = config.api + "?r=good/likes";
            $.ajax({
                url: api,
                dataType: 'jsonp',
                data: {goods_id: goodsId},
                success: function(data) {
                    messageBox.toast(data.errmsg);
                    if (data.errno == 0) {
                        Storge.setItem(key, (likeCnt + 1) + '');
                        //详情点赞数 + 1
                        var oldCnt = parseInt($('.rightbox .likes').html());
                        $('.rightbox .likes').html(oldCnt + 1);
                    }
                }
            });
            
        });
        
        
    }
    
    //首页入口
    ,runHome: function() {
       this.loadHomeCategoryGoods();
       this.bindEvent();
       
    }
    //商品详情页入口
    ,rungoodsdetail: function() {
        var goodsId = Util.getQueryString('id');
        this.loadGoodsDetail(goodsId);
        this.bindDetailEvent();
    }
    //搜索/所有产品入口
    ,runsearch: function() {
        this.bindSearchScroll();
        this.bindSearchEvent();
        var k = Util.getQueryString('k');
        if (k) {
            $('title').html("搜索-"+Util.escape(k));
        }        
        this.loadSearchCategories();
        this.searchQuery.k = k;
        this.loadSearch(this.searchQuery, false);
    }
};

//订单相关处理
var Order = {
    order_info : {}
    ,order_types : {
        'all':0,
        'wait_pay': 100,
        'wait_ship': 101,
        'wait_receive': 103,
        'wait_comment':104,
    }
    ,bindConfirmEvent: function() {
        var me = this;
        var lock = false;
        $('.u-mainbutton-little').click(function(){
            if (lock) {
                  return ; //屏蔽重复点击操作
            }
            if (me.order_info.order_sn) {
                me.gotoPay(me.order_info.order_sn);
                return;
            }
            //确认按钮点击事件
            var addressId = $('.placeorder-address').attr('data-address');
            if (!addressId) {
                messageBox.toast("请选择收货地址");
                return ;
            }
            var goodsIds = $('.u-productlist02').map(function(){
                return $(this).attr('data-id');
            }).get().join(',');
            if (!goodsIds) {
                messageBox.toast("商品列表为空");
                return ;
            }
            //是否选择运费险
            var express_insure  = $('.placeorder-infobox input[type=checkbox]').attr('checked') ? 1 : 0;
            
            var remarks = $('#remarks').html(); //备注信息
            //调用下单接口，获取订单号，成功的话跳转到支付页面
            var api = "?r=order/submit";
            var request = {
                'goods_ids' : goodsIds,
                'remarks': remarks,
                'address_id': addressId,
                'express_insure': express_insure,
            };
            lock = true;
            //请求下单接口，获得订单
            Util.requestApi(api, request, function(data){
                    lock = false;
                    if (data.errno != 0) {
                          messageBox.toast(data.errmsg);
                    } else {
                        me.order_info.order_sn = data.data.order_sn;
                        me.gotoPay(me.order_info.order_sn);
                    }
                
            });
            
            
        });
        
        $('.placeorder-infobox input[type=checkbox]').click(function(){
            var checked = $(this).attr('checked') ? 1 : 0;
            var goods_cost =  me.order_info.goods_cost;
            var need_Pay = goods_cost;
            if (checked) {
                need_Pay += 2; //2块钱运费险
            }
            $('#confirm_price_bottom, #confirm_price').html("￥ " + need_Pay);
        });
    }
    
    //跳转去支付
    ,gotoPay: function(order_sn) {
        window.location.href = config.page.order_pay + "?order=" + order_sn ;
    }
    ,gotoDetail: function(order_sn) {
        window.location.href = config.page.order_detail + "?order=" + order_sn ;
    }
    ,renderConfirmPage: function(data) {
        var tempate = $('#confirm_goods_template').html();
        var html = "";
        for(i in data.list) {
            var item = data.list[i];
            /**
            html += tempate.replace('{$goods_name}', item.goods_name)
                           .replace('{$goods_img}', item.goods_img)
                           .replace('{$goods_id}', item.goods_id)
                           .replace('{$goods_price}', item.goods_price)
                           .replace('{$goods_num}', item.goods_num)
                           .replace('{$goods_sn}', item.goods_sn);
            */
            html += Template.renderByTempate(tempate, item);
        }
        $(html).insertAfter('.placeorder-address');
        $('#order_confirm_num').html(data.goods_count);
        $('#confirm_price_bottom, #confirm_price').html("￥ " + data.goods_cost);
        
        //渲染地址
        if (data.address) {
            var address = data.address.province + data.address.city + data.address.district + data.address.address;
            $('#selected_consignee').html(data.address.consignee);
            $('#selected_mobile').html(data.address.mobile);
            $('#selected_address').html(address);
            $('#selected_consignee_box').show();
            $('.placeorder-address').attr('data-address', data.address.address_id);
        }
    }
    ,loadOrderInfo: function() {
        //加载订单确认信息
        var goodsIds = Util.getQueryString('goods_ids');
        var api = config.api + "?r=order/getorderinfo";
        var me = this;
        $.ajax({
            url: api,
            dataType: 'jsonp',
            data: {goods_ids:goodsIds},
            success: function(data) {
               if (data.errno == 0) {
                   me.order_info = data.data;
                   data.data && me.renderConfirmPage(data.data);
               } else {
                    messageBox.toast(data.errmsg);
                    if (data.errno == ErrorCode.NO_LOGIN) {
                        //跳转登录
                        Util.goLogin();
                    } else {
                        history.go(-1);
                    }
               }
            }
        });
    }
    //订单确认
    ,runConfirm: function() {
        this.loadOrderInfo();
        this.bindConfirmEvent();
    }
    
    //订单主页面事件绑定
    ,bindMainEvent: function() {
        var me = this;
        
        $('#js-changecont').delegate('div', 'click', function() {
                var order_type = $(this).attr('data-type');
                //Util.setHash(order_type);
                me.loadOrder(order_type);
        });
        $('#js-contbox01').delegate('.u-productlist02', 'click', function(){
              var order_sn = $(this).attr('order-sn');
              if (order_sn) {
                  window.location.href = config.page.order_detail + "?order=" + order_sn;
              }
        });
        $('body').delegate('button', 'click', function(){
            
            var order_sn = $(this).parent().attr('order-sn'); 
            var type = $(this).attr('data-type');
            if (!order_sn) {
                
                return ;
            }
            if (type == 'pay') {
                //去支付
                window.location.href = config.page.order_pay + "?order=" + order_sn;
            }
            if (type == 'cancel') {
                //取消订单
                Util.requestApi('?r=order/cancel', {order:order_sn}, function(data){
                        messageBox.toast(data.errmsg);
                        if (data.errno == 0) {
                            //重新加载列表
                            var type = $('#js-changecont .on').attr('data-type');
                            me.loadOrder(type);
                        }
                    
                });
            }
        });
        
    }
    //获取支付相关按钮
    ,renderPayBntsAndTips: function(goods) {
            var normalBntTemplate = $('#order_list_button').html();
            var mainBntTemplate = $('#order_list_button_main').html();
            var Buttons = "";
            var tips = "";
            if (goods.order_status == 100) {
                //待支付
                tips = "待付款";
                Buttons += normalBntTemplate.replace('{$type}', 'cancel').replace('{$tips}', '取消订单');
                Buttons += mainBntTemplate.replace('{$type}', 'pay').replace('{$tips}', '立即付款');
            }
            if (goods.order_status == 101) {
                //待发货
                tips = "待发货";
                Buttons += mainBntTemplate.replace('{$type}', 'remind').replace('{$tips}', '提醒发货');
            }
            if (goods.order_status == 103) {
                //待收货
                tips = "待收货";
                Buttons += mainBntTemplate.replace('{$type}', 'receive').replace('{$tips}', '确认收货');
            }
            if (goods.order_status == 104) {
                //待评价
                tips = "待评价";
                Buttons += mainBntTemplate.replace('{$type}', 'comment').replace('{$tips}', '立即评价');
            }
            if (goods.order_status == 102) {
                tips = "已完成";
                //已完成，已评价
                Buttons += mainBntTemplate.replace('{$type}', 'done').replace('{$tips}', '已完成');
            }
            if (goods.order_status == 105) {
                tips = "已取消";
            }
            
            return {'bnt': Buttons, 'tips': tips};
    }
    ,getOrderTips: function (order_info) {
        var tips = {
            100: {
                t: "等待买家付款",
                st: "48小时内未付款自动取消订单",
            },
            101: {
                t: "等待商家发货",
                st: "成功付款后48小时内发货",
            },
            102: {
                t: "交易已完成",
                st: "感谢您惠顾",
            },
            103: {
                t: "商品已发出",
                st: "",
            },
            104: {
                t: "交易完成",
                st: "感谢您惠顾",
            },
            104: {
                t: "交易已取消",
                st: "感谢您惠顾",
            }
        };
        if (order_info.order_status in tips) {
                return tips[order_info.order_status];
        }
        return tips[104];
    } 
    ,renderList: function(data) {
        
        var me = this;
        if (data.errno == ErrorCode.NO_LOGIN) {
             Util.goLogin("myorder-allorders.html");
             return;
        }
        if (data.errno != 0) {
            messageBox.toast(data.errmsg);
        }
        if (data.data.list.length == 0) {
            //列表为空
            var html = $('#order_list_empty').html();
            $('#js-contbox01').html(html);
            return;
        }
        var html = "";
        var templte = $('#order_list_item').html();
        var normalBntTemplate = $('#order_list_button').html();
        var mainBntTemplate = $('#order_list_button_main').html();
        var tips  = "";
        for (i in data.data.list) {
            var Buttons = "";
            var goods = data.data.list[i];
            goods.goods_cost = parseInt(goods.goods_price) * goods.goods_number;
            goods.goods_count = goods.goods_number;
            var BntAndTips = Order.renderPayBntsAndTips(goods);
            goods.buttons = BntAndTips.bnt;
            goods.order_tips = BntAndTips.tips;
            var list_item = Template.renderByTempate(templte, goods);
            html += list_item;
            
        }
        $('#js-contbox01').html(html);
    }
    ,showLoading: function() {
        var html = $('#order_tips').html().replace('{$tips}', "加载中 ...");
        $('#js-contbox01').html(html);
    }
    ,loadOrder: function(type) {
        
        if (type) {
            $('#js-changecont div').removeClass('on');
            $('#js-changecont div[data-type= ' +type + ']' ).addClass('on');
        }
        this.showLoading();
        Util.requestApi('?r=order/get',{type:type},this.renderList);
    }
    //订单管理页面
    ,runMain: function() {
        var type = Util.getHash();
        if ( !this.order_types[type]) {
            type = 'all';
        }
        this.bindMainEvent();
        this.loadOrder(type);
        
    }
    ,renderDetail: function(data) {
        if (data.errno != 0) {
            var html = $('#order_empty_template').html().replace('{$tips}', data.errmsg);
            $(html).insertAfter('.u-top-msg');
            return;
        }
        var template = $('#order_detail_template').html();
        var goods_item_template = $('#order_goods_template').html();
        var goodsList = data.data.goods_list;
        delete data.data.goods_list;
        var goods_list_html = '';
        for (i in goodsList) {
            goods_list_html += Template.renderByTempate(goods_item_template, goodsList[i]);
        }
        //获取订单不同状态的操作按钮
        var BntAndTips = Order.renderPayBntsAndTips(data.data);
        data.data.buttons = BntAndTips.bnt;
        var Tips = Order.getOrderTips(data.data);
        data.data.tips = Tips.t;
        data.data.sub_tips = Tips.st;
        data.data.goods_list_html = goods_list_html;
        var html = Template.renderByTempate(template, data.data);
        $(html).insertAfter('.u-top-msg');
    }
    //订单详情
    ,runDetail: function() {
        var order_sn = Util.getQueryString('order');
        Util.requestApi('?r=order/detail',{order_sn:order_sn},this.renderDetail);
        this.bindMainEvent();
    }
    
    //支付选择页面
    //请求微信支付的参数
    ,getWxPayParams: function(orderSn) {
        var api = config.api + "?r=order/weixinpayid";
        var ret = {};
        $.ajax({
            url: api,
            data: {order: orderSn},
            dataType: 'json',
            async: false,
            success: function(data) {
                ret = data;
            }
            
        });
        return ret;
    }
    //微信公众号支付
    ,weixinPay: function(orderSn) {
        var me = Order;
        if (!me.wxParams) {
             
        }
        me.wxParams = me.getWxPayParams(orderSn);
        if (me.wxParams.errno != 0) {
            messageBox.toast(me.wxParams.errmsg);
            return;
         }
         function onBridgeReady(){
           WeixinJSBridge.invoke(
               'getBrandWCPayRequest', me.wxParams.data,
               function(res){     
                    console.log(res);
                    if (res.err_code) {
                        //有错误码，则表示支付失败
                         messageBox.toast("支付失败");
                    } else if (res.err_msg == 'get_brand_wcpay_request:cancel'){
                        //支付成功，进入订单详情页面
                        messageBox.toast("已取消支付");
                        me.gotoDetail(orderSn);
                    } else if (res.err_msg == 'get_brand_wcpay_request:ok') {
                        me.gotoDetail("支付成功");
                    }
                    
               }
           ); 
        }
        if (typeof WeixinJSBridge == "undefined"){
           if( document.addEventListener ){
               document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
           }else if (document.attachEvent){
               document.attachEvent('WeixinJSBridgeReady', onBridgeReady); 
               document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
           }
        }else{
           onBridgeReady();
        }
    }
    ,bindPaymentEvent: function(orderSn){
        //u-arrow-list
        var me = this;
        
        $('.u-arrow-list').delegate('.list', 'click', function(){
             var payType = $(this).attr('pay-type');
             
             if (payType == 'weixin') {
                 //微信支付
                 if (!Util.canWeixinPay()) {
                     messageBox.toast("请使用微信5.0以上版本打开");
                     return;
                 }
                 me.weixinPay(orderSn);
                 
             }
        });

        }
    ,runPayment: function() {
        var orderSn = Util.getQueryString('order');
        var me = this;
        var errmsg = "";
        Util.requestApi('?r=order/getpayments', {order:orderSn}, function(data){
            if (data.errno != 0) {
                messageBox.toast(data.errmsg);
                errmsg = data.errmsg;
                me.gotoDetail(orderSn);
            } else {
                $('#order_fee').html(data.data.total_fee);
                
                //可以支付再绑定事件
                me.bindPaymentEvent(orderSn);
            }
        });
    }
};

//地址管理
var Address = {

    cfg : {}
    
    //获取选择的地址
    ,getSelectedAddressId: function() {
        var addressId = $('.u-arrow-list input[type=radio]:checked').attr('data-id');
        return addressId;
    }
    //绑定选择收货地址事件
    ,bindSelectEvent: function() {
        var me = this;
        $(".u-arrow-list").delegate('.u-checkbox','click',function(){
            //var addressId = $('.u-arrow-list input[type=radio]:checked').attr('data-id');
            var addressId  = me.getSelectedAddressId();
            if (addressId) {
                //选择当前地址
                Util.requestApi('?r=address/select', {address_id:addressId}, function(data){
                    if (data.errno == 0) {
                        history.go(-1);
                    } else {
                        messageBox.toast(data.errmsg);
                    }
                });
            }
        });
    }
    ,isChecked: function(data) {
        var me = Address;
        if (me.cfg.page == 'myaddress') {
            return data.is_default;
        } else {
            return data.selected;
        }
    }
    //渲染地址列表
    ,renderAddressList: function(data) {
        var me = Address;
        if (data.errno == 0) {
            var tempate = $('#tempate-address-list').html();
            var html = "";
            var selectId = 0;
            for (i in data.data) {
                var item = data.data[i];
                var href = config.page.address_edit + "?id=" + item.address_id;
                item.address = item.province + item.city + item.district + item.address;
                var checked = '';
                if (me.isChecked(item)) {
                    checked = "checked=checked";
                }
                var itemHtml = tempate.replace('{$consignee}', item.consignee)
                               .replace('{$mobile}', item.mobile)
                               .replace('{$href}', href)
                               .replace('{$checked}', checked)
                               .replace('{$address_id}', item.address_id)
                               .replace('{$address}', item.address);
                               
                
                html += itemHtml;
            }
            $('.u-arrow-list').html(html);
        } else {
            messageBox.toast(data.errmsg);
        }
        
    }
    //加载我的地址列表
    ,loadMyaddress: function() {
        var api = "?r=address/list";
        Util.requestApi(api, {}, this.renderAddressList);
    }
    //新增地址事件绑定
    ,bindNewAddressEvent: function() {
        var me = this;
        $('.u-mainbutton-little').click(function(){
            //保存按钮事件

            var params = me.getAddressFormData();
            if (params == false) {
                return;
            }
            var url = config.api + "?r=address/add";
            console.log(params);
            $.ajax({
                url: url,
                data: params,
                dataType: 'jsonp',
                xhrFields: {
                   withCredentials: true
                },
                crossDomain : true,
                success: function(data) {
                    messageBox.toast(data.errmsg)
                    if (data.errno == 0) {
                        //成功 返回
                        history.go(-1);
                    }
                },
                error: function() {
                    messageBox.toast("服务器出错，请稍后重试");
                }
            });
        });
    }
    //收货地址主界面事件绑定
    ,bindMainEvent: function() {
        var me = this;
        $(".u-button-main").click(function(){
             var addressId  = me.getSelectedAddressId();
             if (addressId) {
                 var params = {address_id: addressId, 'is_default' : 1};
                 Util.requestApi('?r=address/update', params, function(data){
                     if (data.errno == 0) {
                         messageBox.toast("设置成功");
                     }
                     if (data.errno == 10032) {
                         //地址不全，请完善
                         messageBox.toast("请先完善地址");
                     }
                     
                 });
             }
            
        });
    }
    ,getAddressFormData: function(){
        var params = {};
        var notice = [];
        $('.u-arrow-list input').each(function(i){
            var name = $(this).attr('name');
            var value = $(this).attr('value');
            params[name] = value;
            notice[name] = $(this);
        });
        for (i in params) {
                if (params[i] == '') {
                    messageBox.toast(notice[i].attr('placeholder'));
                    notice[i].focus();
                    return false;
                }
        }
        //var reg = /^0?(13[0-9]|15[012356789]|17[0678]|18[0-9]|14[57])[0-9]{8}$/;
        if (!Util.isCorrectMobile(params['mobile'])) {
            //手机号码验证
            messageBox.toast("手机号码格式错误");
            notice['mobile'].focus();
            return false;
        }
        var areas = params['province_city_district'].split(" ");
        delete params['province_city_district'];
        params['str_province'] = areas[0];
        params['str_city'] = areas[1];
        params['str_district'] = areas[2];
        return params;
    }
    //渲染地址详情页面
    ,renderDetail: function(data) {
        if (data.errno == 0) {
            var address = data.data;
            var province_city_district = address.province + " " + address.city + " " + address.district;
            address['province_city_district'] = province_city_district;
            delete address['province'];
            delete address['city'];
            delete address['district'];
            
            $(".u-arrow-list input").each(function(i){
                var name = $(this).attr('name');
                $(this).val(address[name]);
            });
            $(".u-arrow-list").show();
            $('#loading').hide();
        } else {
            messageBox.toast(data.errmsg);
        }
    }
    ,loadDetail: function() {
        var id = Util.getQueryString('id');
        if (id) {
            //console.log(id);
            Util.requestApi('?r=address/detail', {id:id}, this.renderDetail);
        }
    }
    ,handleDetailCallback: function(data) {
        messageBox.toast(data.errmsg);
        console.log(data);
        if (data.errno == 0) {
            history.go(-1);
        }
    }
    ,bindDetailEvent: function() {
        //保存修改
        var me = this;
        $('.u-mainbutton-little').click(function(){
            var addressId = $('input[name=address_id]').val();
            if (addressId) {
                var params = me.getAddressFormData();
                if (params == false) {
                    return;
                } else {
                    Util.requestApi('?r=address/update', params, me.handleDetailCallback);
                }
                
            }
        });
        
        //删除
        $('.del').click(function(){
            var addressId = $('input[name=address_id]').val();
            if (addressId) {
                Util.requestApi('?r=address/remove', {id:addressId}, me.handleDetailCallback);
            }
        });
    }
    //管理主页
    ,runMain: function() {
        this.cfg.page = 'myaddress';
        this.loadMyaddress();
        this.bindMainEvent();
    }
    //地址选择页面
    ,runSelect: function() {
        this.loadMyaddress();
        this.bindSelectEvent();
    }
    //地址新增页面
    ,runNew: function() {
        this.bindNewAddressEvent();
        
    }
    //地址编辑页面
    ,runEdit: function() {
        this.loadDetail();
        this.bindDetailEvent();
    }

};


//用户相关
var User = {
    user: {}
    ,renderKing: function(data, direct) {
        Util.hideLoading();
        if (data.is_login != 1) {
            Util.goLogin(direct);
        } else {
            if (data.user.role >= Const.USER_ROLE_SUPPLIER) {
                //跳到供应商
                window.location.href = config.page.user_supplier;
                return;
            }
            $(".u-person-head, .u-person-cont, .u-person-order, .u-img-a-list").show();
            $(".u-person-head .name").append(data.user.name);
            $(".u-person-head .photo").attr('src', data.user.avatar);
            $("#loading").hide();
           
        }
    }
    ,renderSupplier: function(data, direct) {
        Util.hideLoading();
        if (data.is_login != 1) {
            Util.goLogin(direct);
            return;
        }
        if (data.user.role < Const.USER_ROLE_SUPPLIER) {
            //跳到供应商
            window.location.href = config.page.user_king;
            return;
        }
        if (data.user.role == Const.USER_ROLE_SUPPLIER_LEADER) {
            //供应商队长，开放下级入口
            $('#my_team').show();
        }
        $(".u-person-head, .u-person-cont, .u-person-order, .u-img-a-list").show();
        $(".u-person-head .name").append(data.user.name);
        $(".u-person-head .photo").attr('src', data.user.avatar);
        $("#loading").hide();
    }
    ,initKing: function(data, proxy) {
        if (!proxy) {
            proxy = this;
        }
        proxy.renderKing(data, config.page.user_king);
    }
    ,initSupplier: function(data, proxy) {
        proxy.renderSupplier(data, config.page.user_supplier);
    }
};



//收藏相关
var Collection = {
    
    remove: function(goods_ids, callback) {
        Util.requestApi('?r=collect/remove', {goods_ids:goods_ids}, callback);
    }
    ,run: function() {
        Util.requestApi('?r=collect/get', {}, this.renderList);
        this.bindEvent();
    }
    ,bindEvent: function(){
        var me = this;
        $('.productlistbox').delegate(".photo ", 'click', function(){
            
            var goods_id = $(this).attr('data-id');
            if (goods_id) {
                Util.goGoodsDetail(goods_id);
            }
        });
        
        $('.productlistbox').delegate(".count ", 'click', function() {
                $('#js-moreFunction').attr('data-id', $(this).attr('data-id'));
                $('#js-moreFunction').show();
        });
        
        $('#js-moreFunction .u-button-gray').click(function() {
            $('#js-moreFunction').hide();
        });
        $('#js-moreFunction').delegate('.cont', 'click', function(){
            
             var type = $(this).attr('data-action');
             var goods_id = $('#js-moreFunction').attr('data-id');
             if ('add-cart' == type) {
                 goodsCart.add(goods_id);
             }
             if ('remove' == type) {
                 me.remove(goods_id, function(data){
                     messageBox.toast(data.errmsg);
                     if (data.errno == 0) {
                        //重新获取 
                        $('#js-moreFunction').hide();
                        Util.requestApi('?r=collect/get', {}, me.renderList);
                     }
                 });
             }
             
        });
    }
    //渲染列表
    ,renderList: function(data) {
        if (data.errno == 12) {
            Util.goLogin(config.page.collection);
            return;
        } 
        if (data.errno != 0) {
            messageBox.toast(data.errmsg);
            return;
        }
        var tempate = $('#collect_list_tempate').html();
        var html = "";
        for (i in data.data.list) {
            var item = data.data.list[i];
            var icon = '';
            var sold = "";
            var tips = "";
            if (item.goods_number <= 0) {
                sold = 'sold';
                icon = '<img src="img/hwicon_07.png" class="icon">';
                tips = "已售罄";
            }
            if (item.goods_status != Const.GOODS_STATUS_ON_SELL) {
                sold = 'sold';
                icon = '<img src="img/hwicon_07.png" class="icon">';
                tips = "已结缘";
            }
            item.sold = sold;
            item.tips = tips;            
            item.icon = icon;            
            html += Template.renderByTempate(tempate, item);
        }
        $('.productlistbox').html(html);
    }
};


//收入相关
var Income = {
    
    loadKingFee: function() {
        //加载收入概要 
        var api = "?r=income/resume";
        Util.requestApi(api, {}, function(data) {
             if (data.errno == Const.NO_LOGIN) {
                 //没有登录
                 Util.goLogin(config.page.income_king);
                 return;
             }
             if (data.errno != 0) {
                 messageBox.toast(data.errmsg);
                 return;
             }
             if (data.data.role >= Const.USER_ROLE_SUPPLIER) {
                 //Util.goPage(config.page.income_supplier);
             }
             $('#user_money').html(data.data.money);
             $('#trade_money').html(data.data.trade_money);
             //
        });
    }
    ,loadSupplierFee: function() {
        //加载收入概要 
        var api = "?r=income/resume";
        Util.requestApi(api, {}, function(data) {
             if (data.errno == Const.NO_LOGIN) {
                 //没有登录
                 Util.goLogin(config.page.income_king);
                 return;
             }
             if (data.errno != 0) {
                 messageBox.toast(data.errmsg);
                 return;
             }
             if (data.data.role < Const.USER_ROLE_SUPPLIER) {
                 //Util.goPage(config.page.income_king);
             }
             if (data.data.role == Const.USER_ROLE_SUPPLIER_LEADER) {
                 $("#changenode02").show(); //可以查看队员订单情况
             }
             $('#user_money').html(data.data.money);
             //$('#trade_money').html(data.data.trade_money);
             //
        });
    }
    //加载收入列表
    ,loadKingFeeDetail: function(p) {
         var api = "?r=income/detail";
         Util.showTips($('#income_list'), "加载中...");
         var me = Income;
         Util.requestApi(api, {p:p}, function(data) {
            if (data.errno != 0) {
                Util.showTips($('#income_list'), data.errmsg);
                return;
            }
            var template = $('#income_list_template').html();
            var html = "";
            if (data.data.list.length == 0) {
                html = "没有佣金记录";
                Util.showTips($('#income_list'), html);
                return
            }
            for (i in data.data.list) {
                var item = data.data.list[i];
                html += Template.renderByTempate(template, item);
            }
            $('#income_list').html(html);
            
            var page_count = data.data.page_count;
            var curent_page = data.data.p;
            me.page.render(curent_page, page_count);
            
             
         });
    }
    //加载收入列表
    ,loadSupplierFeeDetail: function(myself, p) {
         var api = "?r=income/supplierdetail";
         var me = Income;
         var target = myself ? $("#sold_content") : $("#sub_sold_content");
         var page = myself ? me.page_self : me.page_sub;
         Util.showTips(target, "加载中...");
         
         Util.requestApi(api, {p:p,myself:myself}, function(data) {
            if (data.errno != 0) {
                Util.showTips(target, data.errmsg);
                return;
            }
            var template = $('#income_list_template').html();
            var html = "";
            $("#goods_money").html("￥" + data.data.goods_money);
            $("#rebate_money").html(data.data.rebate_money);
            if (data.data.list.length == 0) {
                html = "没有佣金记录";
                Util.showTips(target, html);
                return
            }
            for (i in data.data.list) {
                var item = data.data.list[i];
                html += Template.renderByTempate(template, item);
            }
            target.html(html);
            
            var page_count = data.data.page_count;
            var curent_page = data.data.p;
            page.render(curent_page, page_count);
            
             
         });
    }
    ,bindKinFeeEvent: function() {
        var me = this;
        me.page = new Page('.u-flip');
        me.page.addClickEvent(function(){
            
             var page = $(this).attr('data');
             if (page) {
                 me.loadKingFeeDetail(page);
             }
        });
    }
    ,runKing: function() {
        this.loadKingFee();
        this.loadKingFeeDetail(1);
        this.bindKinFeeEvent();
    }
    ,bindSupplierEvent: function(){
        
    }
    ,runSupplier: function() {
        var me = this;
        me.page_self = new Page('#sold_page');
        me.page_sub = new Page('#sub_sold_page');
        me.page_self.addClickEvent(function(){
            
             var page = $(this).attr('data');
             if (page) {
                 me.loadSupplierFeeDetail(true, page);
             }
        });
        me.page_sub.addClickEvent(function(){
            
             var page = $(this).attr('data');
             if (page) {
                 me.loadSupplierFeeDetail(false, page);
             }
        });
        me.loadSupplierFee();
        me.bindSupplierEvent();
        myself = true;
        me.loadSupplierFeeDetail(myself, 1);
    }
    //进入提现页面
    , loadWithdrawals: function() {
         var me = this;
         Util.requestApi('?r=income/getaccount', {}, function(data){
              if (data.errno != 0) {
                  messageBox.toast(data.errmsg);
                  return;
              }
              me.money_limit = data.data.withdrawals_limit;
              me.total_money = parseInt(data.data.money);
              $("#js-maxQuota, #js-alipayMaxQouta").html(data.data.money);
              $('.user_money').html(data.data.user_money);
              
              if (data.data.withdrawals_account) {
                  //从历史中选择
                  var account = data.data.withdrawals_account;
                  me.withdrawals_account = data.data.withdrawals_account
                  if (account.account_type == Withdrawaccount.type_bank) {
                      //银行卡
                        var money  = $('#js-quota').val();
                        $('#js-card').val(account.account);
                        $('#js-personName').val(account.display_name);
                        if (me.canSubmit(money)) {
                            $('#js-cardsubmit').attr('data-money', money).removeClass('disable');
                            me.addSubmitApplyEvent($('#js-cardsubmit'), money);
                        }
                  } else {
                      //支付宝
                      var money  = $('#js-alipayQouta').val();
                      $('#changenode02').trigger('click');
                      $('#js-alipay-card').val(account.account);
                      $('#alipay-personName').html(account.display_name);
                      if (me.canSubmit(money)) {
                            $('#js-alipaysubmit').attr('data-money').removeClass('disable');
                            me.addSubmitApplyEvent($('#js-alipaysubmit'));
                      }
                  }
                  
              }
              
         });
    }
    ,canSubmit: function (money) {
            //检查是否可以提交申请
        var me = Income;
         if (me.money_limit == -1
             || money < me.money_limit
             || money > me.total_money
             || me.withdrawals_account == null) {
                //数据还未加载
            return false;
        }
        return true;
    }
    ,addSubmitApplyEvent: function(target) {
        var me = Income;
        
        var submit = function(){
                var money = target.attr('data-money');
                if (!me.canSubmit(money)) {
                    return;
                }
                target.unbind('click');
                var param = me.withdrawals_account;
                param.money = money;
                Util.requestApi('?r=income/applywithdrawals', param, function(data){
                    target.bind('click', submit);
                    messageBox.toast(data.errmsg);
                    if (data.errno != 0) {
                        return;
                    }
                    me.loadWithdrawals();
                    
                });
            
        }
        target.bind('click', submit);
    }
    ,runWithdrawals: function() {
        var me = this;
        me.money_limit = -1;
        me.withdrawals_account = null;
        this.loadWithdrawals();
        me.addSubmitApplyEvent($('#js-cardsubmit'));
        me.addSubmitApplyEvent($('#js-alipaysubmit'));
        $("#js-quota,#js-alipayQouta").bind('keyup', function(){
            var money = $(this).val();
            var submitBnt = $(this).attr('id') == 'js-quota' ? $('#js-cardsubmit') : $('#js-alipaysubmit');
              if (me.money_limit == -1) {
                  //数据还未加载
                  return;
              }
              submitBnt.addClass('disable');
              if (money < me.money_limit) {
                  //小于最低提现额度
                  $(this).addClass('error');
                  return;
              }
              if (money > me.total_money) {
                  $(this).addClass('error');
                  return;
              }
              $(this).removeClass('error');
              
              if (!me.canSubmit(money)) {
                  return;
              }
              //检查是否可以提交
              submitBnt.attr('data-money' , money);
              
              if ($(this).attr('id') == 'js-quota') {
                  //银行卡
                    submitBnt.removeClass('disable');
                  
              } else {
                  //支付宝
                  submitBnt.removeClass('disable');
              }
        });
    }
    ,loadHistory: function(p) {
        var me = Income;
        Util.requestApi('?r=income/history', {p:p}, function(data) {
                if (data.errno != 0) {
                    messageBox.toast(data.errmsg);
                    return;
                }
                var template = $("#draw_out_history").html();
                if (data.data.list.length == 0) {
                    Util.showTips($(".listbox"), "没有提取记录");
                    return;
                }
                var html = "";
                for (i in data.data.list) {
                    var item = data.data.list[i];
                    var params = {
                        'money': item.money,
                        'add_time': item.add_time,
                        'status': item.status,
                        'username': item.account_info.username,
                        'account': item.account_info.account,
                        'account_cat': item.account_info.account_cat,
                        
                    };
                    html += Template.renderByTempate(template, params);
                }
                $(".listbox").html(html);
                me.page.render(data.data.page, data.data.page_count);
            
        });
    }
    //提取记录
    ,runHistory: function() {
        var me = this
        me.page = new Page('.u-flip');
        me.page.addClickEvent(function(){
            var page = $(this).attr('data');
            if (page) {
                me.loadHistory(page);
            }
            
        });
        me.loadHistory(1);
    }
    
};

//提现账号选择设置相关
var Withdrawaccount = {
    
    type_bank : 1
    ,type_alipay: 2
    
    //渲染列表
    ,renderList: function(data) {
        var me = Withdrawaccount;
        var html = "";
        var template = $('#income_draw_template').html();
        for (i in data.data) {
            var item = data.data[i];
            var dispay = item.account_cat + ' ' + item.account;
            if (item.account_type == me.type_alipay) {
                dispay =  item.account + "  " + item.username; 
            }
            var arrData = {
                display: dispay,
                id: item.id,
            };
            html += Template.renderByTempate(template, arrData);
        }
        $(html).insertAfter('.u-buttonbox');
    }
    
    ,bindEvent: function() {
        var params = {};
        var tips = {};
        $(".u-infolistbox input").each(function(){
                var name = $(this).attr('name');
                params[name] = $(this).val().trim();
                tips[name] = $(this);
        });
        $(".u-infolistbox input").bind('blur', function(){
                var value = $(this).val().trim();
                if (value == '') {
                    $(this).addClass('error');
                    $(this).val('');
                } else {
                    $(this).removeClass('error');
                }
        });
        $(".u-infolistbox input").bind('keyup', function(){ 
               var name = $(this).attr('name');
               var value = $(this).val().trim();
               params[name] = value;
               if (value == '') {
                    $(this).addClass('error');
                    $(this).val('');
                } else {
                    $(this).removeClass('error');
                }
               for (i in params) {
                   if (params[i] == '') {
                       //有空的
                       $('#js-submit').addClass('disable');
                       return
                   }
               }
               $('#js-submit').removeClass('disable');
        });
        var submitAccount = function() {
               for (i in params) {
                   if (params[i] == "") {
                        messageBox.toast(tips[i].attr('placeholder'));
                        return;
                   }
               }
               $('#js-submit').unbind('click', submitAccount);
               Util.requestApi('?r=withdrawaccount/add', params, function(data){
                    $('#js-submit').bind('click', submitAccount);
                    if (data.errno != 0) {
                        messageBox.toast(data.errmsg);
                        return;
                    }
                    history.go(-1);
                    
               }, 'post');
        };
        $('#js-submit').bind('click', submitAccount);
        
        $('body').delegate('.u-radio' , 'click', function(){
                var id = $(this).val();
                if (!id) {
                    return ;
                }
                Util.requestApi('?r=withdrawaccount/select', {id:id}, function(data){
                        if (data.errno != 0) {
                            messageBox.toast(data.errmsg);
                            return;
                        }
                        history.go(-1);
                    
                });
            
        });
    }
    ,runBank: function() {
        var me = this;
        me.bindEvent();
        Util.requestApi('?r=withdrawaccount/list', {account_type:me.type_bank}, function(data){
            if (data.errno != 0) {
                messageBox.toast(data.errmsg);
            }
            me.renderList(data);
            
        });
        
    }
    ,runAlipay: function() {
        var me = this;
        me.bindEvent();
        Util.requestApi('?r=withdrawaccount/list', {account_type:me.type_alipay}, function(data){
            if (data.errno != 0) {
                messageBox.toast(data.errmsg);
            }
            me.renderList(data);
            
        });
        
    }
};

//用户关系， 用户下级
var UserRelation = {
    
    loadRelation: function(p){
        var me  = UserRelation;
        Util.requestApi("?r=user/downstream",{p:p}, function(data){
                if (data.errno != 0) {
                    messageBox.toast("data.errmsg");
                    return ;
                }
                if (data.data.list.length <= 0) {
                    Util.showTips($('.infolistbox'), "您没有下级");
                    return;
                }
                var html = "";
                var template = $('#downstream_item_template').html();
                for (i in data.data.list) {
                    var item = data.data.list[i];
                    html += Template.renderByTempate(template, item);
                }
                $('.infolistbox').html(html);
                me.mainPage.render(data.data.page, data.data.page_count);
            
        });
    }
    ,runMain: function(){
        var me = this;
        me.loadRelation(1);
        me.mainPage = new Page('.u-flip');
        me.mainPage.addClickEvent(function(){
            var page = $(this).attr('data');
            if (page) {
                me.loadRelation(page);
            }
        });
    }
    ,loadSubIncome: function(id, p) {
        var me = UserRelation;
         Util.requestApi("?r=income/rebatestatics",{p:p,id:id}, function(data){
                if (data.errno != 0) {
                    messageBox.toast("data.errmsg");
                    return ;
                }
                if (data.data.list.length <= 0) {
                    Util.showTips($('#content'),"没有相关记录");
                    return;
                }
                var html = "";
                var template = $('#money_static_template').html();
                for (i in data.data.list) {
                    var item = data.data.list[i];
                    html += Template.renderByTempate(template, item);
                }
                $('#content').html(html);
                me.page.render(data.data.page, data.data.page_count);
            
        });
    }
    //下级的佣金统计
    ,runSubIncome: function() {
        var me = this;
        var id = Util.getQueryString('id');
        me.loadSubIncome(id, 1);
        me.page = new Page('.u-flip');
        me.page.addClickEvent(function(){
            var page = $(this).attr('data');
            if (page) {
                me.loadSubIncome(id, page);
            }
        });
    }
};


//供应商，
var Supplier = {
    
    //加载在售的商品
    loadSelling: function(p, callback){
        var me = Supplier;
        me.sellingPageNo = p;
        Util.requestApi("?r=good/myselling",{p:p}, function(data) {
            if (data.errno != 0) {
                
                messageBox.toast(data.errmsg);
                return;
            }
            callback(data);
        });
    }
    //加载交易中
    ,loadtrading: function(p) {
        Util.requestApi("?r=good/mytrading",{p:p}, function(data) {
            if (data.errno != 0) {
                
                messageBox.toast(data.errmsg);
                return;
            }
            //渲染列表
            var me = Supplier;
            var html = "";
            var template = $("#trade_sold_template").html();
            if (data.data.list.length == 0) {
                Util.showTips($("#trade_content"), "没有相关记录");
                return;
            }
            for (i in data.data.list) {
                 var item = data.data.list[i];
                 item.status = "交易中";
                 html += Template.renderByTempate(template, item);
             }
             me.tradingPage.render(data.data.page, data.data.page_count);
             $("#trade_content").html(html);
        });
    }
    //加载已售的 
    ,loadsold: function(p) {
        var me = Supplier;
        Util.requestApi("?r=good/mysold",{p:p}, function(data) {
            if (data.errno != 0) {
                
                messageBox.toast(data.errmsg);
                return;
            }
            //渲染列表
            var me = Supplier;
            var html = "";
            var template = $("#trade_sold_template").html();
            if (data.data.list.length == 0) {
                Util.showTips($("#sold_content"), "没有相关记录");
                return;
            }
            for (i in data.data.list) {
                 var item = data.data.list[i];
                 item.status = "已售";
                 html += Template.renderByTempate(template, item);
             }
             me.soldPage.render(data.data.page, data.data.page_count);
             $("#sold_content").html(html);
        });
    }
    ,renderSelling: function(data) {
         var me = Supplier;
         var html = "";
         var template = $("#myproduct_selling_template").html();
         
         if (data.data.list.length == 0) {
                Util.showTips($("#selling_content"), "没有相关记录");
                return;
         }
         for (i in data.data.list) {
             var item = data.data.list[i];
             
             html += Template.renderByTempate(template, item);
         }
         me.sellingPage.render(data.data.page, data.data.page_count);
         $("#selling_content").html(html);
    }
    ,renderModify: function(data) {
         var me = Supplier;
         var html = "";
         var template = $("#modify_template").html();
         if (data.data.list.length == 0) {
                Util.showTips($("#modify_content"), "没有相关记录");
                return;
         }
         for (i in data.data.list) {
             var item = data.data.list[i];
             
             html += Template.renderByTempate(template, item);
         }
         me.modifyPage.render(data.data.page, data.data.page_count);
         $("#modify_content").html(html);
    }
    ,initSeeling: function(){
        var me = Supplier;
        if (!me.sellingPage) {
            me.sellingPage = new Page("#selling_page");
            me.sellingPage.addClickEvent(function() {
                var page = $(this).attr('data');
                if (page) {
                    me.loadSelling(page,me.renderSelling);
                }
            });
            me.loadSelling(1,me.renderSelling);
        }
        
    }
    //初始化交易中
    ,initTrading: function() {
        var me = Supplier;
        if (!me.tradingPage) {
            me.tradingPage = new Page("#trade_page");
            me.tradingPage.target = "#trade_page";
            me.tradingPage.addClickEvent(function() {
                var page = $(this).attr('data');
                if (page) {
                    me.loadtrading(page);
                }
            });
            me.loadtrading(1);
        }
        
    }
    ,initSold: function() {
        var me = this;
        if (!me.soldPage) {
            me.soldPage = new Page("#sold_page");
            me.soldPage.addClickEvent(function() {
                var page = $(this).attr('data');
                if (page) {
                    me.loadsold(page);
                }
            });
            me.loadsold(1);
        }
    }
    //初始化修改价格
    ,initModify: function() {
        var me = Supplier;
        if (!me.modifyPage) {
            me.modifyPage = new Page("#modify_page");
            me.modifyPage.addClickEvent(function() {
                var page = $(this).attr('data');
                if (page) {
                    me.loadSelling(page,me.renderModify);
                }
            });
            me.loadSelling(1,me.renderModify);
        }
    }
    ,tabFunction: function(data, proxy) {
        if (!proxy) {
            var me = Supplier;
        } else {
            me = proxy;
        }
        
        if (data == 'selling') {
              me.initSeeling();
              return;
          }
          if (data == 'trading') {
              me.initTrading();
              return;
          }
          if (data == 'sold') {
              me.initSold();
              return ;
          }
          if (data == 'modify') {
              me.initModify();
              return ;
          }
          if (data == 'refund') {
              Util.showTips($("#js-contbox05"), "陆续开放中 ...");
              return;
          }
    }
    //事件绑定处理
    ,bindEvent: function() {
         //选项卡切换事件
         var me = this;
        $("#js-changecont").delegate("div", 'click', function(){
              var data = $(this).attr('data');
              me.tabFunction(data, me);
        });
        
        //批量修改
        $("#js-chooseall .u-checkbox").change(function(){
             if ($(this).prop('checked')) {
                 //全选
                 $("#modify_content .u-checkbox").prop('checked', true);
             } else {
                 //全不选
                 $("#modify_content .u-checkbox").prop('checked', false);
             }
        });
        $("#js-contbox04 .u-myproduct-bottomedit button").click(function(){
                
                //提交批量修改价格
                var goodsIds = "";
                goodsIds = $("#modify_content input[type=checkbox]:checked").map(function(i){
                        return $(this).val();
                }).get().join(',');  
                if (goodsIds == "") {
                    messageBox.toast("请选择要修改的商品");
                    return;
                }
                var percent = $("#js-contbox04 .u-myproduct-bottomedit input[type=number]").val().trim();
                if (percent == "") {
                     messageBox.toast("请输入折扣值");
                    return;
                }
                percent = parseInt(percent);
                if (isNaN(percent) || 1 > percent || 99 < percent) {
                    messageBox.toast("只能输入0 - 99");
                    return;
                }
                Util.syncRequest('?r=good/batmodifyprice', {goods_ids:goodsIds,percent:percent}, function(data){
                    messageBox.toast(data.errmsg);
                    if (data.errno == 0) {
                         //修改成功，刷新页面
                         //me.sellingPageNo
                         $('.u-myproduct-editpopod .u-button-gray').trigger('click');
                         me.loadSelling(me.sellingPageNo,me.renderModify);
                    }
                    
                });
                

        });
        //修改框的事件
        $("#selling_content").delegate(".editnode", 'click', function(){
              $("#js-editpricebox")[0].style.display = "-webkit-box";
              var goodsId = $(this).attr('data-id');
              var goodsPrice = $(this).attr('data-price');
              $("#src_price").html(goodsPrice);
              $("#goods_id").val(goodsId);
        });
        //修改价格和状态按钮的事件
        var modifyBntClick = function(){
            var type =  $("#js-editpricebox .nav .on").attr('box');
            var goodsId = $("#js-editpricebox input[name=goods_id]").val();
            if (type == 0) {
                //修改价格
                var price = parseInt($("#mod_price").html());
                if (isNaN(price) || price == 0) {
                    messageBox.toast("请输入调整的价格");
                    return; 
                }
                Util.syncRequest('?r=good/modifyprice', {goods_id:goodsId,price:price}, function(data){
                    messageBox.toast(data.errmsg);
                    if (data.errno == 0) {
                         //修改成功，刷新页面
                         //me.sellingPageNo
                         $('.u-myproduct-editpopod .u-button-gray').trigger('click');
                         me.loadSelling(me.sellingPageNo,me.renderSelling);
                    }
                    
                });
            } else {
                //修改价格
                var status = $("#js-editpricebox select").val();
                Util.syncRequest('?r=good/modifystatus', {goods_id:goodsId,status:status}, function(data){
                    messageBox.toast(data.errmsg);
                    if (data.errno == 0) {
                         //修改成功，刷新页面
                         //me.sellingPageNo
                         $('.u-myproduct-editpopod .u-button-gray').trigger('click');
                         me.loadSelling(me.sellingPageNo,me.renderSelling);
                    }
                    
                });
            }
        };
        $("#js-editpricebox .u-button-main").bind('click',modifyBntClick);
        //注册价格框keyup事件，实时判断价格是否合法
        $("#js-editpricebox .contbox input").bind("keyup", function(){
            var price = parseInt($("#src_price").html());
            var name = $(this).attr('name');
            var value = $(this).val();
             $(this).removeClass("error");
            if (name == 'discount') {
                 if (value < 1 || value > 99) {
                     $(this).addClass("error");
                     $("#mod_price").html("");
                     return;
                 } else {
                     $("#mod_price").html(price * value / 100);
                 }
            }
            if (name == 'new_price') {
                 if (value < 1 || value > price) {
                     $(this).addClass("error");
                     $("#mod_price").html("");
                     return;
                 } else {
                     $("#mod_price").html(value);
                 }
            }
        });
    }
    //管理我商品
    ,runMainProducts: function() {
        var me = this;
        me.bindEvent();
        var type = Util.getHash();
        var types = {'selling':1, 'trading':1,'sold':1,'modify':1,'refund':1};
        if (!(type in types)) {
            type = 'selling';
        }
        $('#js-changecont div').removeClass('on');
        $('#js-changecont div[data='+type+']').addClass('on').trigger('click');
        //me.tabFunction(type, me);
    }
    //我的收入里面涉及已售商品相关
    ,runIncome: function() {
        
        var me = this;
        
    }
    
};

    