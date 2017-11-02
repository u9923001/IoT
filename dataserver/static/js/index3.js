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
    map_basemap : "mapbox.streets-satellite", //see dropdownMap
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
    /*
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
    
});//$() end  

