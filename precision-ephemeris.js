(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PrecisionEphemeris = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Utility functions
  var DEG2RAD = Math.PI / 180;
  var RAD2DEG = 180 / Math.PI;

  function normalize(v) {
    var r = v % 360;
    return r < 0 ? r + 360 : r;
  }

  // Julian centuries from J2000.0
  function T(jd) {
    return (jd - 2451545.0) / 36525.0;
  }

  // ========== VSOP87 EARTH/SUN ==========
  // Sun geocentric longitude derived from Earth heliocentric longitude (VSOP87)
  // Format: [amplitude, phase, frequency]
  var EARTH_L0 = [
    [175347046.0, 0.0, 0.0],
    [3341656.0, 4.6692568, 6283.0758500],
    [34894.0, 4.6261, 12566.1517],
    [3497.0, 2.7441, 5753.3849],
    [3418.0, 2.8289, 3.5232],
    [3136.0, 3.6277, 77713.7715],
    [2676.0, 4.4181, 7860.4194],
    [2343.0, 6.1352, 3930.2097],
    [1324.0, 0.7425, 11506.7698],
    [1273.0, 2.0371, 529.6910],
    [1199.0, 1.1096, 1577.3435],
    [990.0, 5.233, 5884.927],
    [902.0, 2.045, 26.298],
    [857.0, 3.508, 398.149],
    [780.0, 1.179, 5223.694],
    [753.0, 2.533, 5507.553],
    [505.0, 4.583, 18849.228],
    [492.0, 4.205, 775.522],
    [357.0, 2.920, 0.067],
    [317.0, 5.849, 11790.629],
    [284.0, 1.899, 796.298],
    [271.0, 0.315, 10977.079],
    [243.0, 0.345, 5486.778],
    [206.0, 4.806, 2544.314],
    [205.0, 1.869, 5573.143],
    [202.0, 2.458, 6069.777],
    [156.0, 0.833, 213.299],
    [132.0, 3.411, 2942.463],
    [126.0, 1.083, 20.775],
    [115.0, 0.645, 0.980],
    [103.0, 0.636, 4694.003],
    [99.0, 6.21, 15720.839],
    [98.0, 0.68, 7.114],
    [86.0, 5.98, 11769.854],
    [72.0, 1.14, 7632.943],
    [68.0, 1.87, 801.821],
    [67.0, 4.41, 24.298],
    [59.0, 2.89, 10447.388],
    [56.0, 2.17, 6275.962],
    [45.0, 0.40, 8827.390]
  ];

  var EARTH_L1 = [
    [628331966747.0, 0.0, 0.0],
    [206059.0, 2.678235, 6283.07585],
    [4303.0, 2.6351, 12566.1517],
    [425.0, 1.590, 3.523],
    [119.0, 5.796, 26.298],
    [109.0, 2.966, 1577.344],
    [93.0, 2.59, 18849.23],
    [72.0, 1.14, 529.69],
    [68.0, 1.87, 398.15],
    [67.0, 4.41, 5507.55],
    [59.0, 2.89, 5223.69],
    [56.0, 2.17, 155.42],
    [45.0, 0.40, 796.30],
    [36.0, 0.47, 775.52],
    [29.0, 2.65, 7.11],
    [21.0, 5.34, 0.98],
    [19.0, 1.85, 5486.78],
    [19.0, 4.97, 213.30],
    [17.0, 2.99, 6275.96],
    [16.0, 0.03, 2544.31]
  ];

  var EARTH_L2 = [
    [52919.0, 0.0, 0.0],
    [8720.0, 1.0721, 6283.0758],
    [309.0, 0.867, 12566.152],
    [27.0, 0.05, 3.52],
    [16.0, 5.19, 26.30],
    [16.0, 3.68, 155.42],
    [10.0, 0.76, 18849.23],
    [9.0, 2.06, 77713.77],
    [7.0, 0.83, 775.52],
    [5.0, 4.66, 1577.34]
  ];

  var EARTH_L3 = [
    [289.0, 5.844, 6283.076],
    [35.0, 0.0, 0.0],
    [17.0, 5.49, 12566.15],
    [3.0, 5.20, 155.42],
    [1.0, 4.72, 3.52]
  ];

  var EARTH_L4 = [
    [114.0, 3.142, 0.0],
    [8.0, 4.13, 6283.08],
    [1.0, 3.84, 12566.15]
  ];

  function sumVSOP(terms, t) {
    var s = 0;
    for (var i = 0; i < terms.length; i++) {
      s += terms[i][0] * Math.cos(terms[i][1] + terms[i][2] * t);
    }
    return s;
  }

  function earthHelioLon(t) {
    var l0 = sumVSOP(EARTH_L0, t);
    var l1 = sumVSOP(EARTH_L1, t);
    var l2 = sumVSOP(EARTH_L2, t);
    var l3 = sumVSOP(EARTH_L3, t);
    var l4 = sumVSOP(EARTH_L4, t);
    var L = (l0 + l1 * t + l2 * t * t + l3 * t * t * t + l4 * t * t * t * t) / 1e8;
    return normalize(L * RAD2DEG);
  }

  function sunGeoLon(jd) {
    var t = T(jd) / 10; // VSOP uses millennia
    var L = earthHelioLon(t);
    // Convert Earth helio to Sun geo: add 180, apply aberration
    var sunLon = normalize(L + 180.0);
    // Aberration correction
    sunLon -= 0.00569;
    // FK5 correction
    var t2 = T(jd);
    sunLon -= 0.01397 * t2; // approximate nutation
    return normalize(sunLon);
  }

  // ========== MERCURY VSOP87 ==========
  var MERCURY_L0 = [
    [440250710.0, 0.0, 0.0],
    [40989415.0, 1.48302034, 26087.90314],
    [5046294.0, 4.4778549, 52175.8063],
    [855347.0, 1.165203, 78263.709],
    [165590.0, 4.119692, 104351.613],
    [34562.0, 0.77931, 130439.516],
    [7583.0, 3.7135, 156527.419],
    [3560.0, 1.5120, 1109.179],
    [1803.0, 4.1033, 5661.332],
    [1726.0, 0.3583, 182615.322],
    [1590.0, 2.9951, 25028.521],
    [1365.0, 4.5992, 27197.282],
    [1017.0, 0.8803, 31749.235],
    [714.0, 1.541, 24978.525],
    [644.0, 5.303, 21535.950],
    [451.0, 6.050, 51116.424],
    [404.0, 3.282, 208703.225],
    [352.0, 5.242, 20426.571],
    [345.0, 2.792, 15874.618],
    [343.0, 5.765, 955.600],
    [339.0, 5.863, 25558.212],
    [325.0, 1.337, 53285.185],
    [273.0, 2.495, 529.691],
    [264.0, 3.917, 57837.138],
    [260.0, 0.987, 4551.953],
    [239.0, 0.113, 1059.382],
    [235.0, 0.267, 11322.664],
    [217.0, 0.660, 13521.751],
    [209.0, 2.092, 47623.853],
    [183.0, 2.629, 27043.503]
  ];

  var MERCURY_L1 = [
    [2608814706223.0, 0.0, 0.0],
    [1126008.0, 6.2170397, 26087.9031416],
    [303471.0, 3.055655, 52175.806],
    [80538.0, 6.10455, 78263.709],
    [21245.0, 2.83532, 104351.613],
    [5765.0, 5.8298, 130439.516],
    [1578.0, 2.5450, 156527.419],
    [706.0, 3.589, 1109.179],
    [517.0, 5.566, 182615.322],
    [440.0, 5.442, 5661.332]
  ];

  var MERCURY_L2 = [
    [53050.0, 0.0, 0.0],
    [16904.0, 4.69072, 26087.90314],
    [7397.0, 1.3474, 52175.806],
    [3018.0, 4.4564, 78263.709],
    [1107.0, 1.264, 104351.613],
    [378.0, 4.320, 130439.516],
    [123.0, 1.069, 156527.419],
    [39.0, 4.08, 182615.322]
  ];

  // ========== VENUS VSOP87 ==========
  var VENUS_L0 = [
    [317614667.0, 0.0, 0.0],
    [1353968.0, 5.5931332, 10213.2855462],
    [89892.0, 5.30650, 20426.571],
    [5477.0, 4.4163, 7860.419],
    [3456.0, 2.6996, 11790.629],
    [2372.0, 2.9938, 3930.210],
    [1664.0, 4.2502, 1577.344],
    [1438.0, 4.1575, 9683.595],
    [1317.0, 5.1867, 26.298],
    [1201.0, 6.1536, 30639.857],
    [769.0, 0.816, 9437.763],
    [761.0, 1.950, 529.691],
    [708.0, 1.065, 775.522],
    [585.0, 3.998, 191.448],
    [500.0, 4.123, 15720.839],
    [429.0, 3.586, 19367.189],
    [327.0, 5.677, 5507.553],
    [326.0, 4.591, 10404.734],
    [232.0, 3.163, 9153.904],
    [180.0, 4.653, 1109.179],
    [155.0, 5.570, 19651.048],
    [128.0, 4.226, 20.775],
    [128.0, 0.962, 5661.332]
  ];

  var VENUS_L1 = [
    [1021352943053.0, 0.0, 0.0],
    [95708.0, 2.46424, 10213.28555],
    [14445.0, 0.51625, 20426.571],
    [213.0, 1.795, 30639.857],
    [174.0, 2.655, 26.298],
    [152.0, 5.201, 1577.344],
    [82.0, 5.08, 40853.142],
    [70.0, 3.22, 7860.42]
  ];

  var VENUS_L2 = [
    [54127.0, 0.0, 0.0],
    [3891.0, 0.3451, 10213.286],
    [1338.0, 2.0201, 20426.571],
    [24.0, 2.05, 26.30],
    [19.0, 3.54, 30639.86],
    [10.0, 3.97, 775.52],
    [7.0, 1.52, 1577.34]
  ];

  // ========== MARS VSOP87 ==========
  var MARS_L0 = [
    [620347712.0, 0.0, 0.0],
    [18656368.0, 5.0503710, 3340.6124267],
    [1108217.0, 5.4009984, 6681.2248534],
    [91798.0, 5.75479, 10021.83728],
    [27745.0, 5.97050, 3.52312],
    [12316.0, 0.84956, 2810.92146],
    [10610.0, 2.93959, 2281.23050],
    [8927.0, 4.1570, 0.0173],
    [8716.0, 6.1101, 13362.4497],
    [7775.0, 3.3397, 5621.8429],
    [6798.0, 0.3646, 398.1490],
    [4161.0, 0.2281, 2942.4634],
    [3575.0, 1.6619, 2544.3144],
    [3075.0, 0.8570, 191.4483],
    [2938.0, 6.0789, 0.0673],
    [2628.0, 0.6481, 3337.0893],
    [2580.0, 0.0300, 3344.1355],
    [2389.0, 5.0390, 796.2983],
    [1799.0, 0.6563, 529.6910],
    [1546.0, 2.9158, 1751.5395],
    [1528.0, 1.1498, 6151.5339],
    [1286.0, 3.0680, 2146.1654],
    [1264.0, 3.6228, 5092.1520],
    [1025.0, 3.6933, 8962.4553],
    [892.0, 0.183, 16703.062],
    [859.0, 2.401, 2914.014],
    [833.0, 4.495, 3340.630],
    [833.0, 2.464, 3340.595],
    [749.0, 3.822, 155.420],
    [724.0, 0.675, 3738.761]
  ];

  var MARS_L1 = [
    [334085627474.0, 0.0, 0.0],
    [1458227.0, 3.6042, 3340.6124],
    [164901.0, 3.926, 6681.225],
    [19963.0, 4.266, 10021.837],
    [3452.0, 4.732, 3.523],
    [2485.0, 4.613, 13362.450],
    [842.0, 4.459, 2281.230],
    [538.0, 5.016, 398.149],
    [521.0, 4.994, 3344.136],
    [433.0, 2.561, 191.448]
  ];

  var MARS_L2 = [
    [58016.0, 2.04979, 3340.61243],
    [54188.0, 0.0, 0.0],
    [13908.0, 2.4571, 6681.2249],
    [2465.0, 2.800, 10021.837],
    [398.0, 3.140, 13362.450],
    [222.0, 3.194, 3.523],
    [121.0, 0.543, 155.420],
    [62.0, 3.49, 16703.06]
  ];

  // ========== JUPITER VSOP87 ==========
  var JUPITER_L0 = [
    [59954691.0, 0.0, 0.0],
    [9695899.0, 5.0619179, 529.6909651],
    [573610.0, 1.444062, 7.113547],
    [306389.0, 5.417347, 1059.382],
    [97178.0, 4.14265, 632.784],
    [72903.0, 3.64043, 522.577],
    [64264.0, 3.41145, 103.093],
    [39806.0, 2.29377, 419.485],
    [38858.0, 1.27232, 316.392],
    [27965.0, 1.78455, 536.805],
    [13590.0, 5.77481, 1589.073],
    [8769.0, 3.6300, 949.176],
    [8246.0, 3.5823, 206.186],
    [7368.0, 5.0810, 735.877],
    [6263.0, 0.025, 213.299],
    [6114.0, 4.5132, 1162.475],
    [5305.0, 1.3067, 14.227],
    [4905.0, 1.3208, 110.206],
    [4647.0, 4.6996, 3.932],
    [3045.0, 4.3168, 426.598],
    [2610.0, 1.5667, 846.083],
    [2028.0, 1.0638, 3.181],
    [1921.0, 0.9717, 639.897],
    [1765.0, 2.1415, 1066.495],
    [1723.0, 3.8804, 1265.567],
    [1633.0, 3.5820, 515.464],
    [1432.0, 4.2968, 625.670],
    [973.0, 4.098, 95.979],
    [884.0, 2.437, 412.371],
    [733.0, 6.085, 838.969]
  ];

  var JUPITER_L1 = [
    [52993480757.0, 0.0, 0.0],
    [489741.0, 4.220667, 529.690965],
    [228919.0, 6.026475, 7.113547],
    [27655.0, 4.57266, 1059.382],
    [20721.0, 5.45939, 522.577],
    [12106.0, 0.16986, 536.805],
    [6068.0, 4.4242, 103.093],
    [5434.0, 3.9848, 419.485],
    [4238.0, 5.8901, 14.227],
    [2212.0, 5.2677, 206.186]
  ];

  var JUPITER_L2 = [
    [47234.0, 4.32148, 7.11355],
    [38966.0, 0.0, 0.0],
    [30629.0, 2.93021, 529.691],
    [3189.0, 1.055, 522.577],
    [2729.0, 4.845, 536.805],
    [2723.0, 3.415, 1059.382],
    [1721.0, 4.187, 14.227],
    [383.0, 5.768, 419.485],
    [378.0, 0.760, 515.464],
    [367.0, 6.055, 103.093]
  ];

  // ========== SATURN VSOP87 ==========
  var SATURN_L0 = [
    [87401354.0, 0.0, 0.0],
    [11107660.0, 3.96205090, 213.29909544],
    [1414151.0, 4.5858152, 7.1135470],
    [398379.0, 0.521120, 206.186],
    [350769.0, 3.303299, 426.598],
    [206816.0, 0.246584, 103.093],
    [79271.0, 3.84007, 220.413],
    [23990.0, 4.66977, 110.206],
    [16574.0, 0.43719, 419.485],
    [15820.0, 0.93809, 632.784],
    [15054.0, 2.71670, 639.897],
    [14907.0, 5.76903, 316.392],
    [14610.0, 1.56519, 3.932],
    [13160.0, 4.44891, 14.227],
    [13005.0, 5.98119, 11.046],
    [10725.0, 3.12940, 202.254],
    [6126.0, 1.7633, 277.035],
    [5863.0, 0.2366, 529.691],
    [5228.0, 4.2078, 3.181],
    [5020.0, 3.1779, 433.712],
    [4593.0, 0.6198, 199.072],
    [4006.0, 2.2448, 63.736],
    [3874.0, 3.2228, 138.517],
    [3269.0, 0.7749, 949.176],
    [2954.0, 0.9828, 95.979],
    [2461.0, 2.0316, 735.877],
    [1758.0, 3.2658, 522.577],
    [1640.0, 5.5050, 846.083],
    [1581.0, 4.3727, 309.278],
    [1391.0, 4.0233, 323.505]
  ];

  var SATURN_L1 = [
    [21354295596.0, 0.0, 0.0],
    [1296855.0, 1.8282054, 213.2990954],
    [564348.0, 2.885, 7.114],
    [107679.0, 2.27769, 206.186],
    [98323.0, 1.08070, 426.598],
    [40255.0, 2.04128, 220.413],
    [19942.0, 1.27955, 103.093],
    [10512.0, 2.7488, 14.227],
    [6939.0, 0.4049, 639.897],
    [4803.0, 2.4419, 419.485]
  ];

  var SATURN_L2 = [
    [116441.0, 1.179879, 7.113547],
    [91921.0, 0.0, 0.0],
    [90592.0, 4.51809, 213.29910],
    [15277.0, 4.06492, 206.18555],
    [10631.0, 0.25778, 220.41264],
    [10605.0, 5.40964, 426.59819],
    [4265.0, 1.046, 14.227],
    [1216.0, 2.917, 103.093],
    [1165.0, 4.604, 639.897],
    [1082.0, 5.696, 433.712]
  ];

  // ========== ELP2000 MOON ==========
  // Main terms for Moon longitude [D, M, Mp, F, coeff_sin_longitude (in 0.000001 deg)]
  var MOON_TERMS = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810],
    [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713],
    [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691],
    [2, -1, 0, -2, 596],
    [4, 0, 1, 0, 549],
    [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520],
    [1, 0, -2, 0, -487]
  ];

  function moonLongitude(jd) {
    var t = T(jd);
    // Fundamental arguments (degrees)
    var Lp = normalize(218.3164477 + 481267.88123421 * t
      - 0.0015786 * t * t + t * t * t / 538841 - t * t * t * t / 65194000);
    var D = normalize(297.8501921 + 445267.1114034 * t
      - 0.0018819 * t * t + t * t * t / 545868 - t * t * t * t / 113065000);
    var M = normalize(357.5291092 + 35999.0502909 * t
      - 0.0001536 * t * t + t * t * t / 24490000);
    var Mp = normalize(134.9633964 + 477198.8675055 * t
      + 0.0087414 * t * t + t * t * t / 69699 - t * t * t * t / 14712000);
    var F = normalize(93.2720950 + 483202.0175233 * t
      - 0.0036539 * t * t - t * t * t / 3526000 + t * t * t * t / 863310000);

    // Eccentricity correction
    var E = 1 - 0.002516 * t - 0.0000074 * t * t;
    var E2 = E * E;

    var sumL = 0;
    for (var i = 0; i < MOON_TERMS.length; i++) {
      var term = MOON_TERMS[i];
      var arg = term[0] * D + term[1] * M + term[2] * Mp + term[3] * F;
      var coeff = term[4];
      // Apply eccentricity correction for terms involving M
      if (Math.abs(term[1]) === 1) coeff *= E;
      else if (Math.abs(term[1]) === 2) coeff *= E2;
      sumL += coeff * Math.sin(arg * DEG2RAD);
    }

    // Additional corrections
    var A1 = normalize(119.75 + 131.849 * t);
    var A2 = normalize(53.09 + 479264.290 * t);
    var A3 = normalize(313.45 + 481266.484 * t);
    sumL += 3958 * Math.sin(A1 * DEG2RAD);
    sumL += 1962 * Math.sin((Lp - F) * DEG2RAD);
    sumL += 318 * Math.sin(A2 * DEG2RAD);

    return normalize(Lp + sumL / 1000000);
  }

  // ========== PLANET HELIOCENTRIC LONGITUDE FUNCTIONS ==========

  function mercuryHelioLon(t) {
    var l0 = sumVSOP(MERCURY_L0, t);
    var l1 = sumVSOP(MERCURY_L1, t);
    var l2 = sumVSOP(MERCURY_L2, t);
    var L = (l0 + l1 * t + l2 * t * t) / 1e8;
    return normalize(L * RAD2DEG);
  }

  function venusHelioLon(t) {
    var l0 = sumVSOP(VENUS_L0, t);
    var l1 = sumVSOP(VENUS_L1, t);
    var l2 = sumVSOP(VENUS_L2, t);
    var L = (l0 + l1 * t + l2 * t * t) / 1e8;
    return normalize(L * RAD2DEG);
  }

  function marsHelioLon(t) {
    var l0 = sumVSOP(MARS_L0, t);
    var l1 = sumVSOP(MARS_L1, t);
    var l2 = sumVSOP(MARS_L2, t);
    var L = (l0 + l1 * t + l2 * t * t) / 1e8;
    return normalize(L * RAD2DEG);
  }

  function jupiterHelioLon(t) {
    var l0 = sumVSOP(JUPITER_L0, t);
    var l1 = sumVSOP(JUPITER_L1, t);
    var l2 = sumVSOP(JUPITER_L2, t);
    var L = (l0 + l1 * t + l2 * t * t) / 1e8;
    return normalize(L * RAD2DEG);
  }

  function saturnHelioLon(t) {
    var l0 = sumVSOP(SATURN_L0, t);
    var l1 = sumVSOP(SATURN_L1, t);
    var l2 = sumVSOP(SATURN_L2, t);
    var L = (l0 + l1 * t + l2 * t * t) / 1e8;
    return normalize(L * RAD2DEG);
  }

  // ========== HELIOCENTRIC TO GEOCENTRIC CONVERSION ==========

  // Heliocentric radii (simplified - approximate distance in AU)
  // For longitude-only calculations, we use simplified orbital radii
  var ORBIT_RADII = {
    Mercury: 0.387098,
    Venus: 0.723332,
    Earth: 1.000001,
    Mars: 1.523679,
    Jupiter: 5.2026,
    Saturn: 9.5549
  };

  function helioToGeo(planetLon, planetR, earthLon, earthR) {
    // Convert heliocentric longitude to geocentric longitude
    var pRad = planetLon * DEG2RAD;
    var eRad = earthLon * DEG2RAD;
    var xp = planetR * Math.cos(pRad) - earthR * Math.cos(eRad);
    var yp = planetR * Math.sin(pRad) - earthR * Math.sin(eRad);
    var geo = Math.atan2(yp, xp) * RAD2DEG;
    return normalize(geo);
  }

  // Approximate heliocentric radius for Earth (simplified VSOP87)
  var EARTH_R0 = [
    [100013989.0, 0.0, 0.0],
    [1670700.0, 3.0984635, 6283.0758500],
    [13956.0, 3.05525, 12566.15170],
    [3084.0, 5.1985, 77713.7715],
    [1628.0, 1.1739, 5753.3849],
    [1576.0, 2.8469, 7860.4194],
    [925.0, 5.453, 11506.770],
    [542.0, 4.564, 3930.210],
    [472.0, 3.661, 5884.927],
    [346.0, 0.964, 5507.553],
    [329.0, 5.900, 5223.694],
    [307.0, 0.299, 5573.143],
    [243.0, 4.273, 11790.629],
    [212.0, 5.847, 1577.344],
    [186.0, 5.022, 10977.079],
    [175.0, 3.012, 18849.228],
    [110.0, 5.055, 5486.778],
    [98.0, 0.89, 6069.78],
    [86.0, 5.69, 15720.84],
    [86.0, 1.27, 161000.69]
  ];

  var EARTH_R1 = [
    [103019.0, 1.107490, 6283.075850],
    [1721.0, 1.0644, 12566.1517],
    [702.0, 3.142, 0.0],
    [32.0, 1.02, 18849.23],
    [31.0, 2.84, 5507.55],
    [25.0, 1.32, 5223.69],
    [18.0, 1.42, 1577.34],
    [10.0, 5.91, 10977.08],
    [9.0, 1.42, 6275.96],
    [9.0, 0.27, 5486.78]
  ];

  function earthRadius(t) {
    var r0 = sumVSOP(EARTH_R0, t);
    var r1 = sumVSOP(EARTH_R1, t);
    return (r0 + r1 * t) / 1e8;
  }

  // Approximate planet radii using Kepler equation (simplified)
  function planetRadius(planet, helioLon, t) {
    // Use mean orbit radii - for longitude calculation, the error is small
    // More accurate: use series expansions, but for arc-minute accuracy this suffices
    var a = ORBIT_RADII[planet];
    // Simple eccentricity correction
    var ecc, peri;
    switch (planet) {
      case "Mercury": ecc = 0.20563; peri = normalize(77.456 + 0.16 * t * 10); break;
      case "Venus": ecc = 0.00677; peri = normalize(131.564 + 0.005 * t * 10); break;
      case "Mars": ecc = 0.09340; peri = normalize(336.060 + 0.44 * t * 10); break;
      case "Jupiter": ecc = 0.04839; peri = normalize(14.331 + 0.22 * t * 10); break;
      case "Saturn": ecc = 0.05415; peri = normalize(93.057 + 0.35 * t * 10); break;
      default: ecc = 0; peri = 0;
    }
    var trueAnomaly = (helioLon - peri) * DEG2RAD;
    return a * (1 - ecc * ecc) / (1 + ecc * Math.cos(trueAnomaly));
  }

  // ========== RAHU/KETU (Lunar Nodes) ==========
  function rahuLongitude(jd) {
    var t = T(jd);
    // Mean longitude of ascending node (tropical)
    var omega = normalize(125.0445479 - 1934.1362891 * t
      + 0.0020754 * t * t + t * t * t / 467441 - t * t * t * t / 60616000);
    // Perturbation terms
    var D = normalize(297.8501921 + 445267.1114034 * t);
    var M = normalize(357.5291092 + 35999.0502909 * t);
    var Mp = normalize(134.9633964 + 477198.8675055 * t);
    var F = normalize(93.2720950 + 483202.0175233 * t);
    // Nutation-based corrections to node
    omega += -1.274 * Math.sin((2 * D - Mp) * DEG2RAD);
    omega += 0.658 * Math.sin(2 * D * DEG2RAD);
    omega += -0.186 * Math.sin(M * DEG2RAD);
    omega += -0.114 * Math.sin(2 * F * DEG2RAD);
    return normalize(omega);
  }

  // ========== LAHIRI AYANAMSA ==========
  // Official Indian Ephemeris (Lahiri) ayanamsa
  // Based on the position of the star Spica (Chitra) at 180 degrees sidereal
  function precisionAyanamsa(jd) {
    var t = T(jd);
    // IAU precession in longitude (Lieske 1979, consistent with Lahiri)
    // Precession from J2000.0 epoch
    var prec = 5029.0966 * t + 1.1120 * t * t - 0.000006 * t * t * t;
    // Convert arc-seconds to degrees
    prec = prec / 3600.0;
    // Lahiri ayanamsa at J2000.0 = 23.85 degrees (official value ~23d 51m)
    // More precisely: 23 degrees 51 minutes 11 seconds = 23.85306 degrees at J2000
    var ayanamsaJ2000 = 23.853056;
    // Ayanamsa = initial value + precession accumulated since J2000
    var ayan = ayanamsaJ2000 + prec;

    // Nutation correction (small, ~17 arcsec max)
    var omega = normalize(125.04452 - 1934.136261 * t);
    var Ls = normalize(280.4665 + 36000.7698 * t);
    var Lm = normalize(218.3165 + 481267.8813 * t);
    var nutLon = -17.20 * Math.sin(omega * DEG2RAD)
      - 1.32 * Math.sin(2 * Ls * DEG2RAD)
      - 0.23 * Math.sin(2 * Lm * DEG2RAD)
      + 0.21 * Math.sin(2 * omega * DEG2RAD);
    ayan += nutLon / 3600.0;

    return ayan;
  }

  // ========== MAIN EXPORT: precisionLongitudes ==========
  function precisionLongitudes(jd) {
    var t = T(jd) / 10; // VSOP uses Julian millennia
    var tc = T(jd); // Julian centuries for Moon/nodes

    var ayan = precisionAyanamsa(jd);

    // Earth heliocentric longitude and radius
    var earthLon = earthHelioLon(t);
    var earthR = earthRadius(t);

    // Sun geocentric tropical longitude
    var sunTropical = normalize(earthLon + 180.0 - 0.00569 - 0.01397 * tc);

    // Moon tropical longitude (ELP2000)
    var moonTropical = moonLongitude(jd);

    // Planet heliocentric longitudes
    var mercLon = mercuryHelioLon(t);
    var venLon = venusHelioLon(t);
    var marsLon = marsHelioLon(t);
    var jupLon = jupiterHelioLon(t);
    var satLon = saturnHelioLon(t);

    // Convert to geocentric using proper geometry
    var mercR = planetRadius("Mercury", mercLon, t);
    var venR = planetRadius("Venus", venLon, t);
    var marsR = planetRadius("Mars", marsLon, t);
    var jupR = planetRadius("Jupiter", jupLon, t);
    var satR = planetRadius("Saturn", satLon, t);

    var mercGeo = helioToGeo(mercLon, mercR, earthLon, earthR);
    var venGeo = helioToGeo(venLon, venR, earthLon, earthR);
    var marsGeo = helioToGeo(marsLon, marsR, earthLon, earthR);
    var jupGeo = helioToGeo(jupLon, jupR, earthLon, earthR);
    var satGeo = helioToGeo(satLon, satR, earthLon, earthR);

    // Rahu/Ketu (tropical)
    var rahuTropical = rahuLongitude(jd);
    var ketuTropical = normalize(rahuTropical + 180);

    // Convert all to sidereal by subtracting ayanamsa
    return {
      Sun: normalize(sunTropical - ayan),
      Moon: normalize(moonTropical - ayan),
      Mars: normalize(marsGeo - ayan),
      Mercury: normalize(mercGeo - ayan),
      Jupiter: normalize(jupGeo - ayan),
      Venus: normalize(venGeo - ayan),
      Saturn: normalize(satGeo - ayan),
      Rahu: normalize(rahuTropical - ayan),
      Ketu: normalize(ketuTropical - ayan)
    };
  }

  // Return public API
  return {
    precisionLongitudes: precisionLongitudes,
    precisionAyanamsa: precisionAyanamsa,
    sunGeoLon: sunGeoLon,
    moonLongitude: moonLongitude,
    rahuLongitude: rahuLongitude
  };
});
