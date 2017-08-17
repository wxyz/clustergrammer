var clusterfck = require('cornhundred-clusterfck');
var core = require('mathjs/core');
var math = core.create();
var dist_fun = require('./distance_functions');

math.import(require('mathjs/lib/function/matrix/transpose'));
math.import(require('mathjs/lib/type/matrix'));

module.exports = function recluster(mat, names){
  /*
  Rows are clustered. Run transpose before if necessary
  */

  // var transpose = math.transpose;

  console.log(dist_fun);

  // make cutoff_dist an array
  var cutoff_dist = 50;

  mat = [
   [20, 20, 80],
   [22, 22, 90],
   [250, 255, 253],
   [100, 54, 255]
  ];

  // var mat = this.params.network_data.mat;
  // mat = transpose(mat);


  var clusters = clusterfck.hcluster(mat, dist_fun.euclidean);
  // var clusters = clusterfck.hcluster(mat, dist_fun['cosine']);

  var inst_order = 0;
  var inst_group = 1;
  var order_array = [];
  var order_list = [];
  var inst_leaf;
  var inst_key;

  // start hierarchy
  var tree = clusters.tree;
  var start_level = 1;
  var start_distance = tree.dist;

  console.log('tree height', start_distance);

  // var cutoff_fractions = [];
  var cutoff_vals = [];
  var ini_locks = [];
  for (var i = 0; i <= 10; i++) {
    cutoff_vals.push(start_distance * i/10);
    ini_locks.push(false);
  }

  _.each(['left','right'], function(side){

    get_leaves(tree[side], side, start_level, start_distance, false, [false]);

  });

  function get_leaves(limb, side, inst_level, inst_dist, lock_group, lock_group_2){

    // set lock state (lock if distance is under resolvable distance) above cutoff
    if (inst_dist < cutoff_dist){
      lock_group = true;
      lock_group_2[0] = true;
    } else {
      lock_group = false;
      lock_group_2[0] = false;
    }


    // if there are more branches then there is a distance
    if ( _.has(limb, 'dist')){

      inst_dist = limb.dist;
      inst_level = inst_level + 1;

      _.each(['left', 'right'], function(side2){
        get_leaves(limb[side2], side2, inst_level, inst_dist, lock_group, lock_group_2);
      });

    } else {

      inst_key = limb.key;

      // increment group when group is not locked
      if (lock_group_2[0] === false){
        inst_group = inst_group + 1;
      }

      // correct for incrementing too early
      // if first node distance is above cutoff (resolvable) do not increment
      if (inst_group > inst_order + 1){
        inst_group = 1;
      }

      inst_leaf = {};
      inst_leaf.level = inst_level;
      inst_leaf.order = inst_order;
      inst_leaf.group = inst_group;
      inst_leaf.key = inst_key;
      inst_leaf.dist = inst_dist;

      order_array.push(inst_leaf);
      order_list.push(inst_key);

      // increment order when terminal node is found
      inst_order = inst_order + 1;

    }
  }

  // generate ordered names
  var inst_name;
  var ordered_names = [];
  _.each(order_list, function(index){
    inst_name = names[index];
    ordered_names.push(inst_name);
  });

  var order_info = {};
  order_info.info = order_array;
  order_info.order = order_list;
  order_info.ordered_names = ordered_names;

  return order_info;

};