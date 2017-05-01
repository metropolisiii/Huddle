function getLocalISOTime(twDate) {
   	var d = twDate;
    var utcd = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(),
        d.getMinutes(), d.getSeconds(), d.getMilliseconds());
 
    // obtain local UTC offset and convert to msec
    localOffset = d.getTimezoneOffset() * 60000;
    var newdate = new Date(utcd);
    return newdate.toISOString().replace(".000", "");
}


(function(){
	var app = angular.module('huddleRoom', []);
	
	Date.prototype.today = function () { 
		return (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+ this.getFullYear();
	}

	// For the time now
	Date.prototype.timeNow = function () {
		 return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
	}

	var ROOM_STATUS={
		empty: 0,
		taken: 1
	}
	var CableLabsRooms;
	var SwingSpaceRooms;
	
	app.controller('HuddleRoomController', function($scope, $http, $timeout){
		var retrieveData = function(){
			CableLabsRooms = new Array();
			SwingSpaceRooms = new Array();
			$http.get('http://cablelabs.ws:8383/rooms/').
				success(function(data){
					var currentdate = new Date(); 
					var datetime = currentdate.today() + " @ " + currentdate.timeNow();
					for (var i=0; i<data.length; i++){
						if (data[i].location == 'Swing space') //Swing Space Huddle Rooms 
							SwingSpaceRooms.push(data[i]);
						else //CableLabs Huddle Rooms
							CableLabsRooms.push(data[i]);
							
					}
					$scope.rooms = CableLabsRooms;
					$scope.SwingSpace = SwingSpaceRooms;
					$scope.LastRefreshed = datetime;
					$timeout(retrieveData, 5000);
				});
			};
		retrieveData();
		
		$scope.reservation = function(room){
			var minutes = 5;
			$http.post('http://cablelabs.ws:8383/rooms/', {"id":room, "reserve":minutes}).
				success(function(data){
					retrieveData();
				});
		};
		$scope.notify = function(room){
			var notice = alert("You have been added to the queue for this room and will be notified when it becomes available.");
			//Make rest call
		}

	});
	
})();