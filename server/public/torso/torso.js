 "use strict"

/*
<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3
<3Rakkaalle Alexille: kutsu funktiota sensor_update_degree("sensor_name", sensor_min, sensor_max, sensor_value),											<3
<3jossa sensor_name on ko. käskyn caseista löytyvä nimi. esim. "L_Shoulder_X_Rot" (Vasemman olkapän x-suunnan kääntymistä mittaava sensori).				<3
<3Tämä päivittää globaalin kulma-arvon (eli missä kulmassa käden pitäisi olla), mutta ei vielä liikuta torsoa.												<3
<3Kun olet päivittänyt haluamasi arvot, kutsu komentoa rotate_all(), jolloin torson luut kääntyvät vastaamaan globaaleihin muuttujiin talletettuja arvojaan.<3
<3Toiseksialimmalla rivillä antamasi setinterval on vielä olemassa, mutta vaatii luonnollisesti jonkinlaista rukkaamista tähän hieman muuttuneeseen tyyliin.<3
<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3
*/
b4w.register("torso", function(exports, require) {

	var m_app    = require("app");
	var m_data   = require("data");
	var m_scs    = require("scenes");
	var m_armat  = require("armature");
	var m_tsr    = require("tsr");
	var m_quat	 = require("quat");

	var bones = ["Back_Lower", "Back_Middle", "Back_Upper", "Neck", "R_Shoulder", "R_Arm_Inner", "R_Arm_Outer", "L_Shoulder", "L_Arm_Inner", "L_Arm_Outer"];

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
	var Back_Lower_X_Min = -30;
	var Back_Lower_X_Max = 45;
	var Back_Lower_Y_Rot = 0;
	var Back_Lower_Y_Min = -45;
	var Back_Lower_Y_Max = 45;

	//+x bows forward
	//+y leans to the right
	var Back_Middle_X_Rot = 0;
	var Back_Middle_X_Min = -30;
	var Back_Middle_X_Max = 45;
	var Back_Middle_Y_Rot = 0;
	var Back_Middle_Y_Min = -30;
	var Back_Middle_Y_Max = 30;

	//+x bows forward
	//+y leans to the right
	var Back_Upper_X_Rot = 0;
	var Back_Upper_X_Min = -30;
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
		
		/*
		testausta varten toistaiseksi olemassa
		rotate_bone("Neck",30,20,0);
		rotate_bone("R_Shoulder",30,30,0);
		rotate_bone("L_Shoulder",0,30,0);
		rotate_bone("Back_Lower",10,-10,0);
		rotate_bone("Back_Lower",30,30,0);
		rotate_bone("Back_Middle",30,20,0);
		rotate_bone("Back_Upper",0,30,0);
		*/
		
		
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
				//+x eteen
				//+y oikealle
				limit_x = [dtr(Back_Lower_X_Min),dtr(Back_Lower_X_Max)];
				limit_y = [dtr(Back_Lower_Y_Min),dtr(Back_Lower_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "Back_Middle":
				//+x eteen
				//+y oikealle
				limit_x = [dtr(Back_Middle_X_Min),dtr(Back_Middle_X_Max)];
				limit_y = [dtr(Back_Middle_Y_Min),dtr(Back_Middle_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "Back_Upper":
				//+x eteen
				//+y oikealle
				limit_x = [dtr(Back_Upper_X_Min),dtr(Back_Upper_X_Max)];
				limit_y = [dtr(Back_Upper_Y_Min),dtr(Back_Upper_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "Neck":
				//+x eteen
				//+y oikealle
				limit_x = [dtr(Neck_X_Min),dtr(Neck_X_Max)];
				limit_y = [dtr(Neck_Y_Min),dtr(Neck_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "R_Shoulder":
				//+x eteen
				//+y ylös
				values[1] = -y;
				limit_x = [dtr(R_Shoulder_X_Min),dtr(R_Shoulder_X_Max)];
				limit_y = [dtr(R_Shoulder_Y_Min),dtr(R_Shoulder_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "L_Shoulder":
				//+x eteen
				//+y ylös
				limit_x = [dtr(L_Shoulder_X_Min),dtr(L_Shoulder_X_Max)];
				limit_y = [dtr(L_Shoulder_Y_Min),dtr(L_Shoulder_Y_Max)];
				limit_z = [dtr(0),dtr(0)];
				break;
			case "L_Arm_Inner":
				//+-y vaakataso/pystytaso  ylös/eteen
				//+-z suuntaan välillä (y-akselin kääntö, määrittää onko y ylös vai viistossa. + vie ylös)
				values[1] = -y;
				limit_x = [dtr(0),dtr(0)];
				limit_y = [dtr(L_Arm_Inner_Y_Min),dtr(L_Arm_Inner_Y_Max)];
				limit_z = [dtr(L_Arm_Inner_Z_Min),dtr(L_Arm_Inner_Z_Max)];
				break;
			case "R_Arm_Inner":
				//+-y vaakataso/pystytaso  ylös/eteen
				//+-z suuntaan välillä (y-akselin kääntö, määrittää onko y ylös vai viistossa. + vie ylös)
				values[1] = -y;
				values[2] = -z;
				limit_x = [dtr(0),dtr(0)];
				limit_y = [dtr(R_Arm_Inner_Y_Min),dtr(R_Arm_Inner_Y_Max)];
				limit_z = [dtr(R_Arm_Inner_Z_Min),dtr(R_Arm_Inner_Z_Max)];
				break;
			case "L_Arm_Outer":
				//+y eteenpäin
				values[1] = -y;
				limit_x = [0,0];
				limit_y = [dtr(L_Arm_Outer_Y_Min),dtr(L_Arm_Outer_Y_Max)];
				limit_z = [0,0];
				break;
			case "R_Arm_Outer":
				//+y eteenpäin
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
		
	exports.sensor_update_degree = function (sensor_name, sensor_min, sensor_max, sensor_value) {
		/*
		Takes the sensor reading and its max and min values and updates the global current rotation variable related to the sensor.
		Sensor_value should range from 0 to 1000.
		All bones aren't implemented to move with sensors yet. All sensors regarding prototype 2 are implemented.
		*/
		
		switch (sensor_name) {
			case "Back_X":
				//Currently whole back is modified to use one sensor per direction for all three virtual bones.
				var x1 = map_value_to_degree(Back_Lower_X_Min,Back_Lower_X_Max,sensor_min,sensor_max,sensor_value);
				Back_Lower_X_Rot = x1/2;
				var x2 = map_value_to_degree(Back_Middle_X_Min,Back_Middle_X_Max,sensor_min,sensor_max,sensor_value);
				Back_Middle_X_Rot = x2/2;
				var x3 = map_value_to_degree(Back_Upper_X_Min,Back_Upper_X_Max,sensor_min,sensor_max,sensor_value);
				Back_Upper_X_Rot = x3/2;
				break;
			case "Back_Y":
				//Currently whole back is modified to use one sensor per direction for all three virtual bones.
				var y1 = map_value_to_degree(Back_Lower_Y_Min,Back_Lower_Y_Max,sensor_min,sensor_max,sensor_value);
				Back_Lower_Y_Rot = y1/2;
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
				break;
		}
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
	
});

var animator = b4w.require("torso"); 
animator.init();
