 "use strict"

b4w.register("torso", function(exports, require) {

	var m_app    = require("app");
	var m_data   = require("data");
	var m_scs    = require("scenes");
	var m_armat  = require("armature");
	var m_tsr    = require("tsr");
	var m_quat	 = require("quat");
	var m_geom	 = require("geometry");
	var m_obj	 = require("objects");

	var bones = ["Back_Lower", "Back_Middle", "Back_Upper", "Neck", "R_Shoulder", "R_Arm_Inner", "R_Arm_Outer", "L_Shoulder", "L_Arm_Inner", "L_Arm_Outer"];
	var start_time = new Date()/1000;//seconds
	var sample_size = 100;
	var compare_time;//declared in acquire_fat
	var fat_value = 0;
	var index = 0;
	var back_values_old = [];
	var old_values_is_full = false;
	var back_values_new = [];
	var back_mean_new = 0;
	var back_mean_old = 0;

	/*
	Tweak these values to calibrate the shirt.
	The following values set the physical limits for rotation as well as provide
	a variable into the calculation of converting a sensor reading into a degree angle.
	Twisting bone motion is generally not implemented, because as of this point it doesn't seem it would even be measured.
	This is why each bone only has parameters for two rotational axis.
	*/

	//+x brings shoulder forward
	//+y raises the shoulder
	var L_Shoulder_X_Rot = 0;
	var L_Shoulder_X_Min = -20;
	var L_Shoulder_X_Max = 20;
	var L_Shoulder_Y_Rot = 0;
	var L_Shoulder_Y_Min = -20;
	var L_Shoulder_Y_Max = 20;

	//+x brings shoulder forward
	//+y raises the shoulder
	var R_Shoulder_X_Rot = 0;
	var R_Shoulder_X_Min = -20;
	var R_Shoulder_X_Max = 20;
	var R_Shoulder_Y_Rot = 0;
	var R_Shoulder_Y_Min = -20;
	var R_Shoulder_Y_Max = 20;

	//+y brings arm forward
	//+z rotates the y axis to face upwards
	//ex. y = 90 and z = 90 to point straight up
	var L_Arm_Inner_Y_Rot = 0;
	var L_Arm_Inner_Y_Min = -120;
	var L_Arm_Inner_Y_Max = 45;
	var L_Arm_Inner_Z_Rot = 0;
	var L_Arm_Inner_Z_Min = -90;
	var L_Arm_Inner_Z_Max = 90;

	//+y brings arm forward
	//+z rotates the y axis to face upwards
	//ex. y = 90 and z = 90 to point straight up
	var R_Arm_Inner_Y_Rot = 0;
	var R_Arm_Inner_Y_Min = -120;
	var R_Arm_Inner_Y_Max = 45;
	var R_Arm_Inner_Z_Rot = 0;
	var R_Arm_Inner_Z_Min = -90;
	var R_Arm_Inner_Z_Max = 90;

	//+y brings joint forward
	var R_Arm_Outer_Y_Rot = 0;
	var R_Arm_Outer_Y_Min = -150;
	var R_Arm_Outer_Y_Max = 0;

	//+y brings joint forward
	var L_Arm_Outer_Y_Rot = 0;
	var L_Arm_Outer_Y_Min = -150;
	var L_Arm_Outer_Y_Max = 0;

	//+x bows forward
	//+y leans to the right
	var Back_Lower_X_Rot = 0;
	var Back_Lower_X_Min = -90;
	var Back_Lower_X_Max = 90;
	var Back_Lower_Y_Rot = 0;
	var Back_Lower_Y_Min = -90;
	var Back_Lower_Y_Max = 90;

	//+x bows forward
	//+y leans to the right
	var Back_Middle_X_Rot = 0;
	var Back_Middle_X_Min = -5;
	var Back_Middle_X_Max = 45;
	var Back_Middle_Y_Rot = 0;
	var Back_Middle_Y_Min = -30;
	var Back_Middle_Y_Max = 30;

	//+x bows forward
	//+y leans to the right
	var Back_Upper_X_Rot = 0;
	var Back_Upper_X_Min = -5;
	var Back_Upper_X_Max = 45;
	var Back_Upper_Y_Rot = 0;
	var Back_Upper_Y_Min = -30;
	var Back_Upper_Y_Max = 30;

	//+x bows forward
	//+y leans to the right
	var Neck_X_Rot = 0;
	var Neck_X_Min = -30;
	var Neck_X_Max = 45;
	var Neck_Y_Rot = 0;
	var Neck_Y_Min = -40;
	var Neck_Y_Max = 40;





	exports.init = function() {
		m_app.init({
			canvas_container_id: "canvas_cont",
			callback: init_cb,
			show_fps: false,
			autoresize: true,
			console_verbose: false
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

	exports.rotate_all = function () {
		rotate_bone("R_Arm_Inner",0,R_Arm_Inner_Y_Rot,R_Arm_Inner_Z_Rot);
		rotate_bone("L_Arm_Inner",0,L_Arm_Inner_Y_Rot,L_Arm_Inner_Z_Rot);
		rotate_bone("L_Arm_Outer",0,L_Arm_Outer_Y_Rot,0);
		rotate_bone("R_Arm_Outer",0,R_Arm_Outer_Y_Rot,0);
		rotate_bone("Neck",Neck_X_Rot,Neck_Y_Rot,0);
		rotate_bone("R_Shoulder",R_Shoulder_X_Rot,R_Shoulder_Y_Rot,0);
		rotate_bone("L_Shoulder",L_Shoulder_X_Rot,L_Shoulder_Y_Rot,0);
		rotate_bone("Back_Lower",Back_Lower_X_Rot,Back_Lower_Y_Rot,0);
		rotate_bone("Back_Middle",Back_Middle_X_Rot,Back_Middle_Y_Rot,0);
		rotate_bone("Back_Upper",Back_Upper_X_Rot,Back_Upper_Y_Rot,0);	
	}
		
	function euler_to_quat(roll, pitch, yaw) {
		//Converts rotation coordinates from euer to quaternion, which is used by tsr transform.
		var cr, cp, cy, sr, sp, sy, cpcy, spsy, w, x, y, z;
		cr = Math.cos(roll/2);
		cp = Math.cos(pitch/2);
		cy = Math.cos(yaw/2);
		sr = Math.sin(roll/2);
		sp = Math.sin(pitch/2);
		sy = Math.sin(yaw/2);
		cpcy = cp * cy;
		spsy = sp * sy;
		
		w = cr * cpcy + sr * spsy;
		x = sr * cpcy - cr * spsy;
		y = cr * sp * cy + sr * cp * sy;
		z = cr * cp * sy - sr * sp * cy;
		var quat = [x, y, z, w];
		return quat;
	}
		
	function dtr(val) {
		//converts degrees to radians
		var rads = val*Math.PI/180;
		return rads;
		
	}
		

	function rotate_bone(bone_name,x,y,z) {
		
		var rig = m_scs.get_object_by_name("Armature");
		
		var values = [x,y,z];
		var limit_x = [0,0];
		var limit_y = [0,0];
		var limit_z = [0,0];
		var limits;
		
		
		switch (bone_name) {
			case "Back_Lower":
				//+x forward
				//+y to the right
				limit_x = [dtr(Back_Lower_X_Min),dtr(Back_Lower_X_Max)];
				limit_y = [dtr(Back_Lower_Y_Min),dtr(Back_Lower_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "Back_Middle":
				//+x forward
				//+y to the right
				limit_x = [dtr(Back_Middle_X_Min),dtr(Back_Middle_X_Max)];
				limit_y = [dtr(Back_Middle_Y_Min),dtr(Back_Middle_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "Back_Upper":
				//+x forward
				//+y to the right
				limit_x = [dtr(Back_Upper_X_Min),dtr(Back_Upper_X_Max)];
				limit_y = [dtr(Back_Upper_Y_Min),dtr(Back_Upper_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "Neck":
				//+x forward
				//+y to the right
				limit_x = [dtr(Neck_X_Min),dtr(Neck_X_Max)];
				limit_y = [dtr(Neck_Y_Min),dtr(Neck_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "R_Shoulder":
				//+x forward
				//+y upwards
				values[1] = -y;
				limit_x = [dtr(R_Shoulder_X_Min),dtr(R_Shoulder_X_Max)];
				limit_y = [dtr(R_Shoulder_Y_Min),dtr(R_Shoulder_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "L_Shoulder":
				//+x forward
				//+y upwards
				limit_x = [dtr(L_Shoulder_X_Min),dtr(L_Shoulder_X_Max)];
				limit_y = [dtr(L_Shoulder_Y_Min),dtr(L_Shoulder_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "L_Arm_Inner":
				//+-y + take the arm forward or upward depending on the current z-axis twist
				//+-z rotation of the y-axis (+ turns the y-axis to face up) this in itself only twists the arm
				values[1] = -y;
				limit_x = [dtr(0),dtr(0)];
				limit_y = [dtr(L_Arm_Inner_Y_Min),dtr(L_Arm_Inner_Y_Max)];
				limit_z = [dtr(L_Arm_Inner_Z_Min),dtr(L_Arm_Inner_Z_Max)];
				break;
			case "R_Arm_Inner":
				//+-y + take the arm forward or upward depending on the current z-axis twist
				//+-z rotation of the y-axis (+ turns the y-axis to face up) this in itself only twists the arm
				values[1] = -y;
				values[2] = -z;
				limit_x = [dtr(0),dtr(0)];
				limit_y = [dtr(R_Arm_Inner_Y_Min),dtr(R_Arm_Inner_Y_Max)];
				limit_z = [dtr(R_Arm_Inner_Z_Min),dtr(R_Arm_Inner_Z_Max)];
				break;
			case "L_Arm_Outer":
				//+y forward
				values[1] = -y;
				limit_x = [0,0];
				limit_y = [dtr(L_Arm_Outer_Y_Min),dtr(L_Arm_Outer_Y_Max)];
				limit_z = [0,0];
				break;
			case "R_Arm_Outer":
				//+y forward
				values[1] = -y;
				limit_x = [0,0];
				limit_y = [dtr(R_Arm_Outer_Y_Min),dtr(R_Arm_Outer_Y_Max)];
				limit_z = [0,0];
				break;
			default:
				break;
		}
		
		values = [dtr(values[0]),dtr(values[1]),dtr(values[2])];
		limits = [limit_x,limit_y,limit_z];
		var i = 0;
		while (i < 3) {
			if (values[i] < limits[i][0]) {values[i] = limits[i][0];}
			if (values[i] > limits[i][1]) {values[i] = limits[i][1];}
			i = i + 1;
		}
				
		var arm_tsr = [0,0,0,1];
		var quat = euler_to_quat(values[0],values[1],values[2]);
		m_tsr.set_quat(quat,arm_tsr);
		//tsr format is: [Tx,Ty,Tz,S,Rx,Ry,Rz,Rw];
		m_armat.set_bone_tsr_rel(rig, bone_name, arm_tsr);
		
	}
	
	function calculate_mean(){
		/*
		Updates the global variables back_mean_old and back_mean_new.
		*/
		var ka = 0;
		var i = 0;
		if (old_values_is_full == false) {
			while (i < sample_size) {
				ka = ka + back_values_old[i];
				i = i + 1;
			}
			back_mean_old = ka / sample_size;
		}
		else {
			while (i < sample_size) {
				ka = ka + back_values_new[i];
				i = i + 1;
			}
			back_mean_new = ka / sample_size;
		}
		
	}
	
	function acquire_fat(new_angle) {
		/*
		Compares the means of last 100 angle changes in a sensor and compares them to the 100 values before them.
		If the mean hasn't canged enough, fat will be acquired.
		There is a time window between both of the large samples, which are compared to each other.
		This time is at least min_interval_for_change (in seconds). Actually reading sensors slows down the process a bit further.
		*/
		var obj = m_scs.get_object_by_name("Arnold");
		var min_interval_for_change = 2;//in seconds
		var required_change = 25;//% change from last mean. Used as a threshold to see if change is necessary.
		var fat_change = 0.05;//0 for athlete, 1 for maximum mass. This variable determines the amount each step increments the transformation.
		var slim_multiplier = 4;//Multiplier for weight loss. This enables small stretching to slim down hours of fat accumulation.
		var compare_time = new Date()/1000 - start_time;
		
		if (old_values_is_full == false) {
			back_values_old[index] = new_angle;
			index = index + 1;
			if (index == sample_size) {
				calculate_mean();
				old_values_is_full = true;
				index = 0;
			}
		}
		else if (index < sample_size && old_values_is_full == true && compare_time > min_interval_for_change) {
			back_values_new[index] = new_angle;
			index = index + 1;
		}
		else if (index == sample_size){
			//Here the global mean values are compared and mesh updated accordingly.
			calculate_mean();
			index = 0;
			
			var change = (Math.abs((back_mean_new - back_mean_old)) / back_mean_old) * 100;//% change from the old position
			if (change < required_change) {
				back_mean_old = back_mean_new;
				fat_value = fat_value + fat_change;
				if (fat_value > 1) {fat_value = 1;}
				m_geom.set_shape_key_value(obj, "Engineer_Stomach", fat_value);
				start_time = new Date()/1000;
			}
			else if (change >= required_change){
				back_mean_old = back_mean_new;
				fat_value = fat_value - slim_multiplier*fat_change;
				if (fat_value < 0) {fat_value = 0;}
				m_geom.set_shape_key_value(obj, "Engineer_Stomach", fat_value);
				start_time = new Date()/1000;
			}
			
			
		}
		
		
	}
	
	exports.sensor_update_accelerometer = function (sensor_name, angle_x, angle_y) {
		switch (sensor_name) {
			case "Back_Lower":
				Back_Lower_X_Rot = angle_x;
				Back_Lower_Y_Rot = angle_y;
				break;
			case "Back_Upper":
				Back_Middle_X_Rot = angle_x/2;
				if (Back_Middle_X_Rot > Back_Middle_X_Max) {Back_Middle_X_Rot = Back_Middle_X_Max;}
				if (Back_Middle_X_Rot < Back_Middle_X_Min) {Back_Middle_X_Rot = Back_Middle_X_Min;}
				
				Back_Middle_Y_Rot = angle_y/2;
				if (Back_Middle_Y_Rot > Back_Middle_Y_Max) {Back_Middle_Y_Rot = Back_Middle_Y_Max;}
				if (Back_Middle_Y_Rot < Back_Middle_Y_Min) {Back_Middle_Y_Rot = Back_Middle_Y_Min;}
				
				Back_Upper_X_Rot = angle_x/2;
				if (Back_Upper_X_Rot > Back_Upper_X_Max) {Back_Upper_X_Rot = Back_Upper_X_Max;}
				if (Back_Upper_X_Rot < Back_Upper_X_Min) {Back_Upper_X_Rot = Back_Upper_X_Min;}
				
				Back_Upper_Y_Rot = angle_y/2;
				if (Back_Upper_Y_Rot > Back_Upper_Y_Max) {Back_Upper_Y_Rot = Back_Upper_Y_Max;}
				if (Back_Upper_Y_Rot < Back_Upper_Y_Min) {Back_Upper_Y_Rot = Back_Upper_Y_Min;}
				break;
		}
	}
		
	exports.sensor_update_degree = function (sensor_name, sensor_min, sensor_max, sensor_value) {
		/*
		Takes the sensor reading and its max and min values and updates the global current rotation variable related to the sensor.
		Sensor_value should range from 0 to 1000.
		All bones aren't implemented to move with sensors yet. All sensors regarding the final prototype are implemented.
		*/
		
		switch (sensor_name) {
			case "Back_Lower_X":
				var x1 = map_value_to_degree(Back_Lower_X_Min,Back_Lower_X_Max,sensor_min,sensor_max,sensor_value);
				Back_Lower_X_Rot = x1;
				break;
			case "Back_Lower_Y":
				var y1 = map_value_to_degree(Back_Lower_Y_Min,Back_Lower_Y_Max,sensor_min,sensor_max,sensor_value);
				Back_Lower_Y_Rot = y1;
				break;
			case "Back_X":
				//Currently whole upper back is modified to use one sensor per direction for two virtual bones.
				var x2 = map_value_to_degree(Back_Middle_X_Min,Back_Middle_X_Max,sensor_min,sensor_max,sensor_value);
				Back_Middle_X_Rot = x2/2;
				var x3 = map_value_to_degree(Back_Upper_X_Min,Back_Upper_X_Max,sensor_min,sensor_max,sensor_value);
				Back_Upper_X_Rot = x3/2;
				
				//Here we determine if fat is changed
				acquire_fat(Back_Middle_X_Rot);
				break;
			case "Back_Y":
				//Currently whole upper back is modified to use one sensor per direction for two virtual bones.
				var y2 = map_value_to_degree(Back_Middle_Y_Min,Back_Middle_Y_Max,sensor_min,sensor_max,sensor_value);
				Back_Middle_Y_Rot = y2/2;
				var y3 = map_value_to_degree(Back_Upper_Y_Min,Back_Upper_Y_Max,sensor_min,sensor_max,sensor_value);
				Back_Upper_Y_Rot = y3/2;
			case "L_Shoulder_X_Rot":
				var x = map_value_to_degree(L_Shoulder_X_Min,L_Shoulder_X_Max,sensor_min,sensor_max,sensor_value);
				L_Shoulder_X_Rot = x;
				break;
			case "L_Shoulder_Y_Rot":
				var y = map_value_to_degree(L_Shoulder_Y_Min,L_Shoulder_Y_Max,sensor_min,sensor_max,sensor_value);
				L_Shoulder_Y_Rot = y;
				break;
			case "R_Shoulder_X_Rot":
				var x = map_value_to_degree(R_Shoulder_X_Min,R_Shoulder_X_Max,sensor_min,sensor_max,sensor_value);
				R_Shoulder_X_Rot = x;
				break;
			case "R_Shoulder_Y_Rot":
				var y = map_value_to_degree(R_Shoulder_Y_Min,R_Shoulder_Y_Max,sensor_min,sensor_max,sensor_value);
				R_Shoulder_Y_Rot = y;
				break;
			case "L_Arm_Outer":
				var y = map_value_to_degree(L_Arm_Outer_Y_Min,L_Arm_Outer_Y_Max,sensor_min,sensor_max,sensor_value);
				L_Arm_Outer_Y_Rot = y;
				break;
			case "R_Arm_Outer":
				var y = map_value_to_degree(R_Arm_Outer_Y_Min,R_Arm_Outer_Y_Max,sensor_min,sensor_max,sensor_value);
				R_Arm_Outer_Y_Rot = y;
				break;
			default:
				return false;
				break;
		}
		return true
	}

	function map_value_to_degree(angle_min, angle_max, sensor_min, sensor_max, sensor_value) {
		/*
		Maps the sensorvalue into range from zero to one.
		Tells how many degrees to rotate from the min value (size is now right).
		Puts the calculated value into the correct range.
		*/
		var zero_to_one = (sensor_value - sensor_min)/(sensor_max - sensor_min);
		var in_degree_range = (angle_max - angle_min)*zero_to_one;
		var degrees = angle_min + in_degree_range;
		return degrees;
	}
	
	//setInterval(function () { acquire_fat(30) }, 10); //Mainly for testing, so all the code doesn't have to be uploaded to the server for that purpose.
});

var animator = b4w.require("torso"); 
animator.init();

