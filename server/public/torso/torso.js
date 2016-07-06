"use strict"

// register the application module

var callbacks = {
	"get_rotation": false
} 

b4w.register("torso", function(exports, require) {

	// import modules used by the app
	var m_app       = require("app");
	var m_data      = require("data");
	var m_logn		= require("logic_nodes");

	/**
	 * export the method to initialize the app (called at the bottom of this file)
	 */
	exports.init = function() {
		m_app.init({
			canvas_container_id: "canvas_cont",
			callback: init_cb,
			show_fps: true,
			console_verbose: false,
			autoresize: true
		});
	}

	/**
	 * callback executed when the app is initialized 
	 */
	function init_cb(canvas_elem, success) {

		if (!success) {
			console.log("b4w init failure");
			return;
		}
		load();
	}

	/**
	 * load the scene data
	 */
	function load() {
		m_data.load("torso.json", load_cb);
	}

	/**
	 * callback executed when the scene is loaded
	 */
	function load_cb(data_id) {
		m_app.enable_camera_controls();
		
		// Register the callbacks
		for (var callbackID in callbacks) {
			m_logn.append_custom_callback(callbackID, function (in_params, out_params) {
				var value = callbacks[callbackID];
				
				// Get random data if not in iframe
				if (value === false && self == top)
					 value = (Math.random() * 1000)
				
				out_params[0] = value;
			});
			console.log("Registered callback " + callbackID);
		}
	}
});

// import the app module and start the app by calling the init method
b4w.require("torso").init();
