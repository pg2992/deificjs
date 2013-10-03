(function(){
	Deific.BaseView = Ember.View.extend({

		questionpage: true,

		showShare: function() {
			var model = this.controller.get('model');
			if(!model) return;

			var type = model.get('type');

			var $rootElement = model.get('rootElement');
			var $ele = $rootElement.find('.entity-action .share a');
			var content = '<div class=\"share-popup\">	\
								<span class=\"pbxs pull-left\">share a link to this ' + type + '</span>	\
								<input type=\"text\" value=' + model.get('murl') + '>	\
								<a class=\"close-share pull-right\" style=\"padding:2px 0\">close</a>	\
							</div>';
			$ele.popover({
				title: '',
				html: true,
				content: content,
				placement: 'left',
				delay: { show: 50, hide: 1 },

			}).on('shown.bs.popover', function() {
				var that = this;
				$(that).siblings().find('.close-share').click(function(){
					$(that).popover('hide');
				})
			}).popover('show');
		},

		showAllComment: function() {
			var model = this.controller.get('model');
			if(!model) return;

			var type = model.get('type');

			var $rootElement = model.get('rootElement');
			$rootElement.find('.comment').removeClass('hide');
			$rootElement.find('.showMore').parent().remove();
		},

		deleteComment: function(comment) {
			var that = this;
			var model = that.controller.get('model');

			//show the confirmation modal
			$('#divDeleteModal .modal-title').html('Delete the Comment');
			$('#divDeleteModal .modal-body').html('<p>Are you sure you want to delete the comment?</p><p>This action cannot be undone.</p>');

			$('#divDeleteModal').modal('show');

			//on confirmation delete the comment
			$('#divDeleteModal .btn-danger').unbind('click').click(function(e) {
				//reset the state of the view
				var resetView = function() {
					$('#divDeleteModal .btn-danger').button('reset');
					$('#divDeleteModal').modal('hide');
				}

				//set the state of button to loading
				$('#divDeleteModal .btn-danger').button('loading');

				that.controller.deleteComment(comment, function() {
					//remove the comment object from list too
					model.get('comments').removeObject(comment);

					//reset the view
					resetView();
				}, function(error) {
					var alert = '<div style="width: 300px" class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred while deleting the comment. </div>';

					//show the comment and error
					$rootElement = model.get('rootElement');
					$rootElement.find('.action-delete-comment-error').html(alert).alert();

					//reset the view
					resetView();
				});
			});
		},

		deleteEntity: function() {
			var that = this;
			var model = that.controller.get('model');

			var type = model.get('type');
			//show the confirmation modal
			var entity = type === 'question' ? 'Question' : 'Answer';
			$('#divDeleteModal .modal-title').html('Delete the ' + entity);
			$('#divDeleteModal .modal-body').html('<p>Are you sure you want to delete the ' + entity + '?</p><p>You will loose all the points you earned on this ' + type + '.</p><p>This action cannot be undone.</p>');

			$('#divDeleteModal').modal('show');

			//on confirmation delete the entity
			$('#divDeleteModal .btn-danger').unbind('click').click(function(e) {
				//reset the state of the view
				var resetView = function() {
					$('#divDeleteModal .btn-danger').button('reset');
					$('#divDeleteModal').modal('hide');
				}

				//set the state of button to loading
				$('#divDeleteModal .btn-danger').button('loading');

				that.controller.deleteEntity(function() {
					//On success reload the page according to type of entity
					if(type === 'question') window.location = window.host;
					else window.location.reload();
				}, function(error) {
					var alert = '<div style="width: 300px" class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred while deleting the ' + type + '. </div>';
					
					//show error
					var $rootElement = model.get('rootElement');
					$rootElement.find('.action-delete-entity-error').html(alert).alert();

					//reset the view
					resetView();
				});
			});
		}
	});
}).call(this);