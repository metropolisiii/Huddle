(function poll(){
   setTimeout(function(){
      $.ajax({ url: "http://huddle.cablelabs.com:8383/rooms/", success: function(data){

        for (var i = 0; i < data.length; i++) {
            var id = "#"+ data[i]._id;
            $(id).attr("class", data[i].status);
/*
            var closed = (data[i].substatus.substr(0,5) == 'close')
            $(id+'open').toggle(!closed);
            $(id+'closed').toggle(closed);
*/
        }
        
        //Setup the next poll recursively
	      	poll();
      }, dataType: "json"});
	}, 2000);
})();

$(function() {
    $.get("http://pollux.cablelabs.com/community/directory/test/")
		.fail(function(){$("#search_form").hide();});
	// Tab handler
    $('.tabs.standard .tab-links a').on('click',function(e){
        var currentAttrValue=$(this).attr('href');
        
        $('.tabs '+ currentAttrValue).show().siblings().hide();
        
        $(this).parent('li').addClass('active').siblings().removeClass('active');
        $('.info').hide();
        
        e.preventDefault();
    });

    // Create handler for room reservation
    $( "rect,polygon" ).bind("click", function() {
        if (this.className.baseVal != 'available') {
            alert('This room is already ' + this.className.baseVal);
        } else if (confirm('Hold this room for 5 minutes?')) {
            $.post("http://huddle.cablelabs.com:8383/rooms/", "reserve=5&_id=" + this.id);
        }
    });
  
    // Put a marker on the map
    var id = getUrlParameter("id");
    if (id != null && id != "") {
        $.get("http://huddle.cablelabs.com:8383/rooms/?_id="+id, function(data) {
            var item = data[0];
            var map = "#"+item.location;
            $("#marker").attr({"x": item.x-10,"y": item.y-42}).show();
            $(".info #info").html(item.name);
			$('.info').show();
            displayMap(map);
        });
    } else {
        displayMap("#NW2");
    }
    
	$('input[name=ad_types]').click(function(){
		if ($('input[name=ad_types]:checked').length == 0)
			$('#dir_lookup').attr('disabled','disabled');
		else
			$('#dir_lookup').removeAttr('disabled');
	});
	$('#dir_name').keypress(function(event){
	  if(event.keyCode == 13 && !$('#dir_lookup').attr('disabled')){
		$('#dir_lookup').click();
	  }
	});
	$('body').on('change', '#names', function(){
		$('#dir_name').val($('#names option:selected').text());	
		getEntries();
	});
	$('body').on('click', '#dir_lookup',function(){
		getEntries();
	});
	
	poll();
});

function displayMap(map) {
    $(map+"link").attr("class","active");
    $(map).attr("class","active");    
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}
function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}

 function showDirectoryResults(user){
    html+="<div>";
    if (d[user].thumbnailPhoto)
		html+='<div id="user_pic"><span><img src=" data:image/png;base64,'+d[user].thumbnailPhoto+'"/></span></div>';
    html+="<div id='user_info'><span class='label'>Name: </span><span>"+d[user].displayName+"</span><br/>";
    html+="<span class='label'>Email: </span><span><a href='mailto:"+d[user].mail+"'>"+d[user].mail+"</a></span><br/>";
	html+="<span class='label'>Department: </span><span>"+d[user].department+"</span><br/>";
	html+="<span class='label'>Title: </span><span>"+d[user].title+"</span><br/>";
	html+="<span class='label'>Phone: </span><span><a href='tel:"+d[user].telephoneNumber+"'>"+d[user].telephoneNumber+"</a></span><br/>";
	if (d[user].physicalDeliveryOfficeName){
		if (d[user].displayName.match(/^Conf /i) ||  d[user].displayName.toLowerCase().indexOf("huddle")>-1){
			 html+="<span class='label'>Room Location: </span><span>";
		}
		else		    
			html+="<span class='label'>Cubicle Location: </span><span>";
		if (d[user].physicalDeliveryOfficeName.match(/^([A-Za-z0-9]+-?)+[A-Za-z0-9]+$/))
			html+="<a target='_blank' href='http://huddle.cablelabs.com?id="+d[user].physicalDeliveryOfficeName+"'>"+d[user].physicalDeliveryOfficeName+"</a>";
		else
			html+=d[user].physicalDeliveryOfficeName;
		html+="</span><br/>";   
		 $.get("http://huddle.cablelabs.com:8383/rooms/?_id="+d[user].physicalDeliveryOfficeName, function(data) {
			var item = data[0];
            var map = "#"+item.location;
			$("#marker").attr({"x": item.x-10,"y": item.y-42}).show();
			$(".info #info").html(item.name);
			$(".info").show();
			$('.active').each(function(){
				if ($(this).prop("tagName") == "g"){
					$(this).attr("class", "tab");
					$(this).hide();
				}
				$(this).removeClass('active');
			});
		   $(map).show();
           displayMap(map);
        });
	}
	else{
		$('.info').hide();
		$('#marker').hide();
	}
	html+="</div></div>";
    $('#person_info').html(html);
}
function getEntries(){
	 $('.search_wait').show();
	 var checks='';
	 $('input[name="ad_types"]:checked').each(function(){
      	checks+=$(this).val()+',';
     });
      $.getJSON( "http://pollux.cablelabs.com/community/directory/", {'q': $('#dir_name').val(), 'checks':checks},function( data ) {
          d=data;
		  html='';
          var size=Object.keys(data).length;
		   if (size>1){
			 html+='<div id="names_select">Multiple names found. Select a name:<br/><select size="'+size+'" id="names">';
  			 html+='<option class="empty"></option>';
			  for (user in data){
				  if (data[user].displayName)
					html+='<option value="'+user+'">'+data[user].displayName+'</option>';
				  
			 }
   			  html+='</select></div>';
     		  $('#multiple_names').html(html);
		  }
		  else if(size <= 1){
		   	 $('#person_info').html(''); //Remove spinner
			 $('#person_info, #names_select').remove();
			 if (size == 0){
				$('#dir_info').append('<div id="person_info">No results found</div>');
				$('.info').hide();
				$('#marker').hide();
		 	 }
			 else{
					$('#dir_info').append('<div id="person_info"><img src="images/spin_small.gif?api=v2"/></div>'); 	   
				  for (user in data){
					 showDirectoryResults( user);
				  }
			 }
          }
		   $('.search_wait').hide();
		
	 })
	 .fail(function(){
		 $('#dir_info').html("<div style='color:red'>Could not connect to the directory. You are likely not connected to a CableLabs network. Please connect to a CableLabs network and try again.</div>");
	 });
}


