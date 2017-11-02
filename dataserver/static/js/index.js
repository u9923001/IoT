const MbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
'Imagery © <a href="http://mapbox.com">Mapbox</a>';

const MbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png32?access_token=pk.eyJ1IjoidTk5MjMwMDEiLCJhIjoiY2o3YWdqeGZoMGZhZDJxbzFtZ2wxMWswZiJ9.rieTxvxJSPfaerXHPjMIiA';
const MyDNS = "http://" + window.location.host;
const MyWS = "ws://" + window.location.host;
//const MyDNS = "https://u9923001.myddns.me";
//const MyWS = "wss://u9923001.myddns.me";
//建立感測點Marker
var SenIcon = function(icon, color){
    return {icon: icon,
    iconColor: color,
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'}
};
var _senMark = new Array(6);
_senMark[0] = new SenIcon('fa-building','#A42D00');
_senMark[1] = new SenIcon('fa-building','#888800');
_senMark[2] = new SenIcon('fa-building','#227700');
_senMark[3] = new SenIcon('fa-building','#00BBFF');
_senMark[4] = new SenIcon('fa-building','#000088');
_senMark[5] = new SenIcon('fa-building','#770077');

//存checkbox、socketIO狀態
var CbState = [false,false,false,false,false,false,false];
var SkioState = [false,false,false,false,false,false];
var MapPopup = false;
var HSortFin = true;
var HLoadBrk = false;
var HCharFin = false;
var HLGet = false;
var PopState = 0x00;
//Checkbox用
var _cb1st = [true,true,true,true,true,true,true];

//存感測資料用
var LassData = new Array(6);
var MoveData;
var LaMkData = new Array(6);
//存歷史資料用
var HLtmp = [];
var HLhum = [];
var HLbar = [];
var HLpm1 = [];
var HLpm25 = [];
var HLpm10 = [];
// [ -1  , 0     , 1   , 2   , 3  , 4  , 5  , 6    ]
// [ null, airbox, maps, lass, l4u, g0I, g0V, move ]
var PtLayID = -1;
var PtDevID = "";


/////////介面初始化
CSSInit();
topBtnClick();
window.addEventListener('resize', windowResize);
setCheckBox();


var FirstLoca = true;
var UserMarker,ppp=0,qqq=0;
var userMk = L.ExtraMarkers.icon({
    icon: 'fa-user-circle',
    markerColor: 'blue',
    shape: 'star',
    prefix: 'fa'
});
////////地圖初始化
var BaseLyr = L.tileLayer(MbUrl, {id: 'mapbox.streets', attribution: MbAttr});
var Map_L = L.map('mapView', {
    center: L.latLng(24.951904, 121.226521),
    zoom: 12
});
Map_L.addLayer(BaseLyr);
setDropDownMap();

////////初始化使用者標籤
getLocation(function(a){
    if(FirstLoca){
        var lat = a.coords.latitude;
        var lng = a.coords.longitude;
        console.log(a);
        var parisKievLL = [[lat,lng]];//,{icon: userMk} 
        UserMarker = L.Marker.movingMarker(parisKievLL, [],{icon: userMk});
        Map_L.addLayer(UserMarker);
        Map_L.setView([lat,lng],15);
        FirstLoca = false;
    }
},function(){console.log("gps error")});

////////定時更新座標
var updateGPS = setInterval(function(){
    getLocation(function(a){    
        var lat = a.coords.latitude;
        var lng = a.coords.longitude;
        UserMarker.moveTo([lat+ppp,lng+qqq],[2500]);
        UserMarker.start();
    },function(){console.log("gps error")})
},2500);

//////建立地圖上面的按鈕
//control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
var newMapBtn = function creatMapBtn(map, position, bgcolor,inHTML,onclickFun){ 
    return L.Control.extend({
        options: {
            position: position
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.style.backgroundColor = bgcolor;
            container.style.width = '38px';
            container.style.height = '38px';
            container.value = 0;
            container.innerHTML = inHTML;
            container.onclick = onclickFun;
            return container;
        }
    });
}
var traceBtn = newMapBtn(Map_L,'topleft','white','<i class="fa fa-crosshairs fa-3x" aria-hidden="true"></i>',function(){getLocation(function(a){Map_L.setView([a.coords.latitude,a.coords.longitude],17);},function(){console.log("gps error")})});
var homeBtn = newMapBtn(Map_L,'topleft','white','<i class="fa fa-home fa-3x" aria-hidden="true"></i>',function(){getLocation(function(a){Map_L.setView([a.coords.latitude,a.coords.longitude],15);},function(){console.log("gps error")})});

Map_L.addControl(new traceBtn());
Map_L.addControl(new homeBtn());

///////////Marker Group 插件-減少Marker數量
var MkCGp = L.markerClusterGroup({ disableClusteringAtZoom : 15,spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true });
//////////建立Marker圖層
function creatMkLyr(lyrIds, data){
    //console.log(lyrIds,data);
    var res=[];
    var redMarker;
    var aherf="";
    //切換感測點ICON
    redMarker = L.ExtraMarkers.icon(_senMark[lyrIds]);
    //建立Marker
    for (var i = 0, len = data.length; i < len; i++) {
        var mk = L.marker(
            L.latLng(data[i].Latitude, data[i].Longitude), {icon: redMarker, attributes: data[i], layerid : lyrIds});        
        
        //插入Marker popup事件
        MkCGp.addLayer(mk.bindPopup('<button id="'+data[i].Device_id+'" class="ui inverted blue button">查詢歷史資料</button>'));
        res.push(mk);
    }
    //加到圖層
    Map_L.addLayer(MkCGp);
    LaMkData[lyrIds] = res;
}

////////刪除Marker圖層
function deletMkLyr(lyrIds){
    var data = LaMkData[lyrIds];
    for (var i = 0, len = data.length; i < len; i++) {
        MkCGp.removeLayer(data[i]);
    }
}

////////更新資料
function upLaPop(lyrIds, newAttr){
    if(MapPopup){//確認Map彈出視窗
        if(lyrIds == PtLayID){//確認圖層 
            for (var i = 0, len = newAttr.length; i < len; i++) {
                if(PtDevID == newAttr[i].Device_id){
                    console.log("match " + PtDevID);
                    upRightMenu(newAttr[i],function(){});
                    break;
                }
            }
        }
    }
}

//更新底部資料顯示
var _gauge = new Gauge(document.getElementById("myGauge"));
var _meter = document.getElementById("tp_scl");
function upRightMenu(attr,cb){
    var e1 = document.getElementById("d_se");
    var e2 = document.getElementById("d_te");
    var e3 = document.getElementById("d_de");
    var e4 = document.getElementById("d_hy");
    var e5 = document.getElementById("d_p1");
    var e6 = document.getElementById("d_p5");
    var e7 = document.getElementById("d_p0");
    var e8 = document.getElementById("d_ve");
    var e9 = document.getElementById("d_ste");
    var ea = document.getElementById("d_br");
    var eb = document.getElementById("d_tz");
    
    var ec = document.getElementById("ri1");
    var ed = document.getElementById("ri2");
    var ee = document.getElementById("ri3");
    var ef = document.getElementById("g_text");
    var f0 = document.getElementById("t_text");
    
    var t0 = attr.Temperature;
    
    e1.value = (attr.SiteName == null || attr.SiteName == "") ? "無" : attr.SiteName;
    e3.value = (attr.Device_id == null || attr.Device_id == "") ? "無" : attr.Device_id;
    e2.value = (t0 == null) ? "無" : t0 ;
    e4.value = (attr.Humidity == null) ? "無" : attr.Humidity + '%';
    
    e5.value = (PtLayID==4 || PtLayID==5) ? "無" : attr.Pm1 || "0" ;
    e6.value = attr.Pm25 || "0";
    e7.value = (PtLayID==4 || PtLayID==5) ? "無" : attr.Pm10 || "0";
    e8.value = (PtLayID==0) ? attr.Voltage : "無";
    e9.value = (PtLayID<2) ? attr.Satellites : "無";
    ea.value = (PtLayID==1) ? attr.Barometer : "無";
    //var date = new Date(attr.Timestamp).toLocaleString();
/*var ye = date.getFullYear();
    var mo = date.getMonth() + 1;
    var da = date.getDate();
    var ho = date.getHours();
    var mi = (date.getMinutes() < 10) ? "0"+date.getMinutes() : date.getMinutes();
    var se = (date.getSeconds() < 10) ? "0"+date.getSeconds() : date.getSeconds();
   */   
    var a_t = attr.Timestamp;
    var date =new Date(a_t.slice(0,19));
    eb.innerText = date;//" "+ye+"/"+mo+"/"+da+" "+ho+":"+mi+":"+se;
    
    //PM2.4狀態
    var b,d;
    if(attr.Pm25 < 17){
        b = '<h2 class="ui olive header" style="margin-top: 10px;padding-right: 15px;">良好</h2><p>正常戶外活動。</p>';
        d = '<i class="fa fa-smile-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25 <36){
        b = '<h2 class="ui green header" style="margin-top: 10px;padding-right: 15px;">良好</h2><p>正常戶外活動。</p>';
        d = '<i class="fa fa-smile-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25 <45){
        b = '<h2 class="ui yellow header" style="margin-top: 10px;padding-right: 15px;">中等</h2><p>敏感性族群若發生癥狀時，應減少戶外活動。</p>';
        d = '<i class="fa fa-meh-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25 <54){
        b = '<h2 class="ui orange header" style="margin-top: 10px;padding-right: 15px;">中等</h2><p>敏感性族群若發生癥狀時，應減少戶外活動。</p>';
        d = '<i class="fa fa-meh-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25 <62){
        b = '<h2 class="ui red header" style="margin-top: 10px;padding-right: 15px;">不佳</h2><p>考慮減少戶外活動。</p>';
        d = '<i class="fa fa-frown-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25 <71){
        b = '<h2 class="ui pink header" style="margin-top: 10px;padding-right: 15px;">危險</h2><p>考慮減少戶外活動。</p>';
        d = '<i class="fa fa-frown-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25 == null){
        b = '<h2 class="ui pink header" style="margin-top: 10px;padding-right: 15px;">??</h2><p>感測裝置出現問題。</p>';
        d = '<i class="fa fa-frown-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else{
        b = '<h2 class="ui purple header" style="margin-top: 10px;padding-right: 15px;">非常危險</h2><p>減少戶外活動。</p>';
        d = '<i class="fa fa-frown-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }
    ed.innerHTML = b;
    ec.innerHTML = d;
    
    //溫濕度計
    ef.innerHTML = attr.Humidity;
    _gauge.value(attr.Humidity/100.0);
    
    f0.innerHTML = t0 + '&deg;C';
    var temp = Math.floor( t0 );
    
    if(temp > 50)
        temp = 50;
    else if (temp < 10)
        temp = 10;
    
    _meter.style.top = (65 - temp)+'px';
    _meter.style.height = (5 + temp)+'px';
    cb();
}


//讀條控制
function setLoad(b,i,max){//狀態、增加量、最大值
    var ml = $('#ml');//讀條
    var np = ml.progress('get percent');//讀現在值
    if(b){//true設定值
        ml.progress({percent: max});    
    }else{//false增加模式    
        if(np+i <= max){
            ml.progress({percent: np+i});    
        }else{
            ml.progress({percent: max});
        }
    }
    return np;
}
//等待歷史資料
function waitHLdata(){
    var mw = document.getElementById('myLoad');//讀條視窗
    //狀態復原
    HLoadBrk = false;
    //進度條歸零
    setLoad(true,0,0);
    //等待資料 顯示讀條
    mw.style.display = "block";
    var c=0;
    var i=5;
    var n=0;
    window.fakeProgress = setInterval(function() {
        if(!HLoadBrk){//沒有觸發break
            if(HLGet){//資料接收
                if(HSortFin){//資料處理完成
                    if(n != 100){
                        n = setLoad(false,20,100);
                    }else{
                        n = setLoad(true,0,100);
                        clearInterval(window.fakeProgress);
                        if(HCharFin){//清圖層
                            clearChart();
                            popHWd();
                        }else{
                            popHWd();
                        }
                        mw.style.display = "none";
                    }
                    
                    console.log("HSortFin ",HSortFin,n);
                }else{
                    n = setLoad(false,2,100);
                }
            }else{
                i=i+20;
                n = setLoad(false,i,90);
                console.log("HLGET ",HLGet,n);
            }
        }else{//觸發break   
            clearInterval(window.fakeProgress);            
        }
    }, 200);
        
}

var logChart = document.getElementById("mm").innerHTML;;
//清除舊圖 HCharFin = false
function clearChart(){
    var ec = document.getElementById("mm");
    ec.innerHTML = logChart;
    HCharFin = false;
}

function drawHLBase(){
    var lab = '';
    var e0 = document.getElementById("mm");
    var w = 320;
    var h = 360;
    var ChartColor =["#0080FF","#548C00","#9F4D95"];
    switch(PtLayID){
        case 1://maps
        case 0://airbox
        case 2://lass
        case 3://lass4u
            lab = ['時間', 'PM2.5', 'PM1', 'PM10'];
        break;
        case 4://g0I
        case 5://g0P
            lab = ['時間', 'PM2.5'];
        break;
    }
    
    var ctx1 = document.getElementById("m1");
    var ctx2 = document.getElementById("m2");
    var ctx3 = document.getElementById("m3");
    var g1 = new Dygraph(ctx1,HLtmp,{
        //ylabel:"&deg;C",
        //xlabel:"Time(GMT+8)",
        labels: ['Time', 'Temperature'],
        width: w,
        height: h,
        stepPlot: false,
        fillGraph: true,
        stackedGraph: true,
        includeZero: false,
        showRangeSelector: true,
        animatedZooms:false,
        title:'<h4 class="ui horizontal divider header"><i class="bar chart icon"></i>Temperature&deg;C</h4>',
        legend: "always",
        hideOverlayOnMouseOut: true,
        labelsDiv: document.getElementById('m1_1'),
        labelsSeparateLines: true,
        labelsKMB: true,
        colors: [ChartColor[0],ChartColor[1],ChartColor[2]]
    });
    var g2 = new Dygraph(ctx2,HLhum,{
        //ylabel:"Percent %",
        //xlabel:"Time(GMT+8)",
        labels: ['Time', 'Humidity'],
        width: w,
        height: h,
        stepPlot: false,
        fillGraph: true,
        stackedGraph: false,
        includeZero: false,
        showRangeSelector: true,
        animatedZooms:false,
        legend: "always",
        hideOverlayOnMouseOut: true,
        title:'<h4 class="ui horizontal divider header"><i class="bar chart icon"></i>Humidity%</h4>',
        labelsDiv: document.getElementById('m2_1'),
        labelsSeparateLines: true,
        labelsKMB: true,
        colors: [ChartColor[0],ChartColor[1],ChartColor[2]]
    });
    var g3 = new Dygraph(ctx3,HLpm25,{
        //ylabel:"μg/m3",
        //xlabel:"Time(GMT+8)",
        labels: lab,
        width: w,
        height: h,
        stepPlot: false,
        fillGraph: true,
        stackedGraph: true,
        includeZero: false,
        showRangeSelector: true,
        animatedZooms:false,
        legend: "always",
        hideOverlayOnMouseOut: true,
        title:'<h4 class="ui horizontal divider header"><i class="bar chart icon"></i>懸浮粒子μg/m3</h4>',
        highlightCircleSize: 2,
        strokeWidth: 1,
        strokeBorderWidth: null,
        highlightSeriesOpts: {
          strokeWidth: 1,
          strokeBorderWidth: 1,
          highlightCircleSize: 3
        },
        labelsDiv: document.getElementById('m3_1'),
        labelsSeparateLines: true,
        labelsKMB: true,
        colors: [ChartColor[0],ChartColor[1],ChartColor[2]]
    });
    var onclick = function(ev) {
        if (g3.isSeriesLocked()) {
            g3.clearSelection();
        } else {
            g3.setSelection(g3.getSelection(), g3.getHighlightSeries(), true);
        }
    };
    g3.updateOptions({clickCallback: onclick}, true);
    g3.setSelection(false, 'Pm2.5');
    
    if(PtLayID ==1){
        var ctx4 = document.getElementById("m4");
        var g4 = new Dygraph(ctx4,HLbar,{
            //ylabel:"hPa",
            //xlabel:"Time(GMT+8)",
            labels: ['Time', 'Pressure'],
            width: w,
            height: h,
            stepPlot: false,
            fillGraph: true,
            stackedGraph: true,
            includeZero: false,
            showRangeSelector: true,
            animatedZooms:false,
            legend: "always",
            hideOverlayOnMouseOut: true,
            title:'<h4 class="ui horizontal divider header"><i class="bar chart icon"></i>  氣壓hPa</h4>',
            labelsDiv: document.getElementById('m4_1'),
            labelsSeparateLines: true,
            labelsKMB: true,
            colors: [ChartColor[0],ChartColor[1],ChartColor[2]]
        });
    }
}

//畫歷史圖 HCharFin = true
function creatHChart(){
    //畫新圖  
    drawHLBase();
    HCharFin = true;
}

//彈出歷史資料視窗
function popHWd(){    
    //顯示視窗
    
    btmPopup(false);
    if(!(PopState & 0x04)){
        rightPopup(true);
        //console.log("right popup");
    }
    //畫圖
    creatHChart();    
}

//點擊地圖事件
Map_L.on('click', function(e) {
    
    //清除記憶資料
    PtLayID = -1;
    PtDevID = "";
    MapPopup = false;
    //console.log("Map_L click",PopState);
    //底部彈出視窗復原
    btmPopup(false,0);
    rightPopup(false);
    leftPopup(false);
});

////////點擊感測站POPUP事件
Map_L.on('popupopen', function(e) {
    var attr = e.popup._source.options.attributes;
    var lyrid = e.popup._source.options.layerid;
    var repeat = 0;//紀錄按鈕次數
    //console.log(attr);
    
    //記住點擊資料-更新用
    PtLayID = lyrid;
    PtDevID = attr.Device_id;
    MapPopup = true;
    
    //彈出底部視窗
    btmPopup(true,attr);
        
    //點擊歷史資料按鈕
    var hisBtn = document.getElementById(PtDevID);
    hisBtn.onclick = function(){
        repeat++;
        //console.log("---",repeat,HSortFin);
        //上筆資料如果處理結束&&第一次，請求歷史資料
        if(repeat==1){
            if(HSortFin){
                ws.send("0,"+PtDevID);
                //socket.emit("req_HL", PtLayID+","+PtDevID);
                //console.log("send reqHL");
                HSortFin = false;
                HLGet = false;
                waitHLdata();
            }else{
                alert("Please wait!");
                repeat = 0;
            }
        }else{
            if(HSortFin){
                popHWd();   
            }else{
                waitHLdata();
            }
        }
    };
});

function getHistory(){
    $.getJSON(MyDNS+'/sensor/history/'+PtDevID, function(data) {
    //$.getJSON('https://u9923001.myddns.me/sensor/history/'+PtDevID, function(data) {
        if(data[0].Series != null){
            console.log("GET History");
            var res=[];
            var d = data[0].Series[0].values;
            HLtmp = [];
            HLhum = [];
            HLbar = [];
            HLpm1 = [];
            HLpm25 = [];
            HLpm10 = [];
            for (var i = 0, len = d.length; i < len; i++) {
                var tr = d[i][16];
                if(tr != null){
                    var a = d[i][16];
                    var time =new Date(a.slice(0,19));
                    switch(PtLayID){
                        case 1://MAPS
                            HLtmp.push([time,d[i][15]]);
                            HLhum.push([time,d[i][5]]);
                            HLpm25.push([time,d[i][11],d[i][9],d[i][10]]);
                            HLbar.push([time,d[i][2]]);
                        break;
                        case 0://AIRBOX
                        case 2://LASS
                        case 3://LASS4U
                            HLtmp.push([time,d[i][15]]);
                            HLhum.push([time,d[i][5]]);
                            HLpm25.push([time,d[i][11],d[i][9],d[i][10]]);
                        break;
                        case 4://g0I
                        case 5://g0P
                            HLtmp.push([time,d[i][15]]);
                            HLhum.push([time,d[i][5]]);
                            HLpm25.push([time,d[i][11]]);
                        break;
                    }   
                }         
            }
        }
        
    });
    HSortFin = true;
}
//前後端通訊   
function LassDecode(data, cb){
	var res = data.feeds;
	var src2id = {
		"last-all-airbox by IIS-NRL": 0,
		"last-all-maps by IIS-NRL": 1,
		"last-all-lass by IIS-NRL": 2,
		"last-all-lass4u by IIS-NRL": 3,
		"last-all-indie by IIS-NRL": 4,
		"last-all-probecube by IIS-NRL": 5,
	}
	var id = src2id[data.source];

	console.log('[LassDecode]', id, res);
	if(typeof id != 'undefined') {
		LassData[id] = res;
		SkioState[id] = true;
		cb(id,LassData[id]);
	}
}

var wsUri = MyWS+"/socket";
var ws = null;
function wsconnect() {
	ws = new WebSocket(wsUri);
	ws.onopen = function(evt) {
		console.log("ws open");
		//ws.send("5,open");
	}; 
	ws.onclose = function(evt) {
		console.log("ws close");
		var t = setTimeout(wsconnect, 1000)
	};
	ws.onmessage = function(evt) {
		//console.log(evt.data);
		switch(evt.data[0]){
		case "0":
			HLGet = true;
			getHistory();
			console.log(evt.data);
			break;
		case "5":
			console.log(evt.data);
			break;
		}
		LassDecode(JSON.parse(evt.data), function(id,a){
			console.log(id);
			upLaPop(id,a);
		});
	}; 
	ws.onerror = function(evt) {
		console.log("error:", evt);
	};
}
wsconnect()

//接收LASS歷史資料
/*socket.on('get_HL', function(data) {
    HLGet = true;
    console.log("Get req history data!");
    //重整資料
    sortHLData(data);
});*/
window.onbeforeunload  = function(){
    ws.onclose = function () {}; // disable onclose handler first
    ws.close()
    console.log("close ws");
}


//初始化介面Function
function CSSInit(){
    var _row1 = document.getElementById("row1");
    var _rCol1 = document.getElementById("rCol1");
    var _topMenu = document.getElementById("topMenu");
    var _row2 = document.getElementById("row2");
    var _rCol2 = document.getElementById("rCol2");
    
    //最上面橫條
    var _w1 = topMenu.offsetWidth;
    var _h1 = topMenu.offsetHeight;
    _row1.style.width = _w1+'px';
    _row1.style.height = _h1+'px';
    _rCol1.style.height = _h1+'px';
    _rCol1.style.width = _w1+'px';
    
    //放地圖的視窗
    var _h = window.innerHeight;
    var _w = window.innerWidth;
    _row2.style.width = _w+'px';
    _row2.style.height = (_h-_h1)+'px';
    _rCol2.style.padding = '0px 0px 0px 0px';
    _rCol2.style.height = (_h-_h1)+'px';
    _rCol2.style.width = _w+'px';
    _rCol2.style.left = '14px';
    _rCol2.style.backgroundColor = 'rgba(0,0,0,0.5)';    
    
    //MENU
    var _leftPMC = document.getElementById("leftPMC");
    _leftPMC.style.height = _h+'px';
    
    //地圖
    var _mapView = document.getElementById("mapView");
    _mapView.style.height = (_h-_h1)+'px';
    
    //基本設定彈出視窗
    var _cPMC = document.getElementById("cPMC");
    if(_w > 480){
        _cPMC.style.marginTop = '85px'
    }
    
    //底部彈出視窗
    var _bottomPM = document.getElementById("bottomPM");
    var _right_d1 = document.getElementById("right_d1");
    var _right_d2 = document.getElementById("right_d2");
    _bottomPM.style.width = '320px';
    //_right_d1 = '320px';
    //_right_d2 = '320px';
    var r = (_w-320)
    if(r > 0){
        _bottomPM.style.left = r/2 + 'px';
    }
    var _h2 = (_h>600) ? _h*0.5 : _h*0.7;
    //console.log(_h,_h2);
    var ticking = false;
    bottomPM.addEventListener("scroll",function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                var a = _bottomPM.scrollTop;
                var b = _bottomPM.scrollHeight - _bottomPM.clientHeight;
                var x = a / b;
                _bottomPM.style.height = (x*(_h2-145)+145)+'px';
            ticking = false;
            });
        }
        ticking = true;
    });
    //右側彈出視窗
    var _rightPM = document.getElementById("rightPM");
    var ticking1 = false;
    _rightPM.addEventListener("scroll",function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                var a = _rightPM.scrollLeft;
                var b = _rightPM.scrollWidth - _rightPM.clientWidth;
                var x = a / b;
                _rightPM.style.width = (x*(_w-320)+320)+'px';
            ticking1 = false;
            });
        }
        ticking1 = true;
    });
}
//視窗大小變化時
function windowResize(){
    //if(PopState & 0x04) rightPopup(false);
    CSSInit();
    
    //location.reload();
    console.log("window size chang CSS reset");
}

function rightPopup(popup){
    var _rightPM = document.getElementById("rightPM");
    var l = parseInt(_rightPM.style.right,10);
    var w = window.innerWidth;
    //console.log("rp: ",popup,l);
    if(popup){
        PopState |= 0x04;
        menuAnimate(true,0x04,_rightPM,l,320);
    }else{
        if(PopState & 0x04){
            _rightPM.scrollLeft = 0;
            _rightPM.style.width = 320+'px';
            menuAnimate(false,0x04,_rightPM,l,320);
            PopState &= ~0x04;
        }
    }
}

function btmPopup(popup,attr){
    var _bottomPM = document.getElementById("bottomPM");
    var l = parseInt(_bottomPM.style.bottom,10);
    var h = _bottomPM.offsetHeight;
    if(popup){
        upRightMenu(attr,function(){
            PopState |= 0x08;
            menuAnimate(true,0x08,_bottomPM,l,145);            
        }); 
    }else{
        if(PopState & 0x08){
            _bottomPM.scrollTop = 0;
            _bottomPM.style.height = 145+'px';
            menuAnimate(false,0x08,_bottomPM,l,145);
            PopState &= ~0x08;
        }
    }
}

function leftPopup(popup){
    var _leftPM = document.getElementById("leftPM");
    var l = parseInt(_leftPM.style.left,10);
    var _w = 240;
    if(popup){
        PopState |= 0x01;
        menuAnimate(true,0x01,_leftPM,l,_w);
    }else{
        if(PopState & 0x01){
            menuAnimate(false,0x01,_leftPM,l,_w);
            PopState &= ~0x01;
        }
    }
}

//彈出事件設定
function topBtnClick(){
    var _lMenubtn = document.getElementById("leftMenuBtn");
    var _cMenubtn = document.getElementById("cMenuBtn");
    
    var _leftPM = document.getElementById("leftPM");
    var _rightPM = document.getElementById("rightPM");
    var _rightPMC = document.getElementById("rightPMC");
    var _bottomPM = document.getElementById("bottomPM");
    var _cPM = document.getElementById("cPM");
    var _myLoad = document.getElementById("myLoad");
    var _mm = document.getElementById("mm");
    var _cPMclose = document.getElementById("cPMclose");
        
    _leftPM.style.left = '-240px';
    _bottomPM.style.bottom = '-145px';
    
    _rightPM.style.height = "450px";
    _rightPM.style.width = '320px';
    _rightPM.style.right = '-320px';
    _rightPMC.style.height = "450px";
    _rightPMC.style.width = 400+'px';
    _mm.style.height = "450px";
    _mm.style.width = 400+'px';
    
    
    //左側彈出
    _lMenubtn.onclick = function(){
        leftPopup(true);
    };
    //基本設定按鈕
    _cMenubtn.onclick = function(){
        _cPM.style.display = 'block';
        PopState |= 0x02;
        if(PopState & 0x04)rightPopup(false);
        //console.log(PopState);
    };
    _cPMclose.onclick = function(){
        _cPM.style.display = 'none';
        PopState &= ~0x02;
        console.log("123");
    };
    window.onclick = function(event) {
        if (event.target == _cPM) {
            _cPM.style.display = 'none';
            PopState &= ~0x02;
            
        }
        if (event.target == _myLoad) {
            _myLoad.style.display = 'none';
            clearInterval(window.fakeProgress);
            HLoadBrk = true;
        }
    }
    
}

//彈出動畫設定用
function animate({duration, draw, timing}) {
    let start = performance.now();
    requestAnimationFrame(function animate(time) {
        let timeFraction = (time - start) / duration;
        if (timeFraction > 1) timeFraction = 1;

        let progress = timing(timeFraction)

        draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        }
    });
}
function menuAnimate(clicked,btn,pm,l,w){
    if(clicked){
        
    //console.log(btn,l,w);
        if ( l == -w ){
            animate({
                duration: 600,
                timing: function(timeFraction) {
                  return Math.pow(timeFraction, 2);//timeFraction;
                },
                draw: function(progress) {
                    if(btn & 0x01)pm.style.left = ((1-progress) * l) + 'px';
                    if(btn & 0x04)pm.style.right = ((1-progress) * l) + 'px';
                    if(btn & 0x08)pm.style.bottom = ((1-progress) * l) + 'px';                    
                }
            });            
        }
    }else{
        if( l >= 0 ){
            animate({
                duration: 600,
                timing: function(timeFraction) {
                  return Math.pow(timeFraction, 2);//timeFraction;
                },
                draw: function(progress) {
                    if(btn & 0x01)pm.style.left = (-progress * w) + 'px';
                    if(btn & 0x04)pm.style.right = (-progress * w) + 'px';
                    if(btn & 0x08)pm.style.bottom = (-progress * w) + 'px'; 
                    
                }
            });
        }
    }
}

//更新座標
function getLocation(success,error) {
    if (!navigator.geolocation) {
        console.log("Geolocation is not supported by this browser.");
    }else{
        navigator.geolocation.getCurrentPosition(success, error,{timeout:10000});
    }
}

//切換 "All" checkbox 狀態
function changCheckBox(cb, onChecked){
    if(onChecked){
        if(CbState[1]&&CbState[2]&&CbState[3]&&CbState[4]&&CbState[5]&&CbState[6]){
            cb.checkbox('set checked');
        }else{
            cb.checkbox('set indeterminate');
        }
    }else{
        if(CbState[1]||CbState[2]||CbState[3]||CbState[4]||CbState[5]||CbState[6]){
            cb.checkbox('set indeterminate');
        }else{
            cb.checkbox('set unchecked');
        }
    }
}
//初始化checkbox
function setCheckBox(){    
    //初始狀態disable
    var htmlID=["#ck1","#ck2","#ck3","#ck4","#ck5","#ck6","#ck7","#ck8"];
    var _cb = new Array(8);
    var _cbEvent = new Array(8);
    //"airbox,maps,lass,...." checkbox event   
    function ckEvent(ck,cb,id){
        ck.checkbox({
            onChecked: function() {
                /*if(_cb1st[id] || (!SkioState[id-1])){
                    ck.checkbox('uncheck');
                    alert("Lass data not yet");
                }else{*/
                    CbState[id] = true;
                    changCheckBox(cb,true);
                    creatMkLyr(id-1,LassData[id-1]);
                //}
            },
            onUnchecked: function() {
                if(_cb1st[id]){
                    
                }else{
                    CbState[id] = false;
                    changCheckBox(cb,false);
                    deletMkLyr(id-1);
                }
            }   
        });    
    }
    //建立重複事件
    for(var i=0; i<8; i++){
        _cb[i] = $(htmlID[i]);
        if(i>0){
            _cb[i].checkbox('uncheck');
            //_cb[i].checkbox('set disabled');
            if(i!=7){
                _cbEvent[i-1] =ckEvent(_cb[i],_cb[0],i);
            }
        }
    }
    //"all" checkbox event
    _cb[0].checkbox({
        onChecked: function() {
            CbState[0] = true;
            if(!_cb1st[1])_cb[1].checkbox('check');
            if(!_cb1st[2])_cb[2].checkbox('check');
            if(!_cb1st[3])_cb[3].checkbox('check');
            if(!_cb1st[4])_cb[4].checkbox('check');
            if(!_cb1st[5])_cb[5].checkbox('check');
            if(!_cb1st[6])_cb[6].checkbox('check');
        },
        onUnchecked: function() {
            CbState[0] = false;
            if(!_cb1st[1])_cb[1].checkbox('uncheck');
            if(!_cb1st[2])_cb[2].checkbox('uncheck');
            if(!_cb1st[3])_cb[3].checkbox('uncheck');
            if(!_cb1st[4])_cb[4].checkbox('uncheck');
            if(!_cb1st[5])_cb[5].checkbox('uncheck');
            if(!_cb1st[6])_cb[6].checkbox('uncheck');
        }
    });
            
}

//初始化地圖下拉式選單
function setDropDownMap(){
    
    var dropDownMap = [{
            name: '街道',
            value: 'mapbox.streets',
            selected: true
        },{
            name: '衛星',
            value: 'mapbox.satellite',
            selected: false
        },{
            name: '衛星+街道',
            value: 'mapbox.streets-satellite',
            selected: false
        },{
            name: 'emerald',
            value: 'mapbox.emerald',
            selected: false
    }];
    
    $('#mapCange').dropdown({
        values: dropDownMap,
        forceSelection: false, 
        selectOnKeydown: false, 
        showOnFocus: false,
        //on: "hover",
        onChange: function (value, text, $selectedItem) {
            //確認地圖建立後才能切換
            if(BaseLyr){
                BaseLyr.remove();
                BaseLyr = L.tileLayer(MbUrl, {id: value, attribution: MbAttr});   
                Map_L.addLayer(BaseLyr);                
            }
        }
    });
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function distance(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;

    var dLat = degreesToRadians(lat2-lat1);
    var dLon = degreesToRadians(lon2-lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return earthRadiusKm * c * 1000;//meter
}
