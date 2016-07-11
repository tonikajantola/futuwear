 "use strict"

<<<<<<< HEAD
b4w.register("torso", function(exports, require) {

var m_app    = require("app");
var m_data   = require("data");
var m_scs    = require("scenes");
var m_armat  = require("armature");
//var m_tsr    = require("tsr");
=======
// register the application module

var callbacks = {
	"get_rotation": false,
	"shoulder_Z": false,
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
>>>>>>> master




<<<<<<< HEAD

exports.init = function() {
    m_app.init({
        canvas_container_id: "canvas_cont",
        callback: init_cb,
        show_fps: true,
        autoresize: true,
        console_verbose: true
    });
}

function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }
    load();
}

function load() {
    m_data.load("torso.json", load_cb);
}

function load_cb(data_id) {
    m_app.enable_camera_controls();
}

function rotate_all() {
	/*
	rotate_bone("Bone");
	rotate_bone("Bone.001");
	rotate_bone("Bone.002");
	rotate_bone("Bone.003");
	*/
	rotate_bone("Bone.004");
	
	rotate_bone("Bone.005");
	/*
	rotate_bone("Bone.006");
	rotate_bone("Bone.007");
	rotate_bone("Bone.008");
	rotate_bone("Bone.009");
	*/
	
	}
	

function rotate_bone(bone_name) {
	
	var rig = m_scs.get_object_by_name("Armature");
	var x = rotval();
	//var tsr=[Tx,Ty,Tz,S,Rx,Ry,Rz,Rw];
	var tsr = [0,  0, 0,1, 0, x, 0, 1];
	m_armat.set_bone_tsr_rel(rig, bone_name, tsr);
	
	
	//set_bone_tsr(armobj, bone_name, tsr);
	//set_bone_tsr(rig,"Bone.001",trans);
	
	}


function rotval() {
		var scale = (Math.random() - 0.5)/2;
		return scale;
	}

setInterval(function () { rotate_all() }, 300);
	
});
b4w.require("torso").init(); 
=======
	/**
	 * callback executed when the scene is loaded
	 */
	function load_cb(data_id) {
		m_app.enable_camera_controls();
		
		// Register the callbacks
		
		function prepareCallback(callbackID) {
			// Create a new function (why is this here? http://stackoverflow.com/q/750486)
			return function (in_params, out_params) {
				var value = callbacks[callbackID];
				
				if (value === false && self == top)
					 value = (Math.random() * 1000) // Get random data if not in iframe
				
				out_params[0] = parseInt(value);
			}
		}
		
		for (var callbackID in callbacks) {
			m_logn.append_custom_callback(callbackID, prepareCallback(callbackID));
			console.log("Registered callback " + callbackID);
		}
	}
	
	
});

// import the app module and start the app by calling the init method
b4w.require("torso").init();
>>>>>>> master
