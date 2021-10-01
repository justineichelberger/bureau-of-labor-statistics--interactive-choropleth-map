// set script variables
var csv;
var legend;
var cumulative_array = [];
var states_array = [];
var data_variable_names_array = [];
var statesPlottingData = statesData;
var csv_source_array = ["15-1211_M2020_dl.csv","15-1221_M2020_dl.csv","15-1245_M2020_dl.csv","15-2031_M2020_dl.csv","15-2041_M2020_dl.csv","15-1251_M2020_dl.csv","15-1257_M2020_dl.csv","15-2098_M2020_dl.csv"];
// var csvSource = "state_m2020_dl.csv";
var timespans = {"hourly": "H", "annual": "A"};
var stats_array = ['_PCT10', '_PCT25', '_MEDIAN', '_MEAN', '_PCT75', '_PCT90'];
// var yearly_timespan_stats = []; 
// var a_stat = ['_MEDIAN'];
var user_selected_stat_for_job_code;
var ordered ='ordered';
var us = "US" 
var wages_summary = '_wages_summary';
var jobCodes_array = ["15_1211","15_1221","15_1245","15_2031","15_2041","15_1251","15_1257","15_2098"];
var jobCodes_for_JSON_array = ["15-1211","15-1221","15-1245","15-2031","15-2041","15-1251","15-1257","15-2098"];
// var jobCode = "15-2098";
// var state = "Alabama";
var min_stat, max_stat;

// generate states_array
fetch('stateData.geojson').then(response => response.text()).then(data => {
    var state_data = data;
    const state_json = ` 
        [  
        ${state_data}
        ]
    `;
    const state_object = JSON.parse(state_json);

    // // outputForDebugging 
    // console.log(state_object[0].features);

    for(let n = 0; n < state_object[0].features.length; n++) {
        var state_n = state_object[0].features[n].properties;
        
        // load dynamic plotting data to 'state_object.geojson'
        state_n.density = 'this_value';

        // // outputForDebugging 
        // console.log(state_n);
        // console.log(state_n.name);

        states_array.push(state_n.name);
        
        // outputForDebugging 
        // console.log(states_array);

    }; 
});

// states loop test
test_states = states_array;

function yEqualsMXPlusB(maxY, minY, maxX, minX, x) {
    var y = +((((maxY - minY)/(maxX - minX))*x) + (minY - (minX*((maxY - minY)/(maxX - minX)))));
    return y;
};

// order forcing function
function delay() {
    return new Promise(resolve => setTimeout(resolve, 200));
};

// order forcing function
async function delayedLog() {
    await delay();
};

// order forcing function
async function processArrayOfCSVs(csv_source_array, test_states) {
    
    // loop through list of selected csv files 
    for(csv in csv_source_array) {

        var us_cumulative_array = [];
        var us_data_variable_names_array = [];

        // have d3 read in a csv
        d3.csv(csv_source_array[csv]).then(function(dataAsset) {

            // // outputForDebugging 
            // console.log(csv);
            // console.log(jobCodes_for_JSON_array[csv]);

            // load csv dataAsset to variable
            var OCCjobCodeSearchResults = dataAsset;
            // console.log(OCCjobCodeSearchResults);

            for(state in test_states) {
                // declare variable to store an array for each state's BLS stats by jobCode
                var state_cumulative_array = [];
                // filter "OCCjobCodeSearchResults" by state
                var stateRow = OCCjobCodeSearchResults.filter(dataAsset => {
                    return dataAsset.AREA_TITLE === test_states[state];
                });

                // // outputForDebugging 
                // console.log(stateRow[0]);
            
                // loop through available timespans
                for(var t in timespans) {
                    var resource_type = `${ordered}_${t + wages_summary}`;
                    var output_array = [];
                    // loop through chosen stats
                    for(var s in stats_array) {
                        var call_variable_name = `${timespans[t] + stats_array[s]}`;
                        var stateRowContents = stateRow[0];
                        try {
                            var stat = stateRowContents[call_variable_name];
                            var stat = +(stat.replace(",", ""));
                            var text = `{"jobCode":"${jobCodes_for_JSON_array[csv]}","stateUS":"${test_states[state]}","resourceName":"${resource_type}","statName":"${call_variable_name}","stat${call_variable_name}":${stat}}`;
                            const object = JSON.parse(text);
                            output_array.push(object);
                            state_cumulative_array.push(object);
                            us_cumulative_array.push(object);
                            cumulative_array.push(object);
                        } catch(err) {
                            var stat = 0;
                            var text = `{"jobCode":"${jobCodes_for_JSON_array[csv]}","stateUS":"${test_states[state]}","resourceName":"${resource_type}","statName":"${call_variable_name}","stat${call_variable_name}":${stat}}`;
                            const object = JSON.parse(text);
                            output_array.push(object);
                            state_cumulative_array.push(object);
                            us_cumulative_array.push(object);
                            cumulative_array.push(object);
                        };
                    };

                    // // outputForDebugging 
                    // console.log(output_array);

                    // store summary array for a single job_code, single state and single timespan
                    var thisName = `${test_states[state]}_${ordered}_${t + wages_summary}_for_jobCode_${jobCodes_array[csv]}`;
                    data_variable_names_array.push(thisName);

                    // // sort output_array
                    // output_array = _.sortBy(output_array, 'stat');

                    // // outputForDebugging 
                    // console.log(thisName);

                    // store array under thisName
                    this[thisName] = output_array;

                    // // outputForDebugging
                    // console.log(this[thisName]);

                };

                // store summary array for a single jobCode and single state
                var thisName = `${test_states[state]}_${ordered + wages_summary}_for_jobCode_${jobCodes_array[csv]}`;
                data_variable_names_array.push(thisName);

                // // outputForDebugging
                // console.log(thisName);
                
                // store array under thisName
                this[thisName] = state_cumulative_array;

                // // outputForDebugging
                // console.log(this[thisName]);

                var thisName = `${us}_${ordered + wages_summary}_for_jobCode_${jobCodes_array[csv]}`;
                us_data_variable_names_array.push(thisName);
                data_variable_names_array.push(thisName);

                // store array under thisName
                this[thisName] = us_cumulative_array;
                
                // // outputForDebugging
                // console.log(thisName);
            
            };

        // outputForDebugging
        console.log(us_cumulative_array);

        });

        await delayedLog(csv); 
        
    };

    await delayedLog(csv); 

    // // sort the complete database array
    // cumulative_array = _.sortBy(cumulative_array, ['stateUS', 'resourceName', 'stat']);

    // outputForDebugging
    console.log(data_variable_names_array);
    // console.log(US_ordered_wages_summary_for_jobCode_15_1211);

};
    
// call async function
processArrayOfCSVs(csv_source_array, test_states);

// // complete database
// console.log(cumulative_array);


// order forcing function
function delayLonger() {
    return new Promise(resolve => setTimeout(resolve, 300));
};

// order forcing function
async function delayedLongerDensity(user_selected_jobCode, user_selected_stat) {
    await delayLonger();
    var plot_value_list = [];
    
    var user_selected_stat_value = `stat${user_selected_stat}`
    var user_selected_jobCode_resource = `US_ordered_wages_summary_for_jobCode_${user_selected_jobCode}`;
    var user_job_code_selection = this[user_selected_jobCode_resource].filter(dataAsset => {
        return dataAsset.statName === user_selected_stat;
    });
    
    // // outputForDebugging
    // console.log(user_job_code_selection) 

    for(state in statesPlottingData.features) {
        var state_user_job_code_selection = user_job_code_selection[state];
        
        // // outputForDebugging
        // console.log(state_user_job_code_selection);
        // console.log(statesPlottingData.features[state].properties.density);
        // console.log(+state_user_job_code_selection[user_selected_stat_value]);
        
        statesPlottingData.features[state].properties.density = +state_user_job_code_selection[user_selected_stat_value];

        plot_value_list.push(+state_user_job_code_selection[user_selected_stat_value])

        // // outputForDebugging
        // console.log(statesPlottingData.features[state].properties.density);
        // console.log(statesPlottingData);

    };

    // console.log(statesPlottingData);
    // console.log(plot_value_list);
    var plot_value_list_min = Math.min.apply(null, plot_value_list);
    console.log(plot_value_list_min);
    var plot_nonZero_value_list = plot_value_list.filter(dataAsset => {
        return dataAsset != 0;
    });
    var plot_nonZero_value_list_min = Math.min.apply(null, plot_nonZero_value_list);
    // console.log(plot_nonZero_value_list_min);
    var plot_value_list_max = Math.max.apply(null, plot_value_list);
    console.log(Math.max.apply(null, plot_value_list));

    var d6 = yEqualsMXPlusB(plot_value_list_max, plot_nonZero_value_list_min, 6, 0, 5);
    console.log(yEqualsMXPlusB(plot_value_list_max, plot_nonZero_value_list_min, 6, 0, 5));
    var d5 = yEqualsMXPlusB(plot_value_list_max, plot_nonZero_value_list_min, 6, 0, 4);
    var d4 = yEqualsMXPlusB(plot_value_list_max, plot_nonZero_value_list_min, 6, 0, 3);
    var d3 = yEqualsMXPlusB(plot_value_list_max, plot_nonZero_value_list_min, 6, 0, 2);
    var d2 = yEqualsMXPlusB(plot_value_list_max, plot_nonZero_value_list_min, 6, 0, 1);
    var d1 = yEqualsMXPlusB(plot_value_list_max, plot_nonZero_value_list_min, 6, 0, 0);

    var geojson = L.geoJson(statesPlottingData).addTo(map);

    // get color depending on population density value
    function getColor(d) {
    return  d > d6 ? '#800026' :
            d > d5 ? '#BD0026' :
            d > d4  ? '#FC4E2A' :
            d > d3  ? '#FD8D3C' :
            d > d2   ? '#FEB24C' :
            d > d1   ? '#FED976' :
                        '#FFEDA0';
            // d > 1000 ? '#800026' :
            // d > 500  ? '#BD0026' :
            // d > 200  ? '#E31A1C' :
            // d > 100  ? '#FC4E2A' :
            // d > 50   ? '#FD8D3C' :
            // d > 20   ? '#FEB24C' :
            // d > 10   ? '#FED976' :
            // '#FFEDA0';
    };
    
    function style(feature) { 
        return  {
            weight: 2,
            opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.density)
        };
    };
    
    var geojson = L.geoJson(statesPlottingData, {
        style: style,
    }).addTo(map);

    var d6l = Math.round(d6, 2)
    var d5l = Math.round(d5, 2)
    var d4l = Math.round(d4, 2)
    var d3l = Math.round(d3, 2)
    var d2l = Math.round(d2, 2)
    var d1l = Math.round(d1, 2)

    
    legend = L.control({position: 'topright'});

	legend.onAdd = function (map) {

		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, d1l, d2l, d3l, d4l, d5l, d6l],
			labels = [],
			from, to;

		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(map);

};

function removeLegend() {
    map.removeControl(legend);
};
// delayedLongerDensity("15_1211", "H_PCT10");

var robsStatesData = [];
var robsStatesData = statesPlottingData.features;

// order forcing function
function delayEvenLonger(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
};

// table constructor
async function constructTable(selector) {
    await delayEvenLonger (400);

    refreshTable();

    var cols = Headers(robsStatesData, selector);  
    
    // // outputForDebugging
    // console.log(robsStatesData);
    
    // Traversing the JSON data
    for (var i = 0; i < robsStatesData.length; i++) {
        var row = null;
        row = $('<tr/>');

        // // outputForDebugging
        // console.log(robsStatesData[i].properties);
        
        var plot_parameters = ['name', 'density'];
        
        for (var p = 0; p < 2; p++) {
            var val = robsStatesData[i].properties[plot_parameters[p]];

            // If there is any key, which is matching with the column name
            if (val == null) val = "";  
                row.append($('<td/>').html(val));
        
        };
        
        // Adding each row to the table
        $(selector).append(row);
    }



}

function Headers(list, selector) {
    var get_columns = robsStatesData[0]
    var columns = [];
    var columns = Object.keys(get_columns.properties);
    header = $('<tr/>');

            // Creating the header
            header.append($('<th/>').html("state"));
            header.append($('<th/>').html("data"));
    
    // Appending the header to the table
    $(selector).append(header);
        // console.log(columns);
        return columns;
}; 

function refreshTable() {
    $('#table').empty();
};

// menu buttons
var btn = document.getElementById('btn');
var select1 = document.getElementById('menu_1');
      console.log(select1);
var select2 = document.getElementById('menu_2');
    console.log(select2);

function changeMap() {
    $("map_container.empty");
    var topLevelValue = $("#menu_1 option:selected").val();
    var mapTypeValue = $("#menu_2 option:selected").val()
    console.log(topLevelValue);
    console.log(mapTypeValue);
    delayedLongerDensity(topLevelValue, mapTypeValue);
    $("#maps_container").load(topLevelValue+mapTypeValue+".htm #map_container");
};