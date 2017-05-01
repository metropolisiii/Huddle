var express = require('express');
var router = express.Router();

function removeEmpty(obj) {
    for (var key in obj) {
        if (obj[key]=="")
            delete obj[key];
    }
}

function replaceKey(obj, oldKey, newKey) {
    if (obj.hasOwnProperty(oldKey) && !obj.hasOwnProperty(newKey)) {
        obj[newKey] = obj[oldKey];
    }
    delete obj[oldKey];
}

/* GET home page. */
router.get('/', function(req, res) {
    var db = req.db;
    db.collection('rooms').find({'status':{'$exists':true}},{'name':1,'type':1}).sort({'_id':1}).toArray(function (err, items) {
        res.render('index', { items : items, types : [ "Conference", "Huddle", "Phone", "Area" ] });
    });
});    

/* GET map page. */
router.get('/map', function(req, res) {
    var db = req.db;
    db.collection('rooms').find().toArray(function (err, items) {
        res.render('map', { items : items });
    });
});

/* GET rooms */
router.get('/rooms/', function(req, res) {
    var rooms = req.db.collection('rooms');
    removeEmpty(req.query);
    var projection = {};
    if (!req.query.hasOwnProperty('_id') && !req.query.hasOwnProperty('detail')) {
        projection = {'status':1,'reservedUntil':1};
        if (!req.query.hasOwnProperty('status'))
           req.query.status = {'$exists':'true'};
    }
    delete req.query.detail;
    rooms.find(req.query,projection).toArray(function (err, items) {
        var now = new Date();
        for (var i = 0; i < items.length; i++) {
            if (items[i].status == 'reserved' && now > new Date(items[i].reservedUntil))
                items[i].status = 'available';
            if (items[i].status != 'reserved')
                delete items[i].reservedUntil;
        }

        res.json(items);
    });
});

/* POST rooms */
router.post('/rooms/', function(req, res) {
    console.log('Source: ' + req.ip);
    console.log(req.body);

    var rooms = req.db.collection('rooms');
    removeEmpty(req.body);
    replaceKey(req.body, 'id', '_id');
    replaceKey(req.body, 's', 'status');
    replaceKey(req.body, 'ss', 'substatus');
    var query = {'_id': req.body._id};
    delete req.body._id;
    var update = {};
    
    if (req.body.hasOwnProperty('reserve')) {
        var minutes = parseInt(req.body.reserve);
        console.log(minutes);
        if (isNaN(minutes) || minutes < 1 || minutes > 480) {
            res.status(400);
            res.send({"message":"reservation must be a number between 1 and 480 minutes."});
            return
        }
        req.body.status = 'reserved';
        req.body.reservedUntil = new Date((new Date()).getTime() + (minutes * 60000));
        delete req.body.reserve;
    } else {
        update.$unset = {"reservedUntil":""};
    }
            
    if (!req.body.hasOwnProperty('status')) {
        res.status(400);
        res.send({"message":"Either a valid reservation or status must be provided."});
        return;
    }

    rooms.count(query, function(err, count) {
        if (count != 1) {
            res.status(404);
            res.send({message:'No room with ID='+query._id});
        } else {
			var now = new Date();
			req.body.date = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
            update.$set = req.body;
            rooms.update(query, update, function(err) {
            if (err === null) {
                res.send({message:'Success'});
                        
                // notify socket listeners
                req.io.sockets.emit('updated');
		} else {
			res.status(err.status || 500);
                        res.send({message: err});
                }
    	    });
         }
    });

});

module.exports = router;
