
// These two lines are required to initialize Express in Cloud Code.
 express = require('express');
 app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());    // Middleware for reading request body

app.get('/sync', function(req, res) {
    console.log('sync called');
    var Note = Parse.Object.extend("Note");
    var query = new Parse.Query('Note');
    query.find().then(
    function(results){
        res.send(results);
    },
    function(error){
        console.log(error);
    });
});

app.post('/link', function(req, res) {
    console.log('link from '+req.body.idParent+' to '+req.body.idChild);
    var Note = Parse.Object.extend("Note");
    var noteParent, noteChild;
    var query = new Parse.Query('Note');
    query.equalTo('myid', parseInt(req.body.idParent));
    query.first().then(
    function(note) {
        noteParent = note;
        query = new Parse.Query('Note');
        query.equalTo('myid', parseInt(req.body.idChild));
        return query.first();
    }).then(
    function(note) {
        noteChild = note;
        console.log('linking '+noteParent.id+' to '+noteChild.id);
	noteParent.add('children', req.body.idChild);
	noteChild.add('parents', req.body.idParent);
        noteParent.add('childrenRef', noteChild);
        noteChild.add('parentsRef', noteParent);
        noteParent.save().then(
        function() {
            return noteChild.save();
        }).then (
        function () {
            res.send('truly linked');
        });
    },
    function(error){
        res.send(error);
    });
});

app.get('/initialize', function(req, res) {
    console.log('initialize called');
    var Note = Parse.Object.extend("Note");
    var query = new Parse.Query("Note");
    query.find().then(function(results) {
    	var promises = [];
    	for (var i = 0; i < results.length; i++) {
	    promises.push(results[i].destroy());
   	}
   	return Parse.Promise.when(promises);
    }).then(function () {
   	note = new Note();
   	note.set("title", "Home");
   	note.set('text', 'This is your home note');
   	note.set('myid', 0);
        note.set('parents', []);
        note.set('children', []);
	note.set('parentsRef', []);
	note.set('childrenRef', []);
   	return note.save();
    }).then(
    function(note){
        res.send('app initialized');
    },
    function(error) {
      console.log(error);
      res.send(error);
    });
});

app.post('/delete', function(req, res) {
    if (req.body.id == 0)
	return res.send ("Cant delete root note");
    var Note = Parse.Object.extend('Note');
    var query = new Parse.Query('Note');
    var getQuery = new Parse.Query('Note');
    query.equalTo("myid", parseInt(req.body.id));
    query.find().then(
    function(results) {
        var promises = [];
        for (var i = 0; i < results.length; i++) {
            var now = results[i];
            var pais = now.get("parentsRef");
            console.log ('temos '+pais.length+' pais a serem atualizados');
            for (var j = 0; j < pais.length; j++) {
		console.log('vendo pai ' + j);
		console.log(pais[j]);
		console.log(pais[j].id);
		getQuery.get(pais[j].id).then(function(pai) {
		    console.log('inside callback');
                    console.log(pai);
                    pai.remove("childrenRef", now)
		    pai.remove('children', req.body.id);
                    promises.push(pai.save());
                });
            }
            var filhos = now.get("childrenRef");
	    console.log('temos '+filhos.length+' filhos a serem atualizados');
            for (var j = 0; j < filhos.length; j++) {
		console.log('vendo filho ' + j);
		console.log(filhos[j]);
		console.log(filhos[j].id);
		getQuery.get(filhos[j].id).then(function(filho) {
		    console.log(filho);
                    filho.remove("parentsRef", now);
		    filho.remove('parents', req.body.id);
                    promises.push(filho.save());
		});
            }
            promises.push(results[i].destroy());
        }
        return Parse.Promise.when(promises);
    }).then(
    function() {
        res.send('deleted');
    },
    function(error) {
        console.log(error);
        res.send(error);
    });
})
	
app.post('/hello', function(req, res) {
    res.send (req.body.text + req.body.id + req.body.title);
});

app.post('/add', function(req, res) {
    var Note = Parse.Object.extend("Note");
    var query = new Parse.Query('Note');
    var getQuery = new Parse.Query('Note');
    var note = new Note();
    console.log (req.body.id);
    query.equalTo('myid', parseInt(req.body.id));
    query.find().then(
    function(results) {
        var promises = [];
        console.log ('add must delete ' + results.length + " guys");
        for (var i = 0; i < results.length; i++) {
	    now = results[i];
	    var pais = now.get("parentsRef");
	    console.log('add: temos '+pais.length+' pais a serem atualizados');
	    for (var j = 0; j < pais.length; j++) {
		console.log(pais[j]);
		getQuery.get(pais[j].id).then(function(pai) {
		    console.log(pai);
		    pai.remove("childrenRef", now);
		    pai.remove('children', req.body.id);
		    promises.push(pai.save());
		});
	    }
	    var filhos = now.get('childrenRef');
	    for (var j = 0; j < filhos.length; j++) {
		getQuery.get(filhos[j].id).then(function(filho) {
		    console.log(filho);
		    filho.remove('parentsRef', now);
		    filho.remove('parents', req.body.id);
		    promises.push(filho.save());
		});
	    }
            promises.push(results[i].destroy());
        }
        return Parse.Promise.when(promises);
    }).then(function() {
	query = new Parse.Query('Note');
	query.equalTo('myid', parseInt(req.body.parentId));
	return query.first();
    }).then(function(result) {
	return result.fetch();
    }).then(function(result) {
        note.set("title", req.body.title);
        note.set("text", req.body.text);
        note.set("myid", parseInt(req.body.id));
        note.add("parentsRef", result);
	note.add('parents', req.body.parentId);
        note.set('children', []);
	note.set('childrenRef', []);
	var promises = [];
	promises.push(note.save());
	result.add('childrenRef', note);
	result.add('children', req.body.id);
	promises.push(result.save());
        return Parse.Promise.when(promises); 
    }).then (
    function () {
        console.log(note.get("title") + ' was saved!');
        res.send(req + " was saved!");
    },
    function(error) {
       console.log("app js couldnt save " + req.body.id + req.body.title + req.body.text);
       res.send(error);
   });
});



// Attach the Express app to Cloud Code.
app.listen();
