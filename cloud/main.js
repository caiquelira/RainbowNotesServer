Parse.initialize("UuBzIX2bQ0gcu0aLKWCgVQT8rDqCFh81jdmvUh5K", "aiRDHqlXh6QWX15dhARXrOQ5Sc93reIOmppcHZl0");

require('cloud/app.js')
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});


Parse.Cloud.define("sync", function(req, res) {
	console.log('sync called');
	var Note = Parse.Object.extend("Note");
	var query = new Parse.Query('Note');
	Parse.Cloud.run('initialize', {}).then(function () {
		return query.find();
	}).then(function(results){
		res.success(results);
	},
	function(error){
		res.error(error);
	});
});

Parse.Cloud.define('initialize', function(req, res) {
	//res.success('init ok');
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
    var note = new Note();
   	var urgente = new Note();
   	var ita = new Note();
   	var ces22 = new Note(); 
   	var ctc20 = new Note();
   	var tar17 = new Note();
   	var anima = new Note();
   	var yanotes = new Note();
    var promises = [];
   	console.log('quase');
   	console.log ('antes de salvar a glr');
   	note.set("title", "Home");
   	note.set('text', 'Home, sweet home');
   	note.set('myid', 0);
   	note.set('parents', []);
   	note.set('children', [1, 7]);
	console.log('dps do note');
   	urgente.set('title', 'URGENTE');
   	urgente.set('text', 'Tarefas que precisam de atenção urgente');
   	urgente.set('myid', 1);
   	urgente.set('parents', [0]);
   	urgente.set('children', [5, 4]);
   	console.log('dps do urgente');
   	ita.set('myid', 7);
   	ita.set('title', 'Matérias do ITA');
   	ita.set('text', '');
   	ita.set('parents', [0]);
   	ita.set('children', [2, 3]);
   	ces22.set('title', 'CES22');
   	ces22.set('text', 'CES22 é a matéria de programação ministrada pelo Prof Yano');
   	ces22.set('myid', 2);
   	ces22.set('parents', [7]);
   	ces22.set('children', [5, 6]);
   	ctc20.set('myid', 3);
   	ctc20.set('title', 'CTC20');
   	ctc20.set('text', '');
   	ctc20.set('children', [4]);
   	ctc20.set('parents', [7]);
   	tar17.set('myid', 4);
   	tar17.set('title', 'Tarefa 17');
   	tar17.set('text', 'Décima sétima tarefa de CTC20');
   	tar17.set('children', []);
   	tar17.set('parents', [3]);
   	anima.set('myid', 5);
   	anima.set('title', 'Projeto Anima');
   	anima.set('text', '');
   	anima.set('parents', [2]);
   	anima.set('children', []);
   	yanotes.set('myid', 6);
   	yanotes.set('title', 'Projeto YanoTes');
   	yanotes.set('text', 'Tome notas no celular, se mantenha sincronizado com a Cloud');
   	yanotes.set('parents', [2, 1]);
   	yanotes.set('children', []);
   	console.log ('imediatamente antes');
    promises.push(note.save());
   	promises.push(urgente.save());
   	promises.push(ita.save());
   	promises.push(ces22.save());
   	promises.push(ctc20.save());
   	promises.push(tar17.save());
   	promises.push(anima.save());
   	promises.push(yanotes.save());
   	return Parse.Promise.when(promises);
    }).then(function () {
    var promises = [];

	note.set('parentsRef', []);
	note.set('childrenRef', [urgente, ita]);
   	urgente.set('parentsRef', [note]);
   	urgente.set('childrenRef', [yanotes, tar17]);
   	ita.set('parentsRef', [note]);
   	ita.set('childrenRef', [ces22, ctc20]);
   	ces22.set('parentsRef', [ita]);
   	ces22.set('childrenRef', [anima, yanotes]);
   	ctc20.set('childrenRef', [tar17]);
   	ctc20.set('parentsRef', [ita]);
   	tar17.set('parentsRef', [ctc20]);
   	tar17.set('childrenRef', []);
   	anima.set('parentsRef', [ces22]);
   	anima.set('childrenRef', []);
   	yanotes.set('parentsRef', [ces22, urgente]);
   	yanotes.set('childrenRef', []);
   	promises.push(note.save());
   	promises.push(urgente.save());
   	promises.push(ita.save());
   	promises.push(ces22.save());
   	promises.push(ctc20.save());
   	promises.push(tar17.save());
   	promises.push(anima.save());
   	promises.push(yanotes.save());
   	console.log('quase');
   	return Parse.Promise.when(promises);
    }).then(
    function(note){
        res.success('app initialized');
    },
    function(error) {
      console.log(error);
      res.error(error);
    });
});

/*
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

*/