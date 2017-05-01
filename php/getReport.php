<?php
	/*	Pull the mongodb for the huddle rooms to find ones that have not been active within 5 business days. If they haven't been active, chances are something is wrong with the sensor. */
	class HuddleReport{
		private $rooms = array();
		public function __construct() {
			
		}
		public function getRoomStatuses(){
			$m = new MongoClient();
			$db = $m->huddle;
			$collection = $db->rooms;
			$cursor = $collection->find(array("type" => "Huddle"));
			$rooms = array();
			foreach ($cursor as $document) {
				if (isset($document['date']))
					$rooms[$document['name']] = $document["date"];
				else
					$rooms[$document['name']] = "-1";
			}
			$this->getDefunctRooms($rooms);
		}
		public function sendEmail($to){
			$to      = $to;
			$subject = "Huddle Room Report";
			$message = "The following huddle rooms have not be accessed for over 1 business week: \n\n".implode("\n",$this->rooms);
			$headers = 'From: huddle@cablelabs.com' . "\r\n" .
				'Reply-To: huddle@cablelabs.com' . "\r\n" .
				'X-Mailer: PHP/' . phpversion();

			mail($to, $subject, $message, $headers);
		}
		public function getDefunctRooms($rooms){
			foreach ($rooms as $room=>$day){
				if ($this->isGTBusinessWeek($day) or $day == -1)
					$this->rooms[]=$room;
			}			
		}
		private function isGTBusinessWeek($day){
			if (strtotime("-1 week") >= strtotime($day))
				return true;
			return false;
		}
		public function getRooms(){
			return $this->rooms;
		}
	}
	$defunctRooms = array();
	$report = new HuddleReport();
	$report->getRoomStatuses();
	$report->sendEmail("r.dixon@cablelabs.com, jason.kirby@cablelabs.com");
	echo "Sent";

	
?>