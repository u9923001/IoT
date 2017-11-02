/*
█▀▄ ▄▀▄ █▀▀▄ ▄▀▄ █▄░▄█ █▀▀ ▀█▀ █▀▀ █▀▀▄     ▀ █▄░█ ▀ ▀█▀ 
█░█ █▀█ █▐█▀ █▀█ █░█░█ █▀▀ ░█░ █▀▀ █▐█▀     █ █░▀█ █ ░█░ 
█▀░ ▀░▀ ▀░▀▀ ▀░▀ ▀░░░▀ ▀▀▀ ░▀░ ▀▀▀ ▀░▀▀     ▀ ▀░░▀ ▀ ░▀░ 

*/
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>';

var	mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png32?access_token=pk.eyJ1IjoidTk5MjMwMDEiLCJhIjoiY2o3YWdqeGZoMGZhZDJxbzFtZ2wxMWswZiJ9.rieTxvxJSPfaerXHPjMIiA';

var LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: './image/leaf-shadow.png',
        iconSize:     [38, 95],
        shadowSize:   [50, 64],
        iconAnchor:   [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor:  [-3, -76]
    }
});
var greenIcon = new LeafIcon({iconUrl: './image/leaf-green.png'});
var redIcon = new LeafIcon({iconUrl: './image/leaf-red.png'});
var orangeIcon = new LeafIcon({iconUrl: './image/leaf-orange.png'});

var initSatLog = {
    //arcgis map
    map_basemap : "mapbox.streets", //see dropdownMap
    map_container : "arcgis_map_view", //need to match HTML id
    map_center : L.latLng(24.951904, 121.226521),
    map_zoom : 12,
    mark_size : "32px",
    mark_width : 32,
    point_color : [0xff,0x00,0x00],
    //right_menu ? 'item active' : 'item'
    right_menu_1 : 'item active',
    right_menu_2 : 'item',
    //page_1_item_* color
    p1_i2_color : [0x00,0x80,0xff],
    p1_i3_color : [0x00,0x00,0xff],
    p1_i4_color : [0x00,0x80,0x00],
    p1_i5_color : [0x00,0x00,0x80],
    p1_i6_color : [0x80,0x80,0xff],
    p1_i7_color : [0x80,0x00,0xff],
    p1_i9_color : [0x66,0x60,0xff],
    p1_i10_color : [0x40,0x80,0xff],
    p1_i11_color : [0x20,0x50,0xff],
    p1_i12_color : [0x50,0x50,0xff],
    //dont chang
    page_1_item_2 : false,
    page_1_item_3 : false,
    page_1_item_4 : false,
    page_1_item_5 : false,
    page_1_item_6 : false,
    page_1_item_7 : false,
    page_1_item_9 : false,
    popup : false,
    past_attributes : "",
    past_layer_id : "",
    marker : ""
    };
var dropdownMap = [
    {
        name: 'streets',
        value: 'mapbox.streets',
        selected: false
    },
    {
        name: 'light',
        value: 'mapbox.light',
        selected: false
    },
    {
        name: 'dark',
        value: 'mapbox.dark',
        selected: false
    },
    {
        name: 'satellite',
        value: 'mapbox.satellite',
        selected: false
    },
    {
        name: 'streets-satellite',
        value: 'mapbox.streets-satellite',
        selected: false
    },
    {
        name: 'wheatpaste',
        value: 'mapbox.wheatpaste',
        selected: false
    },
    {
        name: 'streets-basic',
        value: 'mapbox.streets-basic',
        selected: false
    },
    {
        name: 'comic',
        value: 'mapbox.comic',
        selected: false
    },
    {
        name: 'outdoors',
        value: 'mapbox.outdoors',
        selected: false
    },
    {
        name: 'run-bike-hike',
        value: 'mapbox.run-bike-hike',
        selected: false
    },
    {
        name: 'pencil',
        value: 'mapbox.pencil',
        selected: false
    },
    {
        name: 'pirates',
        value: 'mapbox.pirates',
        selected: false
    },
    {
        name: 'emerald',
        value: 'mapbox.emerald',
        selected: false
    },
    {
        name: 'high-contrast',
        value: 'mapbox.high-contrast',
        selected: false
    }
];
//wait ready
$(function(){
    
    //set CSS
    function setCSS()
    {
        var w = $("#center_container_left").width();
        $('#left_menu_content').css('height', ($(window).height()) + 'px' ); 
        $('#center_container_left').css('height', ($(window).height()) + 'px' ); 
        $('#center_container_right').css('height', ($(window).height()) + 'px' ); 
        $('#right_container').css('height', ($(window).height()) + 'px' ); 
        $('#load_map_view').css('width', w ); 
        
        $('#right_menu_1').attr('class','item active');
        $('#right_menu_2').attr('class','item');
        $('#right_page_1').css('display', 'block' ); 
        $('#right_page_2').css('display', 'none' );
        
        function setTextColor(res)
        {
            return ('rgb('+res[0]+','+res[1]+','+res[2]+')');
        }
        
        $('#p1i2').css('color', setTextColor(initSatLog.p1_i2_color));
        $('#p1i3').css('color', setTextColor(initSatLog.p1_i3_color)); 
        $('#p1i4').css('color', setTextColor(initSatLog.p1_i4_color)); 
        $('#p1i5').css('color', setTextColor(initSatLog.p1_i5_color)); 
        $('#p1i6').css('color', setTextColor(initSatLog.p1_i6_color)); 
        $('#p1i7').css('color', setTextColor(initSatLog.p1_i7_color));
        $('#p1i9').css('color', setTextColor(initSatLog.p1_i9_color));
        $('#p1i10').css('color', setTextColor(initSatLog.p1_i10_color));
        $('#p1i11').css('color', setTextColor(initSatLog.p1_i11_color));
        $('#p1i12').css('color', setTextColor(initSatLog.p1_i12_color));
        $('#page_1_item_2').checkbox('set disabled');
        $('#page_1_item_3').checkbox('set disabled');
        $('#page_1_item_4').checkbox('set disabled');
        $('#page_1_item_5').checkbox('set disabled');
        $('#page_1_item_6').checkbox('set disabled');
        $('#page_1_item_7').checkbox('set disabled');
        for(var i=0, len=dropdownMap.length; i<len; i++)
        {
            if(dropdownMap[i].value == initSatLog.map_basemap)
                dropdownMap[i].selected = true;
        }
        $('#page_1_item_1').dropdown({
            values: dropdownMap,
            forceSelection: false, 
            selectOnKeydown: false, 
            showOnFocus: false,
            on: "hover"
        });
        
        
        $( "#left_big_head" ).mouseover(function(){
            $("#load_icon").attr('class','settings loading icon');
        });
        $( "#left_big_head" ).mouseout(function(){
            $("#load_icon").attr('class','settings icon');
        });
        
        $( "#left_head1" ).css("color",setTextColor([0xdd,0xdd,0xdd]));
        $( "#left_head2" ).css("color",setTextColor([0xdd,0xdd,0xdd]));
        $( "#left_head3" ).css("color",setTextColor([0xdd,0xdd,0xdd]));
        $("#left_menu_item1").css("background-color",setTextColor([0x44,0x44,0x44]));
        $("#left_menu_item2").css("background-color",setTextColor([0x44,0x44,0x44]));
        $("#left_menu_item3").css("background-color",setTextColor([0x44,0x44,0x44]));
        $( "#left_icon1" ).attr('class','large green leaf  icon');
        $( "#left_icon2" ).attr('class','large yellow area chart icon');
        $( "#left_icon3" ).attr('class','large inverted user settings icon');
        
        
        $('#left_menu_item1').mouseover(function(){
            $("#left_menu_item1").css("background-color",setTextColor([0x80,0x80,0x80]));
            $("#load_icon").attr('class','settings loading icon');
        });
        $('#left_menu_item1').mouseout(function(){
            $("#left_menu_item1").css("background-color",setTextColor([0x66,0x66,0x66]));
            $("#load_icon").attr('class','settings icon');
        });
        $('#left_menu_item2').mouseover(function(){
            $("#left_menu_item2").css("background-color",setTextColor([0x80,0x80,0x80]));
            $("#load_icon").attr('class','settings loading icon');
        });
        $('#left_menu_item2').mouseout(function(){
            $("#left_menu_item2").css("background-color",setTextColor([0x66,0x66,0x66]));
            $("#load_icon").attr('class','settings icon');
        });
        $('#left_menu_item3').mouseover(function(){
            $("#left_menu_item3").css("background-color",setTextColor([0x80,0x80,0x80]));
            $("#load_icon").attr('class','settings loading icon');
        });
        $('#left_menu_item3').mouseout(function(){
            $("#left_menu_item3").css("background-color",setTextColor([0x66,0x66,0x66]));
            $("#load_icon").attr('class','settings icon');
        });
        
        
        $('#left_con1').mouseover(function() {
            $( "#left_icon1" ).attr('class','big green leaf  icon');
            $( "#left_head1" ).css("color",setTextColor([0xee,0xee,0xee]));
        });
        $('#left_con1').mouseout(function(){
            $( "#left_icon1" ).attr('class','large green leaf  icon');
            $( "#left_head1" ).css("color",setTextColor([0xdd,0xdd,0xdd]));
        });
        $('#left_con2').mouseover(function() {
            $( "#left_icon2" ).attr('class','big yellow area chart icon');
            $( "#left_head2" ).css("color",setTextColor([0xee,0xee,0xee]));
        });
        $('#left_con2').mouseout(function(){
            $( "#left_icon2" ).attr('class','large yellow area chart icon');
            $( "#left_head2" ).css("color",setTextColor([0xdd,0xdd,0xdd]));
        });
        $('#left_con3').mouseover(function() {
            $( "#left_icon3" ).attr('class','big inverted user settings icon');
            $( "#left_head3" ).css("color",setTextColor([0xee,0xee,0xee]));
        });
        $('#left_con3').mouseout(function(){
            $( "#left_icon3" ).attr('class','large inverted user settings icon');
            $( "#left_head3" ).css("color",setTextColor([0xdd,0xdd,0xdd]));
        });
        
        console.log("CSS Setup!!");
    }
    setCSS();
    
    //left popup menu [active]
    $("#left_menu_btn").click(function(){ 

        var w = $("#left_menu_content").width();
        
        if ($("#left_popup_menu").css('left') == '-'+w+'px')
        {
            $("#left_popup_menu").animate({ left:'0px' }, 600 ,'swing');
        }
        //if active change background
        $('#center_container_left').css('opacity', 0.2 ); 
        $('#center_container_right').css('opacity', 0.2 );
    });

    //left popup menu []
    $("#center_container").click(function(){
        if($("#left_popup_menu").width()>0)
        {
            var w = $("#left_menu_content").width();　
            $("#left_popup_menu").animate( { left:'-'+w+'px' }, 600 ,'swing');
            //recover background
            $('#center_container_left').css('opacity', 1 ); 
            $('#center_container_right').css('opacity', 1 ); 
        }
    });	
    
    /*
    ▄▀▀ ▄▀▄ ▄▀ █░▄▀ █▀▀ ▀█▀     ▀ ▄▀▄ 
    ░▀▄ █░█ █░ █▀▄░ █▀▀ ░█░     █ █░█ 
    ▀▀░ ░▀░ ░▀ ▀░▀▀ ▀▀▀ ░▀░     ▀ ░▀░ 
    */
    //var socket = io.connect();
    var devData = new Array(6);
    var moveData;
    var checkboxFun;
    /*
    socket.on('date0', function(data) {
        devData[0]=data;
        setLassData('#page_1_item_2',greenIcon,devData[0]);
        initSatLog.page_1_item_2 = true;
        $('#page_1_item_2').checkbox('set enabled');
        console.log("get airbox");
    });
    socket.on('date1', function(data) {
        devData[1]=data;
        setLassData('#page_1_item_3',greenIcon,devData[1]);
        initSatLog.page_1_item_3 = true;
        $('#page_1_item_3').checkbox('set enabled');
        console.log("get maps");
    });
    socket.on('date2', function(data) {
        devData[2]=data;
        setLassData('#page_1_item_4',greenIcon,devData[2]);
        initSatLog.page_1_item_4 = true;
        $('#page_1_item_4').checkbox('set enabled');
        console.log("get lass");
    });
    socket.on('date3', function(data) {
        devData[3]=data;
        setLassData('#page_1_item_5',greenIcon,devData[3]);
        initSatLog.page_1_item_5 = true;
        $('#page_1_item_5').checkbox('set enabled');
        console.log("get lass4u");
    });
    socket.on('date4', function(data) {
        devData[4]=data;
        setLassData('#page_1_item_6',greenIcon,devData[4]);
        initSatLog.page_1_item_6 = true;
        $('#page_1_item_6').checkbox('set enabled');
        console.log("get g0v indie");
    });
    socket.on('date5', function(data) {
        devData[5]=data;
        setLassData('#page_1_item_7',greenIcon,devData[5]);
        initSatLog.page_1_item_7 = true;
        $('#page_1_item_7').checkbox('set enabled');
        console.log("get g0v probecube");
    });
    socket.on('dateMove4', function(data) {
        moveData=data;
        moveCheck(moveData);
        initSatLog.page_1_item_9 = true;
        $('#page_1_item_9').checkbox('set enabled');
        //console.log(data);
    });
    socket.on('debug', function(data){
        console.log(data);
    });*/
     /*
    ▄▀▀ █▀▀ ▀█▀     █▄░▄█ █▀▀ █▄░█ █░█     █▀▄ ▄▀▄ ▄▀▀░ █▀▀ 
    ░▀▄ █▀▀ ░█░     █░█░█ █▀▀ █░▀█ █░█     █░█ █▀█ █░▀▌ █▀▀ 
    ▀▀░ ▀▀▀ ░▀░     ▀░░░▀ ▀▀▀ ▀░░▀ ░▀░     █▀░ ▀░▀ ▀▀▀░ ▀▀▀ 
    */
    function setMenuPage()
    {
        $('#right_menu_1').attr('class', initSatLog.right_menu_1);
        $('#right_menu_2').attr('class', initSatLog.right_menu_2);
        $('#right_page_1').css('display', initSatLog.right_page_1); 
        $('#right_page_2').css('display', initSatLog.right_page_2);
    }
    /*
    █░░ ▄▀▄ ▄▀▄ █▀▄ ▀ █▄░█ ▄▀▀░ 
    █░▄ █░█ █▀█ █░█ █ █░▀█ █░▀▌ 
    ▀▀▀ ░▀░ ▀░▀ ▀▀░ ▀ ▀░░▀ ▀▀▀░ 
    */
    function showLoading(show)
    {
        show ? $('#load_map_view').css('display', 'block'):$('#load_map_view').css('display', 'none');
    }
    
    /*      
    █▀▀▄ ▀ ▄▀▀░ █░░ ▀█▀     █▄░▄█ █▀▀ █▄░█ █░█     █▀▀ ▐▌░▐▌ █▀▀ █▄░█ ▀█▀ 
    █▐█▀ █ █░▀▌ █▀▄ ░█░     █░█░█ █▀▀ █░▀█ █░█     █▀▀ ░▀▄▀░ █▀▀ █░▀█ ░█░ 
    ▀░▀▀ ▀ ▀▀▀░ ▀░▀ ░▀░     ▀░░░▀ ▀▀▀ ▀░░▀ ░▀░     ▀▀▀ ░░▀░░ ▀▀▀ ▀░░▀ ░▀░ 
    */
    //right_menu_1 "基本設定"
    $("#right_menu_1").click(function(){ 
        initSatLog.right_menu_1 = 'item active'; 
        initSatLog.right_menu_2 = 'item';   
        initSatLog.right_page_1 = 'block';
        initSatLog.right_page_2 = 'none';
        setMenuPage();
    });

    //right_menu_2 "資料顯示"
    $("#right_menu_2").click(function(){ 
        initSatLog.right_menu_1 = 'item'; 
        initSatLog.right_menu_2 = 'item active';   
        initSatLog.right_page_1 = 'none';
        initSatLog.right_page_2 = 'block';
        setMenuPage();
    }); 
    
    /*  
    █▄░▄█ ▄▀▄ █▀▄ 
    █░█░█ █▀█ █░█ 
    ▀░░░▀ ▀░▀ █▀░ 
    */
    var initMap = L.tileLayer(mbUrl, {id: initSatLog.map_basemap, attribution: mbAttr});
  
    var map = L.map(initSatLog.map_container, {
        center: initSatLog.map_center,
        zoom: initSatLog.map_zoom
    });
    
    initMap.addTo(map);
    
    //dropdown memu change basemap
    $('#page_1_item_1').dropdown({
        onChange: function (value, text, $selectedItem) {
            initMap.remove();
            initMap = L.tileLayer(mbUrl, {id: value, attribution: mbAttr});
            initMap.addTo(map);
        }
    });
    
    //checkbox event
    $('#page_1_item_8').checkbox({
        onChecked: function() {
            //console.log("--- Check ---");
            if(initSatLog.page_1_item_2)$('#page_1_item_2').checkbox('check');
            if(initSatLog.page_1_item_3)$('#page_1_item_3').checkbox('check');
            if(initSatLog.page_1_item_4)$('#page_1_item_4').checkbox('check');
            if(initSatLog.page_1_item_5)$('#page_1_item_5').checkbox('check');
            if(initSatLog.page_1_item_6)$('#page_1_item_6').checkbox('check');
            if(initSatLog.page_1_item_7)$('#page_1_item_7').checkbox('check');
        },
        onUnchecked: function() {
            //console.log("--- UnCheck ---");
            $('#page_1_item_2').checkbox('uncheck');
            $('#page_1_item_3').checkbox('uncheck');
            $('#page_1_item_4').checkbox('uncheck');
            $('#page_1_item_5').checkbox('uncheck');
            $('#page_1_item_6').checkbox('uncheck');
            $('#page_1_item_7').checkbox('uncheck');
        }
    });
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
    
    var c=0;
    function setLassData(lyrName,color,data){
        var str = lyrName.replace(/#/,"");
        $(lyrName).checkbox({
            onChecked: function() {
                
                if(numChecked())
                    $('#page_1_item_8').checkbox('set checked');
                else
                    $('#page_1_item_8').checkbox('set indeterminate');
                
                creatMarkers(lyrName,color,data);
                //markers[str];
                c=1;    
            },
            onUnchecked: function() {
                
                if(numUnChecked())
                    $('#page_1_item_8').checkbox('set unchecked');
                else
                    $('#page_1_item_8').checkbox('set indeterminate');
                
                deletMarkers(lyrName);
                c=0;
            }   
        });
        if(c==1)
        {
            updateLassLayer(lyrName,initSatLog.past_attributes,data);
        }
    }
    var dataMap = ['#page_1_item_2','#page_1_item_3','#page_1_item_4','#page_1_item_5','#page_1_item_6','#page_1_item_7'
        ];
        
    map.on('popupopen', function(e) {
        var marker = e.popup._source;
        initSatLog.popup = true;
        //update attributes
        //console.log(marker);
        var layid = marker.options.layerid;
        initSatLog.past_layer_id  = layid;
        initSatLog.past_attributes = marker.options.attributes;
        
        for(var i=0;i<dataMap.length;i++)
        {
            if(dataMap[i] == layid)
            {
                var b = devData[i].slice();
                updateLassLayer(layid,marker.options.attributes, b);   
            }
        }
      
    });
        
    map.on('click', function(e) {
        initSatLog.popup = false;
    });
    var markersGp = L.markerClusterGroup({ disableClusteringAtZoom : 13 });
    var dataMarkars=['#page_1_item_2','#page_1_item_3','#page_1_item_4','#page_1_item_5','#page_1_item_6','#page_1_item_7'];
    function creatMarkers(lyrName,color,data)
    {
        var res=[];
		data.forEach(function(item) {
            
			var title = '<div class="ui labeled disabled input"><div class="ui label">PM2.5</div><input type="text" id="'+item.device_id+'_pm25"></div>';
			var marker = L.marker(L.latLng(item.gps_lat, item.gps_lon), { attributes: item, layerid : lyrName});
			marker.bindPopup(title);
			markersGp.addLayer(marker);
            res.push(marker);
        })
		map.addLayer(markersGp);
        dataMarkars[lyrName] = res;
    }
    function deletMarkers(lyrName)
    {
        dataMarkars[lyrName].forEach(function(item) {
            markersGp.removeLayer(item);
        });
    }
    function numChecked()
    {
        return $('#page_1_item_2').checkbox('is checked')&&$('#page_1_item_3').checkbox('is checked')
        &&$('#page_1_item_4').checkbox('is checked')&&$('#page_1_item_5').checkbox('is checked')
        &&$('#page_1_item_6').checkbox('is checked')&&$('#page_1_item_7').checkbox('is checked');
    }
    function numUnChecked()
    {
        return $('#page_1_item_2').checkbox('is unchecked')&&$('#page_1_item_3').checkbox('is unchecked')
        &&$('#page_1_item_4').checkbox('is unchecked')&&$('#page_1_item_5').checkbox('is unchecked')
        &&$('#page_1_item_6').checkbox('is unchecked')&&$('#page_1_item_7').checkbox('is unchecked');
        console.log("u "+d);
    }
    function updateLassLayer(ids,pastdata,newdata)
    {
        if(initSatLog.popup)//popup
        {
            if(ids == initSatLog.past_layer_id)
            {
                var new_attributes = newdata;//array
            
                var devId = pastdata.device_id;
                
                new_attributes.forEach(function(item) {
                    if(devId == item.device_id)
                    {
                        console.log("match " + devId);
                        pastdata.app = item.app;
                        pastdata.barometer = item.barometer;
                        pastdata.battery = item.battery;
                        pastdata.co2 = item.co2;
                        pastdata.date = item.date;
                        pastdata.device = item.device;
                        pastdata.fmt_opt = item.fmt_opt;
                        pastdata.gps_fix = item.gps_fix;
                        pastdata.gps_lat = item.gps_lat;
                        pastdata.gps_lon = item.gps_lon;
                        pastdata.gps_num = item.gps_num;
                        pastdata.humidity = item.humidity;
                        pastdata.pm1 = item.pm1;
                        pastdata.pm10 = item.pm10;
                        pastdata.pm25 = item.pm25;
                        pastdata.site_name = item.site_name;
                        pastdata.temperature = item.temperature;
                        pastdata.time = item.time;
                        pastdata.timestamp = item.timestamp;
                        
                        
                    }
                });
            }
            $('#'+initSatLog.past_attributes.device_id+'_title').text(initSatLog.past_attributes.site_name||"無名稱");
            $('#'+initSatLog.past_attributes.device_id+'_tmp').val(initSatLog.past_attributes.temperature);
            $('#'+initSatLog.past_attributes.device_id+'_hum').val(initSatLog.past_attributes.humidity);
            $('#'+initSatLog.past_attributes.device_id+'_pm10').val(initSatLog.past_attributes.pm10);
            $('#'+initSatLog.past_attributes.device_id+'_pm25').val(initSatLog.past_attributes.pm25);
            $('#'+initSatLog.past_attributes.device_id+'_pm1').val(initSatLog.past_attributes.pm1);
            $('#'+initSatLog.past_attributes.device_id+'_time').val(initSatLog.past_attributes.time);
            
        }
    }
    function degreesToRadians(degrees) {
      return degrees * Math.PI / 180;
    }

    function distance(lat1, lon1, lat2, lon2,cb) {
      //console.log(lat1, lon1, lat2, lon2)
      var earthRadiusKm = 6371;

      var dLat = degreesToRadians(lat2-lat1);
      var dLon = degreesToRadians(lon2-lon1);

      lat1 = degreesToRadians(lat1);
      lat2 = degreesToRadians(lat2);

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      cb( earthRadiusKm * c * 1000);//meter
    }
    
    function creatIWD(){
        // Add interpolated surface
        const {valueField, weight, cellWidth, units} = testIWD.properties || {};
        const result = turf.idw(testIWD, valueField, weight, cellWidth, units);
        console.log(result);
        // Add interpolated surface
        /*var choroplethLayer = L.choropleth(result, {
            valueProperty: 'value',
            colors: ['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac'],
            steps: 5,
            mode: 'q',
            style: {
                color: '#fff',
                weight: 0.1,
                fillOpacity: 0.8
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup("I'm a cell with an IDW interpolated Z value of " + feature.properties.value);
            }
        }).addTo(map);*/
        // Add legend (don't forget to add the CSS from index.html)
        var legend = L.control({
            position: 'bottomright'
        });
        
        legend.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'info legend');
            var limits = choroplethLayer.options.limits;
            var colors = choroplethLayer.options.colors;
            var labels = [];
            
            // Add min & max
            div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
            <div class="max">' + limits[limits.length - 1] + '</div></div>';
            
            limits.forEach(function(limit, index) {
                labels.push('<li style="background-color: ' + colors[index] + '"></li>');
            });
            
            div.innerHTML += '<ul>' + labels.join('') + '</ul>';
            return div;
        };
        
        legend.addTo(map);
    }
    creatIWD();
});//$() end  


var testData=[{"gps_lat":25.010622,"date":"2017-09-05","site_name":"龜山楓樹村","timestamp":"2017-09-05T15:01:48Z","app":"Indie_COPY","humidity":1,"gps_lon":121.342406,"device":"Indie","time":"15:01:48","fmt_opt":"1","device_id":"INDIE_160837","pm25":8,"temperature":32.7,"battery":"","gps_fix":"","gps_num":"","barometer":"","pm1":"","pm10":"","co2":""},{"gps_lat":24.158215,"date":"2017-09-05","site_name":"Air Monitor","timestamp":"2017-09-05T15:00:23Z","app":"Indie_COPY","humidity":92.6,"gps_lon":120.63756,"device":"Indie","time":"15:00:23","fmt_opt":"1","device_id":"INDIE_83205","pm25":32,"temperature":28.83,"battery":"","gps_fix":"","gps_num":"","barometer":"","pm1":"","pm10":"","co2":""},{"gps_lat":23.562055,"date":"2017-09-05","site_name":"CCU NEAT","timestamp":"2017-09-05T15:01:43Z","app":"Indie_COPY","humidity":60.3,"gps_lon":120.477333,"device":"Indie","time":"15:01:43","fmt_opt":"1","device_id":"INDIE_106666","pm25":17,"temperature":33.6,"battery":"","gps_fix":"","gps_num":"","barometer":"","pm1":"","pm10":"","co2":""}];

var testIWD ={
  "type": "FeatureCollection",
  "properties": {
    "valueField": "value",
    "weight": 0.5,
    "cellWidth": 0.5,
    "units": "kilometers"
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "value": 4
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          9.155731201171875,
          45.47216977418841
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "value": 99
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          9.195213317871094,
          45.53689620055365
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "value": 10
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          9.175300598144531,
          45.49912810913339
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "value": 6
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          9.231605529785156,
          45.49190839157102
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "value": 7
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          9.116249084472656,
          45.4391764115696
        ]
      }
    }
  ]
};