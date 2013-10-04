exports.find = function(req, res) {
	var response = {
		tags: [],
		total: 0
	};

	var term = req.param('q');
	var pageSize = req.param('ps');
	if(isNaN(pageSize)) pageSize = process.config.pagesize;

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//search for matching tags
	var query = new Appacitive.Queries.FindAllQuery({
						schema : 'tag',
						fields : 'name,description,$questioncount',
						isAscending: false,
						filter: "(*name like '"+ term +"*')",
						pageSize: pageSize
					});

	query.fetch(function (tags, pi) {
		tags.forEach(function (tag) {
			response.tags.push(transformer.toTag(tag));
		});
		response.total = pi.totalrecords;
		return res.json(response);
	}, function (status) {
		return res.status(502).json({message: status.message});
	});
};