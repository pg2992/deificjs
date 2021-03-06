//Connect the comment to the entity
exports.save = function(req, res) {
	var payload = req.body.comment;

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//intialize SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	if(!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

	var response = {
		comment: {}
	};
	
	//create an appacitive article of type 'comment'
	var comment = new Appacitive.Article({
		schema: 'comment',
		text: payload.text
	});

	//depending upon the payload create the connection
	var relation = new Appacitive.ConnectionCollection({ relation: 'entity_comment' });

	// setup the connection
	var connection = relation.createNewConnection({ 
	  endpoints: [{
	      articleid: payload.question ? payload.question : payload.answer,
	      label: 'entity'
	  }, {
	      article: comment,
	      label: 'comment'
	  }]
	});

	//save the connection object
	connection.save(function(){
		response.comment = comment.toJSON();

		//Set the author
		response.comment.author = state.userid;
		response.comment.isowner = true;

		//Set the parent, either question or answer
		if(payload.question) response.comment.question = payload.question;
		else response.comment.answer = payload.answer;

		return res.json(response);
	}, function(status){
		return res.status(502).json(transformer.toError('comment_save', status));
	});
};

exports.del = function(req, res) {
	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//intialize SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	if(!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

	var aComment = new Appacitive.Article({ __id : req.param('id'), schema : 'comment' });
	aComment.del(function(){
		return res.status(204).json({});
	}, function(status){
		return res.status(502).json(transformer.toError('comment_delete', status));
	}, true); //delete the connection also
};