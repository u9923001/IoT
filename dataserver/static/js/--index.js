/*
█▀▄ ▄▀▄ █▀▀▄ ▄▀▄ █▄░▄█ █▀▀ ▀█▀ █▀▀ █▀▀▄     ▀ █▄░█ ▀ ▀█▀ 
█░█ █▀█ █▐█▀ █▀█ █░█░█ █▀▀ ░█░ █▀▀ █▐█▀     █ █░▀█ █ ░█░ 
█▀░ ▀░▀ ▀░▀▀ ▀░▀ ▀░░░▀ ▀▀▀ ░▀░ ▀▀▀ ▀░▀▀     ▀ ▀░░▀ ▀ ░▀░ 

*/
//Map Type
/*value: 'mapbox.light',
value: 'mapbox.dark',
value: 'mapbox.satellite',
value: 'mapbox.wheatpaste',
value: 'mapbox.comic',
value: 'mapbox.outdoors',
value: 'mapbox.run-bike-hike',
value: 'mapbox.pencil',
value: 'mapbox.pirates',
value: 'mapbox.high-contrast',*/  
var DropDownMap = [{
        name: 'streets',
        value: 'mapbox.streets',
        selected: false
    },{
        name: 'streets-satellite',
        value: 'mapbox.streets-satellite',
        selected: false
    },{
        name: 'streets-basic',
        value: 'mapbox.streets-basic',
        selected: false
    },{
        name: 'emerald',
        value: 'mapbox.emerald',
        selected: false
}];

const MbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
'Imagery © <a href="http://mapbox.com">Mapbox</a>';

const MbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png32?access_token=pk.eyJ1IjoidTk5MjMwMDEiLCJhIjoiY2o3YWdqeGZoMGZhZDJxbzFtZ2wxMWswZiJ9.rieTxvxJSPfaerXHPjMIiA';

var _position=[24.951904, 121.226521];

var InitSet = {
    map_basemap : "mapbox.streets", //see dropdownMap
    map_container : "arcgis_map_view", //need to match HTML id
    map_center : L.latLng(_position[0], _position[1]),
    map_zoom : 12
};

//感測點顏色, ICON種類:http://fontawesome.io/icons/
 
var userMk = L.ExtraMarkers.icon({
    icon: 'fa-user-circle',
    markerColor: 'blue',
    shape: 'star',
    prefix: 'fa'
});
var SenColor =['#A42D00','#888800','#227700','#00BBFF','#000088','#770077'];
var SenIcon0 = {
    icon: 'fa-building',
    iconColor: SenColor[0],
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
};
var SenIcon1 = {
    icon: 'fa-building',
    iconColor: SenColor[1],
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
};
var SenIcon2 = {
    icon: 'fa-building',
    iconColor: SenColor[2],
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
};
var SenIcon3 = {
    icon: 'fa-building',
    iconColor: SenColor[3],
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
};
var SenIcon4 = {
    icon: 'fa-building',
    iconColor: SenColor[4],
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
};
var SenIcon5 = {
    icon: 'fa-building',
    iconColor: SenColor[5],
    markerColor: 'white',
    shape: 'square',
    prefix: 'fa'
};
var Button_ui = [/*"ui inverted button",*/"ui inverted red button","ui inverted orange button",    "ui inverted yellow button","ui inverted olive button","ui inverted green button","ui inverted teal button","ui inverted blue button","ui inverted violet button","ui inverted purple button","ui inverted pink button","ui inverted brown button"/*"ui inverted grey button","ui inverted black button"*/];
var ChartColor =["#0080FF","#548C00","#9F4D95"];

//存checkbox、socketIO狀態
var CbState = [false,false,false,false,false,false];
var SkioState = [false,false,false,false,false,false];
var MapPopup = false;
var HSortFin = true;
var HLoadBrk = false;
var HCharFin = false;
var HLGet = false;
//Checkbox用
var _cb1st = [true,true,true,true,true,true];
var _cb = new Array(7);
_cb[0] = $('#page_1_item_2');
_cb[1] = $('#page_1_item_3');
_cb[2] = $('#page_1_item_4');
_cb[3] = $('#page_1_item_5');
_cb[4] = $('#page_1_item_6');
_cb[5] = $('#page_1_item_7');
_cb[6] = $('#page_1_item_8');

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


//初始化UI
setUI();

//地圖初始化
var BaseLyr = L.tileLayer(MbUrl, {id: InitSet.map_basemap, attribution: MbAttr});
var Map = L.map(InitSet.map_container, {
    center: InitSet.map_center,
    zoom: InitSet.map_zoom
});
Map.addLayer(BaseLyr);

//標記使用者 追蹤功能
//讀取裝置座標 移動座標
var UserMarker;
var localFirst = true;
var ppp=0;
var qqq=0;
function getLocation(track) {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        clearInterval(window.trackProg);
        return;
    }
    
    function success(position) {
        var latitude  = position.coords.latitude;
        var longitude = position.coords.longitude;
        //console.log(latitude, longitude);
        if(track == 0){//更新使用者位置
            if(localFirst){
                var parisKievLL = [[latitude,longitude],[latitude,longitude]];//,{icon: userMk} 
                UserMarker = L.Marker.movingMarker(parisKievLL, [8000],{icon: userMk});
                Map.addLayer(UserMarker);
                
                Map.setView([latitude,longitude],17);
                localFirst = false;
            }else{
                UserMarker.addLatLng([latitude+ppp,longitude+qqq],[8000],{icon: userMk});
                UserMarker.start();
                //console.log(UserMarker._latlng);
                if(UserMarker.isStarted()){
                    if(UserMarker.isEnded()){
                        console.log("is end");
                    }else{
                        
                    }
                    if(UserMarker.isRunning()){
                        console.log("isRun");
                    }                
                }else{
                    console.log("not start");
                    
                }
                
            }
        }else if(track==1){//設定HOME
            Map.setView([latitude,longitude],15);
        }else{//設定trace
            Map.setView([latitude,longitude],17);
        }
    };
    
    function error() {
        alert("Geolocation is not supported by this browser.");
        clearInterval(window.trackProg);
    };
    
    navigator.geolocation.getCurrentPosition(success, error);
}

getLocation(0);
function ggg(s){
    if(s)
        UserMarker.enablePermanentHighlight();
    else
        UserMarker.disablePermanentHighlight();
}
window.trackProg = setInterval(function() {
    getLocation(0);
},5000)    

var trackControl = L.Control.extend({
    options: {
        position: 'topleft' 
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    },
    onAdd: function (Map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.backgroundColor = 'white';
        container.style.width = '38px';
        container.style.height = '38px';
        container.value = 0;
        container.innerHTML ='<i class="fa fa-crosshairs fa-3x" aria-hidden="true"></i>'
        container.onclick = function(){
            getLocation(2);
        };
        return container;
    }
});
Map.addControl(new trackControl());
var homeControl = L.Control.extend({
    options: {
        position: 'topleft' 
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    },
    onAdd: function (Map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.backgroundColor = 'white';
        container.style.width = '38px';
        container.style.height = '38px';
        container.innerHTML ='<i class="fa fa-home fa-3x" aria-hidden="true"></i>'
        container.onclick = function(){
            getLocation(1);
        };
        return container;
    }
});
Map.addControl(new homeControl());
var rigntMenuCtl = L.Control.extend({
    options: {
        position: 'topright' 
        //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    },
    onAdd: function (Map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.backgroundColor = 'white';
        container.style.width = '38px';
        container.style.height = '38px';
        container.value = 0;
        container.innerHTML ='<i class="fa fa-home fa-3x" aria-hidden="true"></i>'
        container.onclick = function(){
            var e1 = getEle("rpmL");
            var e2 = getEle("rpmR");
            var h = window.innerHeight;
            var w = window.innerWidth;
            if(container.value == 0){
                setEClass(e1,"sixteen wide column");
                setEClass(e2,"four wide column");
                container.value = 1;                
            }else{
                if(w<640)
                {
                    setEClass(e1,"six wide column");
                    setEClass(e2,"ten wide column");  
                }else{
                    setEClass(e1,"twelve wide column");
                    setEClass(e2,"four wide column");  
                    
                }
                container.value = 0;
            }
        };
        return container;
    }
});
Map.addControl(new rigntMenuCtl());
//////////////////////////////////////////////////////////////////////////////////////////////////////////////




//Marker Group 插件-減少Marker數量
var MkCGp = L.markerClusterGroup({ disableClusteringAtZoom : 15,spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true });
//建立Marker圖層
function creatMkLyr(lyrIds, data){
    var res=[];
    var redMarker;
    var aherf="";
    //切換感測點ICON
    switch(lyrIds){
        case 0:
            redMarker = L.ExtraMarkers.icon(SenIcon0);
        break;
        case 1:
            redMarker = L.ExtraMarkers.icon(SenIcon1);
        break;
        case 2:
            redMarker = L.ExtraMarkers.icon(SenIcon2);
        break;
        case 3:
            redMarker = L.ExtraMarkers.icon(SenIcon3);
        break;
        case 4:
            redMarker = L.ExtraMarkers.icon(SenIcon4);
        break;
        case 5:
            redMarker = L.ExtraMarkers.icon(SenIcon5);
        break;
    }
    //建立Marker
    for (var i = 0, len = data.length; i < len; i++) {
        var mk = L.marker(
            L.latLng(data[i].Latitude, data[i].Longitude), {icon: redMarker, attributes: data[i], layerid : lyrIds});        
        
        //插入Marker popup事件
        MkCGp.addLayer(mk.bindPopup('<button id="'+data[i].Device_id+'" class="ui inverted blue button">查詢歷史資料</button>'));
        res.push(mk);
    }
    //加到圖層
    Map.addLayer(MkCGp);
    LaMkData[lyrIds] = res;
}

//刪除Marker圖層
function deletMkLyr(lyrIds){
    var data = LaMkData[lyrIds];
    for (var i = 0, len = data.length; i < len; i++) {
        MkCGp.removeLayer(data[i]);
    }
}    

//更新資料
function upLaPop(lyrIds, newAttr){
    if(MapPopup){//確認Map彈出視窗
        if(lyrIds == PtLayID){//確認圖層 
            for (var i = 0, len = newAttr.length; i < len; i++) {
                if(PtDevID == newAttr[i].Device_id){
                    console.log("match " + PtDevID);
                    upRightMenu(newAttr[i]);
                    break;
                }
            }
        }
    }
}



//點擊地圖事件
Map.on('click', function(e) {
    
    //清除記憶資料
    PtLayID = -1;
    PtDevID = "";
    MapPopup = false;
    //還原基礎設定頁面
    cRMenu(true);
    //資料顯示清除
    clRightMenu();
    
});

//點擊感測站POPUP事件
Map.on('popupopen', function(e) {
    var attr = e.popup._source.options.attributes;
    var lyrid = e.popup._source.options.layerid;
    var repeat = 0;//紀錄按鈕次數
    
    //記住點擊資料-更新用
    PtLayID = lyrid;
    PtDevID = attr.Device_id;
    MapPopup = true;
    //點擊時切換到資料顯示頁面
    cRMenu(false);
    //資料顯示更新
    upRightMenu(attr);
           
    //點擊歷史資料按鈕
    var e0 = getEle(PtDevID);
    e0.onclick = function(){
        repeat++;
        //上筆資料如果處理結束&&第一次，請求歷史資料
        if(repeat==1){
            if(HSortFin){
                socket.emit("req_HL", PtLayID+","+PtDevID);
                console.log("send reqHL");
                HSortFin = false;
                HLGet = false;
                waitHLdata();
            }else{
                repeat = 0;
                var mp3 = '<audio id="bgMusic"><source = src="./audio/translate_tts.mp3" type="audio/mp3"></audio>';
                var malert = getEle("malert");
                malert.innerHTML = mp3;
                
                var myalert = getEle('myAlert');
                myalert.style.display = "block";
                var maladu = getEle("bgMusic").play();
                
                var malbtn = getEle("malbtn");
                malbtn.onclick = function(){
                    malert.innerHTML = "";
                    myalert.style.display = "none";
                }
            }
        }else{
            if(HSortFin){
                popHWd();   
            }else{
                waitHLdata();
            }
        }
    };
    
    //無聊用       
    var ggg_c = 7;
    var ggg_s = false; 
    e0.onmouseover = function(){ggg_s = true;};
    e0.onmouseout = function(){
        if(ggg_s){
            setEClass(e0, Button_ui[ggg_c]);
            ggg_s = false;
            ggg_c ++;
            if(ggg_c > Button_ui.length-1)
                ggg_c = 0;
        }
    };
    
});

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
    var mw = getEle('myLoad');//讀條視窗
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
                if(c<4){
                    c++;
                    n = setLoad(false,1,100);
                }else{
                    if(HSortFin){//資料處理完成
                        if(n != 100){
                            n = setLoad(false,2,100);
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
                    }else{
                        n = setLoad(false,2,100);
                    }
                }
            }else{
                i=i+1
                n = setLoad(false,i,90);
            }
        }else{//觸發break   
            clearInterval(window.fakeProgress);            
        }
    }, 200);
        
}

//排序Object資料 HSortFin = true;
function sortObject(data, cb){
    data.sort(function (a, b) {
        if (a[0] > b[0]) {
            return 1;
        }
        if (a[0] < b[0]) {
            return -1;
        }
        return 0;
    });
    cb(data);
}
function sortHLData(data){
    
    HLtmp = [];
    HLhum = [];
    HLbar = [];
    HLpm1 = [];
    HLpm25 = [];
    HLpm10 = [];
    //整理成圖表用格式
    sortObject(data, function(){
        for (var i = 0, len = data.length; i < len; i++) {
            var time = new Date(data[i][0]*1000);;
            switch(PtLayID){
                case 1://MAPS
                    HLtmp.push([time,data[i][1]/10.0]);
                    HLhum.push([time,data[i][2]]);
                    HLpm25.push([time,data[i][3]/10.0,data[i][4]/10.0,data[i][5]/10.0]);
                    HLbar.push([time,data[i][6]/10.0]);
                break;
                case 0://AIRBOX
                case 2://LASS
                case 3://LASS4U
                    HLtmp.push([time,data[i][1]/10.0]);
                    HLhum.push([time,data[i][2]]);
                    HLpm25.push([time,data[i][3]/10.0,data[i][4]/10.0,data[i][5]/10.0]);
                break;
                case 4://g0I
                case 5://g0P
                    HLtmp.push([time,data[i][1]/10.0]);
                    HLhum.push([time,data[i][2]]);
                    HLpm25.push([time,data[i][3]/10]);
                break;
            }            
        }
    });
    HSortFin = true;
}

//清除舊圖 HCharFin = false
function clearChart(){
    var ec = getEle("mm");
    ec.innerHTML = "<div class='ui grid'><div class='twelve wide column'><div id='m1'></div></div><div class='four wide column'><div id='m1_l'></div></div><div class='twelve wide column'><div id='m2'></div></div><div class='four wide column'><div id='m2_l'></div></div><div class='twelve wide column'><div id='m3'></div></div><div class='four wide column'><div id='m3_l'></div></div><div class='twelve wide column'><div id='m4'></div></div><div class='four wide column'><div id='m4_l'></div></div></div>";
    HCharFin = false;
}

//彈出歷史資料視窗
function popHWd(){    
    //顯示視窗
    var e1 = getEle('myModal');
    e1.style.display = "block";
    //畫圖
    creatHChart();    
}
function drawHLBase(){
    var lab = '';
    var e0 = getEle("mm");
    var w = getEWid(e0-40);
    var h = 360;
    
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
    
    var ctx1 = getEle("m1");
    var ctx2 = getEle("m2");
    var ctx3 = getEle("m3");
    var g1 = new Dygraph(ctx1,HLtmp,{
        ylabel:"&deg;C",
        xlabel:"Time(GMT+8)",
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
        hideOverlayOnMouseOut: false,
        labelsDiv: document.getElementById('m1_l'),
        labelsSeparateLines: true,
        labelsKMB: true,
        colors: [ChartColor[0],ChartColor[1],ChartColor[2]]
    });
    var g2 = new Dygraph(ctx2,HLhum,{
        ylabel:"Percent %",
        xlabel:"Time(GMT+8)",
        labels: ['Time', 'Humidity'],
        width: w,
        height: h,
        animatedZooms:true,
        stepPlot: false,
        fillGraph: true,
        stackedGraph: false,
        includeZero: false,
        showRangeSelector: true,
        animatedZooms:false,
        legend: "always",
        hideOverlayOnMouseOut: false,
        title:'<h4 class="ui horizontal divider header"><i class="bar chart icon"></i>Humidity%</h4>',
        labelsDiv: document.getElementById('m2_l'),
        labelsSeparateLines: true,
        labelsKMB: true,
        colors: [ChartColor[0],ChartColor[1],ChartColor[2]]
    });
    var g3 = new Dygraph(ctx3,HLpm25,{
        ylabel:"μg/m3",
        xlabel:"Time(GMT+8)",
        labels: lab,
        width: w,
        height: h,
        animatedZooms:true,
        stepPlot: false,
        fillGraph: true,
        stackedGraph: true,
        includeZero: false,
        showRangeSelector: true,
        animatedZooms:false,
        legend: "always",
        hideOverlayOnMouseOut: false,
        title:'<h4 class="ui horizontal divider header"><i class="bar chart icon"></i>懸浮粒子μg/m3</h4>',
        highlightCircleSize: 2,
        strokeWidth: 1,
        strokeBorderWidth: null,
        highlightSeriesOpts: {
          strokeWidth: 1,
          strokeBorderWidth: 1,
          highlightCircleSize: 3
        },
        labelsDiv: document.getElementById('m3_l'),
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
        var ctx4 = getEle("m4");
        var g4 = new Dygraph(ctx4,HLbar,{
            ylabel:"hPa",
            xlabel:"Time(GMT+8)",
            labels: ['Time', 'Pressure'],
            width: w,
            height: h,
            animatedZooms:true,
            stepPlot: false,
            fillGraph: true,
            stackedGraph: true,
            includeZero: false,
            showRangeSelector: true,
            animatedZooms:false,
            legend: "always",
            hideOverlayOnMouseOut: false,
            title:'<h4 class="ui horizontal divider header"><i class="bar chart icon"></i>  氣壓</h4>',
        labelsDiv: document.getElementById('m4_l'),
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




    
/*    
    var cc=0;
    function moveCheck(data)
    {
        $('#page_1_item_9').checkbox({
            onChecked: function() {
                console.log("--- Move ---");
                creatMoveMarkers(data);
                cc=1;
            },
            onUnchecked: function() {
                console.log("--- Un Move ---");
                deletMoveMarkers();
            }
        });
        if(cc)
        {
            upadeMoveMarkers(data);
        }
    }
    
    var moveMarkersList=[];
    function creatMoveMarkers(data)
    {
        data.forEach(function(item) {
            
            console.log("move markers init");
            var parisKievLL = [[item.gps_lat,item.gps_lon],[item.gps_lat,item.gps_lon]];
            var marker1 = L.Marker.movingMarker(parisKievLL, [8000]).addTo(map);
            moveMarkersList.push({0:item.device_id,1:marker1});
        });
        //console.log(moveMarkersList);
    }
    function upadeMoveMarkers(data)
    {
        data.forEach(function(item) {//new date
            
                    moveMarkersList.forEach(function(item3){
                        if(item3[0] == item.device_id)//id match
                        {
                            //console.log("match");
                            //move
                            var n = item3[1].getLatLng();
                            //console.log(n);
                            var speed=10000;
                            distance(n.lat,n.lng,item.gps_lat,item.gps_lon,function(res){
                                
                                if(res>200)
                                {
                                    speed = 5000;
                                }
                                console.log(item.device_id+': '+res+'m, speed: '+speed);
                            });
                            item3[1].addLatLng([item.gps_lat,item.gps_lon],[speed]);
                            if(!item3[1].isStarted())
                            {
                                console.log("not start");
                                if(item3[1].isEnded())
                                {
                                    console.log("end");
                                    item3[1].resume();
                                }
                                else
                                {
                                    console.log("call start");
                                    item3[1].start();
                                }
                                
                            }
                            else
                            {
                                console.log("continue");
                            }
                        }
                    });
               
        });
    }
    function deletMoveMarkers()
    {
        moveMarkersList.forEach(function(item) {
            map.removeLayer(item[1]);
        });
    }
    
   
        
    map.on('popupopen', function(e) {
        var marker = e.popup._source;
        MapPopup = true;
        //update attributes
        //console.log(marker);
        var layid = marker.options.layerid;
        InitSet.past_layer_id  = layid;
        InitSet.past_attributes = marker.options.attributes;
        
        for(var i=0;i<dataMap.length;i++)
        {
            if(dataMap[i] == layid)
            {
                var b = LassData[i].slice();
                updateLassLayer(layid,marker.options.attributes, b);   
            }
        }
      
    });
        
   
    function creatMarkers(lyrName,color,data)
    {
        var res=[];
		data.forEach(function(item) {
            
			var title = '<h2 class="ui blue header" id="'+item.Device_id+'_title"></h2><div class="ui labeled disabled input"><div class="ui label">溫度</div><input type="text" id="'+item.Device_id+'_tmp"></div>'+'<div class="ui labeled disabled input"><div class="ui label">濕度</div><input type="text" id="'+item.Device_id+'_hum"></div>'+'<div class="ui labeled disabled input"><div class="ui label">PM10</div><input type="text" id="'+item.Device_id+'_pm10"></div>'+'<div class="ui labeled disabled input"><div class="ui label">PM2.5</div><input type="text" id="'+item.Device_id+'_pm25"></div>'+'<div class="ui labeled disabled input"><div class="ui label">PM1</div><input type="text" id="'+item.Device_id+'_pm1"></div>'+'<div class="ui labeled disabled input"><div class="ui label">time</div><input type="text" id="'+item.Device_id+'_time"></div>';
			var marker = L.marker(L.latLng(item.Latitude, item.Longitude), { attributes: item, layerid : lyrName});
			marker.bindPopup(title);
			markersGp.addLayer(marker);
            res.push(marker);
        })
		map.addLayer(markersGp);
        dataMarkars[lyrName] = res;
    }
   
*/
/*
 ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗   ██╗███╗   ██╗██╗ ██████╗ █████╗ ████████╗███████╗
██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║   ██║████╗  ██║██║██╔════╝██╔══██╗╚══██╔══╝██╔════╝
██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║██╔██╗ ██║██║██║     ███████║   ██║   █████╗  
██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║██║╚██╗██║██║██║     ██╔══██║   ██║   ██╔══╝  
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║╚██████╗██║  ██║   ██║   ███████╗
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
*/
//前後端通訊   
var socket = io();    
//接收LASS歷史資料
socket.on('get_HL', function(data) {
    HLGet = true;
    console.log("Get req history data!");
    //重整資料
    hl_data = data.slice();
    sortHLData(hl_data);
});
//LASS感測資料接收
socket.on('date0', function(data) {
    
    SkioState[0] = true;
    LassData[0]=data.slice();
    upLaPop(0,LassData[0]);
    
    //第一次資料接收執行
    if(_cb1st[0]){
        _cb[0].checkbox('set enabled');
        _cb1st[0] = false;
    }
    
    //console.log("get airbox "+new Date());
    //console.log(data);
});
socket.on('date1', function(data) {
    
    SkioState[1] = true;
    LassData[1]=data.slice();
    upLaPop(1,LassData[1]);
        
    if(_cb1st[1]){
        _cb[1].checkbox('set enabled');
        _cb1st[1] = false;
    }        
    //console.log("get maps "+new Date());
    //console.log(data);
});
socket.on('date2', function(data) {
    
    SkioState[2] = true;
    LassData[2]=data.slice();
    upLaPop(2,LassData[2]);
    
    if(_cb1st[2]){
        _cb[2].checkbox('set enabled');
        _cb1st[2] = false;
    }
    //console.log("get lass "+new Date());
    //console.log(data);
});
socket.on('date3', function(data) {
    
    SkioState[3] = true;
    LassData[3]=data.slice();
    upLaPop(3,LassData[3]);
    
    if(_cb1st[3]){
        _cb[3].checkbox('set enabled');
        _cb1st[3] = false;
    }
    //console.log("get lass4u "+new Date());
    //console.log(data);
});
socket.on('date4', function(data) {
    
    SkioState[4] = true;
    LassData[4]=data.slice();
    upLaPop(4,LassData[4]);
    
    if(_cb1st[4]){
        _cb[4].checkbox('set enabled');
        _cb1st[4] = false;
    }
    //console.log("get g0v indie "+new Date());
    //console.log(data);
});
socket.on('date5', function(data) {
    
    SkioState[5] = true;
    LassData[5]=data.slice();
    upLaPop(5,LassData[5]);
    
    if(_cb1st[5]){
        _cb[5].checkbox('set enabled');
        _cb1st[5] = false;
    }
    //console.log("get g0v probecube "+new Date());
    //console.log(data);
});
//移動式感測資料接收
socket.on('dateMove4', function(data) {
    MoveData=data;
    //moveCheck(MoveData);
    InitSet.page_1_item_9 = true;
    
    //console.log(data);
});
socket.on('debug', function(data){
    console.log(data);
});
/*
██╗   ██╗██╗     ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗ 
██║   ██║██║    ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝ 
██║   ██║██║    ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
██║   ██║██║    ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
╚██████╔╝██║    ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
 ╚═════╝ ╚═╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝ 
*/                                                     
//顯示介面相關設定
function getEle(id){return document.getElementById(id);}
function setETop(e, t){e.style.top = t + "px";}
function setEHig(e, h){e.style.height = h + "px";}
function getEHig(e){return e.offsetHeight;}
function setEWid(e, w){e.style.height = w + "px";}
function getEWid(e){return e.offsetWidth;}
function setEClass(e, c){e.setAttribute("class", c);}
function setEColor(e, c){e.style.color = c;}
function setBgColor(e, c){e.style.backgroundColor  = c;}
function setDisplay(e, c){e.style.display  = c;}
function setOpacity(e, c){e.style.opacity  = c;}
function setELeft(e, c){e.style.left = c + "px";}
function getELeft(e){return parseInt(e.style.left, 10);}

//設定初始介面寬高
function setWidthHeight(){    
    var h = window.innerHeight;
    var e0 = getEle("left_menu_content");
    var e1 = getEle("center_container_left");
    var e2 = getEle("center_container_right");
    //var e3 = getEle("right_container");
    setEHig(e0, h);
    setEHig(e1, h);
    setEHig(e2, h);
    //setEHig(e3, h);
    
    var w = getEHig(e1);
    var e4 = getEle("load_map_view");
    var e5 = getEle("arcgis_map_view");
    setEWid(e4, w);
    var h1 = getEHig(e4);
    setEHig(e5, h1);
}

//更新右側資料顯示
var _gauge = new Gauge(getEle("myGauge"));
var _meter = getEle("tp_scl");
function upRightMenu(attr){
    var e1 = getEle("d_se");
    var e2 = getEle("d_te");
    var e3 = getEle("d_de");
    var e4 = getEle("d_hy");
    var e5 = getEle("d_p1");
    var e6 = getEle("d_p5");
    var e7 = getEle("d_p0");
    var e8 = getEle("d_ve");
    var e9 = getEle("d_ste");
    var ea = getEle("d_br");
    var eb = getEle("d_tz");
    
    var ec = getEle("ri1");
    var ed = getEle("ri2");
    var ee = getEle("ri3");
    var ef = getEle("g_text");
    var f0 = getEle("t_text");
    
    var t0 = attr.Temperature/10.0;
    //詳細資料
    e1.innerHTML = attr.SiteName;
    e2.innerHTML = t0;
    e3.innerHTML = attr.Device;
    e4.innerHTML = attr.Humidity;
    e5.innerHTML = attr.Pm1/10.0;
    e6.innerHTML = attr.Pm25/10.0;
    e7.innerHTML = attr.Pm10/10.0;
    e8.innerHTML = attr.Voltage;
    e9.innerHTML = attr.Satellites;
    ea.innerHTML = attr.Barometer/10.0;
    var date = new Date(attr.Timestamp*1000);
    var ye = date.getFullYear();
    var mo = date.getMonth() + 1;
    var da = date.getDate();
    var ho = date.getHours();
    var mi = (date.getMinutes() < 10) ? "0"+date.getMinutes() : date.getMinutes();
    var se = (date.getSeconds() < 10) ? "0"+date.getSeconds() : date.getSeconds();
    eb.innerHTML = " "+ye+"/"+mo+"/"+da+" "+ho+":"+mi+":"+se;
    
    //PM2.4狀態
    var b,d;
    if(attr.Pm25/10 < 17){
        b = '<h2 class="ui olive header" style="margin-top: 10px;padding-right: 15px;">良好</h2><p>正常戶外活動。</p>';
        d = '<i class="fa fa-smile-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25/10 <36){
        b = '<h2 class="ui green header" style="margin-top: 10px;padding-right: 15px;">良好</h2><p>正常戶外活動。</p>';
        d = '<i class="fa fa-smile-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25/10 <45){
        b = '<h2 class="ui yellow header" style="margin-top: 10px;padding-right: 15px;">中等</h2><p>敏感性族群若發生癥狀時，應減少戶外活動。</p>';
        d = '<i class="fa fa-meh-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25/10 <54){
        b = '<h2 class="ui orange header" style="margin-top: 10px;padding-right: 15px;">中等</h2><p>敏感性族群若發生癥狀時，應減少戶外活動。</p>';
        d = '<i class="fa fa-meh-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25/10 <62){
        b = '<h2 class="ui red header" style="margin-top: 10px;padding-right: 15px;">不佳</h2><p>考慮減少戶外活動。</p>';
        d = '<i class="fa fa-frown-o fa-5x" aria-hidden="true" style="margin-top: 10px;"></i>'
    }else if(attr.Pm25/10 <71){
        b = '<h2 class="ui pink header" style="margin-top: 10px;padding-right: 15px;">危險</h2><p>考慮減少戶外活動。</p>';
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
    
    setETop(_meter, 65 - temp);
    setEHig(_meter, 5 + temp);
    
}

//清除右側資料顯示
function clRightMenu(){
    var e1 = getEle("d_se");
    var e2 = getEle("d_te");
    var e3 = getEle("d_de");
    var e4 = getEle("d_hy");
    var e5 = getEle("d_p1");
    var e6 = getEle("d_p5");
    var e7 = getEle("d_p0");
    var e8 = getEle("d_ve");
    var e9 = getEle("d_ste");
    var ea = getEle("d_br");
    var eb = getEle("d_tz");
    
    var ec = getEle("ri1");
    var ed = getEle("ri2");
    var ef = getEle("g_text");
    var f0 = getEle("t_text");
    
    e1.innerHTML = "";
    e2.innerHTML = "";
    e3.innerHTML = "";
    e4.innerHTML = "";
    e5.innerHTML = "";
    e6.innerHTML = "";
    e7.innerHTML = "";
    e8.innerHTML = "";
    e9.innerHTML = "";
    ea.innerHTML = "";
    eb.innerHTML = "";
    ec.innerHTML = "";
    ed.innerHTML = "";
    
    
    ef.innerHTML = 0;
    _gauge.value(0);
    
    f0.innerHTML = '0&deg;C';
    
    setETop(_meter, 55 );
    setEHig(_meter, 15 );

}

//切換右側介面顯示
function cRMenu(p)
{
    var e1 = getEle("right_menu_1");    
    var e2 = getEle("right_menu_2");
    var e3 = getEle("right_page_1");    
    var e4 = getEle("right_page_2");
    if(p){
        //顯示基礎設定
        setEClass(e1, "item active");
        setEClass(e2, "item");
        setDisplay(e3, "block");
        setDisplay(e4, "none");
    }else{
        //資料顯示
        setEClass(e2, "item active");
        setEClass(e1, "item");
        setDisplay(e4, "block");
        setDisplay(e3, "none");
    }
}

//右測資料介面初始化
function setMenu(){
    
    var e0 = getEle("left_menu_content");    
    var e1 = getEle("right_menu_1");    
    var e2 = getEle("right_menu_2");
    var e3 = getEle("right_page_1");    
    var e4 = getEle("right_page_2");   
    
    //初始顯示基本設定
    setEClass(e1, "item active");
    setEClass(e2, "item");
    setDisplay(e3, "block");
    setDisplay(e4, "none");
    
    //right_menu_1 "基本設定"
    e1.onclick = function(){ 
        setEClass(e1, "item active");
        setEClass(e2, "item");
        setDisplay(e3, "block");
        setDisplay(e4, "none");
    };
    //right_menu_2 "資料顯示"
    e2.onclick = function(){
        setEClass(e2, "item active");
        setEClass(e1, "item");
        setDisplay(e4, "block");
        setDisplay(e3, "none");
    };
    
    //詳細資料初始未展開
    var data_visual = false;
    //資料顯示中的詳細資料
    var e5 = getEle("right_d1");
    var e6 = getEle("right_d2");
    e5.onclick = function(){
        if(data_visual){
            setEClass(e5, "title");
            setEClass(e6, "content");
        }else{
            setEClass(e5, "active title");
            setEClass(e6, "active content");
        }
        data_visual = !data_visual;
    };
}

//切換 "All" checkbox 狀態
function changCheckBox(onChecked){
    if(onChecked){
        if(CbState[0]&&CbState[1]&&CbState[2]&&CbState[3]&&CbState[4]&&CbState[5]){
            _cb[6].checkbox('set checked');
        }else{
            _cb[6].checkbox('set indeterminate');
        }
    }else{
        if(CbState[0]||CbState[1]||CbState[2]||CbState[3]||CbState[4]||CbState[5]){
            _cb[6].checkbox('set indeterminate');
        }else{
            _cb[6].checkbox('set unchecked');
        }
    }
}

//初始化checkbox
function setCheckBox(){    
    //初始狀態disable
    _cb[0].checkbox('uncheck');
    _cb[1].checkbox('uncheck');
    _cb[2].checkbox('uncheck');
    _cb[3].checkbox('uncheck');
    _cb[4].checkbox('uncheck');
    _cb[5].checkbox('uncheck');
    _cb[0].checkbox('set disabled');
    _cb[1].checkbox('set disabled');
    _cb[2].checkbox('set disabled');
    _cb[3].checkbox('set disabled');
    _cb[4].checkbox('set disabled');
    _cb[5].checkbox('set disabled');
    
    //"all" checkbox event
    _cb[6].checkbox({
        onChecked: function() {
            if(!_cb1st[0])_cb[0].checkbox('check');
            if(!_cb1st[1])_cb[1].checkbox('check');
            if(!_cb1st[2])_cb[2].checkbox('check');
            if(!_cb1st[3])_cb[3].checkbox('check');
            if(!_cb1st[4])_cb[4].checkbox('check');
            if(!_cb1st[5])_cb[5].checkbox('check');
        },
        onUnchecked: function() {
            if(!_cb1st[0])_cb[0].checkbox('uncheck');
            if(!_cb1st[1])_cb[1].checkbox('uncheck');
            if(!_cb1st[2])_cb[2].checkbox('uncheck');
            if(!_cb1st[3])_cb[3].checkbox('uncheck');
            if(!_cb1st[4])_cb[4].checkbox('uncheck');
            if(!_cb1st[5])_cb[5].checkbox('uncheck');
        }
    });
    //"airbox,maps,lass,...." checkbox event    
    _cb[0].checkbox({
        onChecked: function() {
            CbState[0] = true;
            changCheckBox(true);
            creatMkLyr(0,LassData[0]);
        },
        onUnchecked: function() {
            CbState[0] = false;
            changCheckBox(false);
            deletMkLyr(0);
        }   
    });
    _cb[1].checkbox({
        onChecked: function() {
            CbState[1] = true;
            changCheckBox(true);
            creatMkLyr(1,LassData[1]);
        },
        onUnchecked: function() {
            CbState[1] = false;
            changCheckBox(false);
            deletMkLyr(1);
        }   
    });
    _cb[2].checkbox({
        onChecked: function() {
            CbState[2] = true;
            changCheckBox(true);
            creatMkLyr(2,LassData[2]);
        },
        onUnchecked: function() {
            CbState[2] = false;
            changCheckBox(false);
            deletMkLyr(2);
        }   
    });
    _cb[3].checkbox({
        onChecked: function() {
            CbState[3] = true;
            changCheckBox(true);
            creatMkLyr(3,LassData[3]);
        },
        onUnchecked: function() {
            CbState[3] = false;
            changCheckBox(false);
            deletMkLyr(3);
        }   
    });
    _cb[4].checkbox({
        onChecked: function() {
            CbState[4] = true;
            changCheckBox(true);
            creatMkLyr(4,LassData[4]);
        },
        onUnchecked: function() {
            CbState[4] = false;
            changCheckBox(false);
            deletMkLyr(4);
        }   
    });
    _cb[5].checkbox({
        onChecked: function() {
            CbState[5] = true;
            changCheckBox(true);
            creatMkLyr(5,LassData[5]);
        },
        onUnchecked: function() {
            CbState[5] = false;
            changCheckBox(false);
            deletMkLyr(5);
        }   
    });
    
}

//初始化地圖選擇
function setDropDownMap(){
    for(var i=0, len=DropDownMap.length; i<len; i++)
    {
        if(DropDownMap[i].value == InitSet.map_basemap)
            DropDownMap[i].selected = true;
    }
    $('#page_1_item_1').dropdown({
        values: DropDownMap,
        forceSelection: false, 
        selectOnKeydown: false, 
        showOnFocus: false,
        on: "hover",
        onChange: function (value, text, $selectedItem) {
            //確認地圖建立後才能切換
            if(BaseLyr){
                BaseLyr.remove();
                BaseLyr = L.tileLayer(MbUrl, {id: value, attribution: MbAttr});   
                Map.addLayer(BaseLyr);                
            }
        }
    });
}

//初始化彈出視窗 HLoadBrk = true;
function setPopupItem(){
    
    //彈出歷史視窗
    var e9 = getEle("myModal");
    var eb = getEle("myLoad");
    var ec = getEle('myAlert');
    
    //歷史視窗初始狀態不顯示
    e9.style.display = "none";
    eb.style.display = "none";
    ec.style.display = "none";
    
    //關閉彈出視窗
    window.onclick = function(event) {
        //歷史資料視窗
        if (event.target == e9) {
            e9.style.display = "none";
        }
        
        if(event.target == ec){
            ec.style.display = "none";
        }
    }
    //設定左側彈出視窗
    var e0 = getEle("left_head1");    
    var e1 = getEle("left_head2");    
    var e2 = getEle("left_head3");
    var e3 = getEle("left_menu_item1"); 
    var e4 = getEle("left_menu_item2"); 
    var e5 = getEle("left_menu_item3"); 
    var e6 = getEle("left_icon1");   
    var e7 = getEle("left_icon2");       
    var e8 = getEle("left_icon3");  
    
    setEColor(e0, "#dddddd");
    setEColor(e1, "#dddddd");
    setEColor(e2, "#dddddd");
    
    setBgColor(e3, "#444444");
    setBgColor(e4, "#444444");
    setBgColor(e5, "#444444");
    
    setEClass(e6, "large green leaf icon");
    setEClass(e7, "large yellow area chart icon");
    setEClass(e8, "large inverted user settings icon");
}

//滑鼠滑過事件
function mouseEvent(){
    //大ICON
    var e0 = getEle("left_big_head");    
    var e1 = getEle("load_icon");  
    var e2 = getEle("left_menu_item1"); 
    var e3 = getEle("left_menu_item2"); 
    var e4 = getEle("left_menu_item3"); 
    var e5 = getEle("left_con1");   
    var e6 = getEle("left_con2");       
    var e7 = getEle("left_con3");
    var e8 = getEle("left_icon1");   
    var e9 = getEle("left_icon2");       
    var ea = getEle("left_icon3");
    var eb = getEle("left_head1");    
    var ec = getEle("left_head2");    
    var ed = getEle("left_head3");
    
    e0.onmouseover = function(){setEClass(e1, "settings loading icon");};
    e0.onmouseout = function(){setEClass(e1, "settings icon");};
    
    e2.onmouseover = function(){
        setEClass(e1, "settings loading icon");
        setBgColor(e2, "#808080");        
    };
    e2.onmouseout = function(){
        setEClass(e1, "settings icon");
        setBgColor(e2, "#666666");
    };
    
    e3.onmouseover = function(){
        setEClass(e1, "settings loading icon");
        setBgColor(e3, "#808080");        
    };
    e3.onmouseout = function(){
        setEClass(e1, "settings icon");
        setBgColor(e3, "#666666");
    };
    
    e4.onmouseover = function(){
        setEClass(e1, "settings loading icon");
        setBgColor(e4, "#808080");        
    };
    e4.onmouseout = function(){
        setEClass(e1, "settings icon");
        setBgColor(e4, "#666666");
    };
    //小ICON
    e5.onmouseover = function(){
        setEClass(e8, "big green leaf icon");
        setEColor(eb, "#eeeeee");        
    };
    e5.onmouseout = function(){
        setEClass(e8, "large green leaf icon");
        setEColor(eb, "#dddddd");
    };
    
    e6.onmouseover = function(){
        setEClass(e9, "big yellow area chart icon");
        setEColor(ec, "#eeeeee");        
    };
    e6.onmouseout = function(){
        setEClass(e9, "large yellow area chart icon");
        setEColor(ec, "#dddddd");
    };
    
    e7.onmouseover = function(){
        setEClass(ea, "big inverted user settings icon");
        setEColor(ed, "#eeeeee");        
    };
    e7.onmouseout = function(){
        setEClass(ea, "large inverted user settings icon");
        setEColor(ed, "#dddddd");
    };
}

//動畫
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

//左側彈出動畫控制
function popupLeftMenu(){
    
    var e0 = getEle("left_popup_menu");
    var e1 = getEle("left_menu_content");
    var e2 = getEle("left_menu_btn");
    var e3 = getEle("center_container");
    var e4 = getEle("center_container_left");
    var e5 = getEle("center_container_right");
    var w = getEWid(e1);
    //初始化左邊位置 
    setELeft(e0, -w);
    //左側POPUP視窗
    e2.onclick = function(){ 
        var l = getELeft(e0);
        if ( l == -w ){
            animate({
                duration: 600,
                timing: function(timeFraction) {
                  return Math.pow(timeFraction, 2);//timeFraction;
                },
                draw: function(progress) {
                    setELeft(e0, (1-progress) * l);
                }
            });            
        }
        setOpacity(e4, "0.2");
        setOpacity(e5, "0.2");
    };

    //左側POPUP視窗復原
    e3.onclick = function(){
        var l = getELeft(e0);
        if( l >= 0 ){
            animate({
                duration: 600,
                timing: function(timeFraction) {
                  return Math.pow(timeFraction, 2);//timeFraction;
                },
                draw: function(progress) {
                    setELeft(e0, -progress * w);
                }
            });
            setOpacity(e4, "1");
            setOpacity(e5, "1");
        }
    };
}

//設定感測站顏色
function setLabelColor(){
    var e0 = getEle("p1i2");
    var e1 = getEle("p1i3");
    var e2 = getEle("p1i4");
    var e3 = getEle("p1i5");
    var e4 = getEle("p1i6");
    var e5 = getEle("p1i7");
    
    setEColor(e0, SenColor[0]);
    setEColor(e1, SenColor[1]);
    setEColor(e2, SenColor[2]);
    setEColor(e3, SenColor[3]);
    setEColor(e4, SenColor[4]);
    setEColor(e5, SenColor[5]);
}

//UI介面初始化
function setUI(){
    
    setWidthHeight();
    setMenu();
    setCheckBox();
    setDropDownMap();
    setPopupItem();
    mouseEvent();
    popupLeftMenu();
    setLabelColor();
    
    console.log("CSS Setup!!");
}

window.onbeforeunload = function(){
    setMenu();
    setCheckBox();
    setDropDownMap();
    setPopupItem();
    
};
