 "use strict"

b4w.register("torso", function(exports, require) {

var m_app    = require("app");
var m_data   = require("data");
var m_scs    = require("scenes");
var m_armat  = require("armature");
//var m_tsr    = require("tsr");





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