document.domain = "cablelabs.com";
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
    $( "rect,polygon" ).bind("click", function() {
        if (this.className.baseVal != 'available') {
            alert('This room is already ' + this.className.baseVal);
        } else if (confirm('Hold this room for 5 minutes?')) {
            $.post("http://huddle,cablelabs.com:8383/rooms/", "reserve=5&_id=" + this.id);
        }
    });
    poll();
});