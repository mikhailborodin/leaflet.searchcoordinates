L.Control.SearchCoords = L.Control.extend({

  options: {
    position: 'topleft'
  },

  initialize: function (options) {
    L.Control.prototype.initialize.call(this, options);
    this._actionsVisible = false;


  },

  onAdd: function () {
    var container = L.DomUtil.create('div', ''),
        toolbarContainer = L.DomUtil.create('div', 'leaflet-bar', container),
        l = 3,
        buttonsids = ['lat', 'lon'],
        buttonsText = ['Широта', 'Долгота'],
		    containerWidth = 280,
        actionsContainer = L.DomUtil.create('div', 'leaflet-find-actions', container),
        formContainer = L.DomUtil.create('form', 'form-inline', actionsContainer),
        i,
        div,
        button,
        link;

    this._toolbarContainer = toolbarContainer;
    actionsContainer.style.width = containerWidth + 'px';
    link = L.DomUtil.create('a', 'glyphicon glyphicon-search', toolbarContainer);
    link.href = '#';
    link.title = 'Find coordinates';

    L.DomEvent
        .on(link, 'click', L.DomEvent.stopPropagation)
        .on(link, 'mousedown', L.DomEvent.stopPropagation)
        .on(link, 'dblclick', L.DomEvent.stopPropagation)
        .on(link, 'click', L.DomEvent.preventDefault)
        .on(link, 'click', this.onFind, this);

    for (i = 0; i < l; i++) {
			div = L.DomUtil.create('div', 'form-group', formContainer);
      if (i == 2) {
        button = this._createInput({
          type: 'submit',
          container: div,
          callback: this.onActionClick,
          context: this
        });
      } else {
        button = this._createInput({
          type: 'text',
          name: buttonsids[i],
          text: buttonsText[i],
          container: div,
          context: this
        });
      }
		}

    this._actionsContainer = actionsContainer;
    return container;
  },

  _createButton: function (options) {
		var link = L.DomUtil.create('a', options.className || '', options.container);
		link.href = '#';

		if (options.text) {
			link.innerHTML = options.text;
		}

		if (options.title) {
			link.title = options.title;
		}

		L.DomEvent
			.on(link, 'click', L.DomEvent.stopPropagation)
			.on(link, 'mousedown', L.DomEvent.stopPropagation)
			.on(link, 'dblclick', L.DomEvent.stopPropagation)
			.on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', options.callback, options.context);

		return link;
	},

  _createInput: function(options){
    if (options.type == 'text') {
      var label = L.DomUtil.create('label', 'sr-only', options.container);
      label.setAttribute('for', 'input_' + options.name);
      label.innerHTML = options.text;

      var input = L.DomUtil.create('input', 'form-control input-sm', options.container);
      input.setAttribute('id', 'input_' + options.name);
      input.setAttribute('placeholder', options.text);
    } else if (options.type == 'submit') {
      var btn = L.DomUtil.create('div', 'btn btn-default btn-leaflet', options.container);
      btn.setAttribute('id', 'search');
      btn.innerHTML = 'Искать';
      L.DomEvent
        .on(btn, 'click', L.DomEvent.stopPropagation)
        .on(btn, 'mousedown', L.DomEvent.stopPropagation)
        .on(btn, 'dblclick', L.DomEvent.stopPropagation)
        .on(btn, 'click', L.DomEvent.preventDefault)
        .on(btn, 'click', options.callback, options.context);
    }


  },

  _showActionsToolbar: function () {
		L.DomUtil.addClass(this._toolbarContainer, 'leaflet-find-actions-visible');
		this._actionsContainer.style.display = 'block';

		this._actionsVisible = true;
	},

	_hideActionsToolbar: function () {
		this._actionsContainer.style.display = 'none';
		L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-find-actions-visible');

		this._actionsVisible = false;
	},

  coordValid: function (object, value) {
    if (object.selector == '#input_lat' && value > 90){
      object.attr('data-toggle', 'tooltip').attr('data-placement', 'top').attr('title', 'Широта не может быть больше 90 градусов');
      object.tooltip('show');
      return 0;
    }
    if (object.selector == '#input_lon' && value > 180){
      object.attr('data-toggle', 'tooltip').attr('data-placement', 'top').attr('title', 'Долгота не может быть больше 180 градусов');
      object.tooltip('show');
      return 0;
    }
    return value;
  },

  coordFormat: function (object) {
    var value = object.val();
    if (value === ''){
      object.attr('data-toggle', 'tooltip').attr('data-placement', 'top').attr('title', 'Обязательно для ввода');
      object.tooltip('show');
      return false;
    } else {
      object.tooltip('destroy');
    }

    if (/[a-z]|[а-я]/.test(value)) {
      object.attr('data-toggle', 'tooltip').attr('data-placement', 'top').attr('title', 'Неправильный формат');
      object.tooltip('show');
      return false;
    } else if (/\d{1,3}\s\d{1,2}\s\d+/.test(value)) {
      var array = value.split(/\s/);
      var d = parseInt(array[0]),m = parseInt(array[1])/60,s = parseInt(array[2])/3600;
      return this.coordValid(object, d+m+s);
    } else if (/\d{2,3}[\b]|\d{2,3}./.test(value)) {
      return this.coordValid(object, value);
    }
    else {
      object.attr('data-toggle', 'tooltip').attr('data-placement', 'top').attr('title', 'Неправильный формат');
      object.tooltip('show');
      return false;
    }
  },

  onActionClick: function () {
    var lat_obj = $('#input_lat'),
        lon_obj = $('#input_lon');
    var lat = this.coordFormat(lat_obj),
        lon = this.coordFormat(lon_obj);
    if (lat && lon){
      var marker = L.marker([lat, lon]).addTo(map);
    var container = L.DomUtil.create("div", "");
    var label = L.DomUtil.create("div", "", container);
    label.innerHTML = 'N ' + lat + '<br>' +'E ' + lon;

    var close = L.DomUtil.create("a", "", container);
    close.innerHTML = "Удалить маркер";
    close.href = "#";
    var stop = L.DomEvent.stopPropagation;

    L.DomEvent
      .on(close, 'click', stop)
      .on(close, 'mousedown', stop)
      .on(close, 'dblclick', stop)
      .on(close, 'click', L.DomEvent.preventDefault)
      .on(close, 'click', function() {
      this._map.removeLayer(marker);
    }, this);

    marker.bindPopup(container);

    map.setView(marker.getLatLng(), map.getZoom());
    }
	},

  onFind: function () {
    if (!this._actionsVisible) {
      this._showActionsToolbar();
    } else {
      this._hideActionsToolbar();
    }

	}
});

L.control.searchcoords = function (options) {
	return new L.Control.SearchCoords(options);
};

