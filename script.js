/* --- Initiates Map --- */

var map;

function initMap() {
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('map-div'), {
        center: {
            lat: 39.173303,
            lng: -77.177274
        },
        scrollwheel: true,
        zoom: 6
    });

    var infowindow = new google.maps.InfoWindow();

}

/* --- Display Functionality --- */

$(document).ready(function() {

    var searchIcon = $('#search-icon');
    var menuIcon = $('#menu-icon');
    var refreshIcon = $('#refresh');

    var searchDiv = $('#search-div');
    var resultsDiv = $('#results-div');

    searchIcon.click(function() {

        if (searchDiv.css('left') == '0px') {
            searchDiv.animate({
                left: '-500px'
            });
        } else {
            searchDiv.animate({
                left: '0px'
            });
        }

    });

    menuIcon.click(function() {

        if (resultsDiv.css('right') == '0px') {
            resultsDiv.animate({
                right: '-500px'
            });
        } else {
            resultsDiv.animate({
                right: '0px'
            });
        }

    });

    refreshIcon.click(function() {
        map.setZoom(5);
    });

});

/* --- Main Application --- */

// Main Angular Application
var App = angular.module("myApp", []);

// Master Angular Controller
App.controller('masterCtrl', function($scope) {

  $(document).keyup(function(e){
   if( e.keyCode == 13 ) {
     if( $('#query').is(':focus') ){
       $scope.loadMeetUps();
     }
   }
 });

    $scope.message = '';
    $scope.search = '';

    var message = $('#message');

    $scope.loadMeetUps = function() {

        console.log('Loading...');

        var searchDiv = $('#search-div');
        var resultsDiv = $('#results-div');
        var show = "0px";
        var hide = '-500px';

        var left = 'left';
        var right = 'right';

        var query = $('#query').val();
        var city = $('#city').val();

        if (query == '' || city == '') {
            //alert('Please Input a Search Query.');
            $scope.message = 'Please Input a Search Query.';
            setTimeout(function() {
                $scope.message = ' ';
            }, 3000);
            return;
        }

        $scope.search = query;
        $('#query').val('');

        var apiURL = 'https://api.meetup.com/2/open_events?text=' + query + '&key=4cb67422e7d2a681139752a238d39&format=json&callback=?';
        console.log(apiURL);

        $scope.events = [];

        $.getJSON(apiURL, function(data) {
            console.log(data);

            map = new google.maps.Map(document.getElementById('map-div'), {
                center: {
                    lat: 39.126182556152344,
                    lng: -100.8551254272461
                },
                scrollwheel: true,
                zoom: 5
            });

            var events = data.results;

            for (var i = 0; i < events.length; i++) {

                var event = events[i];

                var name = event.name;
                var who = event.group.name;
                var status = event.status;
                var description = event.description;

                var url = event.event_url;

                var dateCreated = event.created;
                var duration = event.duration;
                var time = event.time;

                if (duration == '' || duration == undefined) {
                    duration = 'Duration Not Specified';
                }

                var fee;
                var payment;
                var currency;
                var feeDesc;

                if (event.fee == undefined) {
                    fee = 'Amount Not Specified';
                    payment = 'Payment Type Not Specified';
                    currency = 'Currency Not Specified';
                    feeDesc = 'Fee Description Not Specified';
                } else {
                    fee = event.fee.amount;
                    payment = event.fee.accepts;
                    currency = event.fee.currency;
                    feeDesc = event.fee.description;
                }

                var joinMode = event.group.join_mode;

                var address;
                var city;
                var state;
                var country;

                if (event.venue == undefined) {
                    address = 'Address Not Specified';
                    city = 'City Not Specified';
                    state = 'State Not Specified';
                    country = 'Country Not Specified';
                } else {
                    address = event.venue.address_1;
                    city = event.venue.city;
                    state = event.venue.state;
                    country = event.venue.localized_country_name;
                }

                var lat;
                var lng;
                var img;

                if (event.venue != undefined) {
                    lat = event.venue.lat;
                    lng = event.venue.lon;
                    img = 'https://maps.googleapis.com/maps/api/streetview?size=150x150&location=' + lat + ',' + lng + '&heading=151.78&pitch=-0.76&key=AIzaSyBWq_bL3W2U17sffyrBJdzsxeFT445s9EU'
                } else {
                    lat = event.group.group_lat;
                    lng = event.group.group_lon;
                    img = 'https://maps.googleapis.com/maps/api/streetview?size=150x150&location=' + lat + ',' + lng + '&heading=151.78&pitch=-0.76&key=AIzaSyBWq_bL3W2U17sffyrBJdzsxeFT445s9EU'
                }
                var id = event.group.id;

                $scope.events.push({
                    name: name,
                    who: who,
                    status: status,
                    description: description,
                    url: url,
                    dateCreated: dateCreated,
                    duration: duration,
                    time: time,
                    fee: fee,
                    payment: payment,
                    currency: currency,
                    feeDesc: feeDesc,
                    joinMode: joinMode,
                    address: address,
                    city: city,
                    state: state,
                    country: country,
                    lat: lat,
                    lng: lng,
                    img: img,
                    id: id,
                    itemNumber: i,
                });


            }

            $scope.message = 'Load Successfully! Click Menu Icon To View Results.';
            setTimeout(function() {
                $scope.message = ' ';
            }, 3500);

            $scope.$apply(function() {
                console.log($scope.events);
            });

            $.each($scope.events, function(index, value) {
                $('#d-' + value.itemNumber).append(value.description);
            })

            $scope.addMarkers($scope.events);


        }).error(function() {

            $scope.message = 'Error Occured, MeetUps Could Not Be Loaded. Perhaps There Was a Bad Search or Search Had No Results.';
            setTimeout(function() {
                $scope.message = ' ';
            }, 3500);

        });

        setTimeout(function() {
            resultsDiv.animate({
                right: '0px'
            });
            searchDiv.animate({
                left: '-500px'
            });
        }, 4675);


    }

    $scope.mapMarkers = [];

    $scope.addMarkers = function(array) {

        $.each(array, function(index, value) {
            var infowindow = new google.maps.InfoWindow();

            var latitude = value.lat,
                longitude = value.lng,
                Loc = new google.maps.LatLng(latitude, longitude),
                thisName = value.name;

            var ID = value.id;

            var infoBox = '<div class="info-box" style="border: 1px solid black; padding: 10px;">' + '<h4>' + value.name + '</h4>' + '<p>' + value.address + '</p>' + '<p>' + value.city + ', ' + value.state + '</p>' + '<hr>' +
                '<img src="' + value.img + '"/>' + '<hr>' +
                '<a href="' + value.url + '">' + '<p class="text-center">' + 'Venue Link' + '</p>' + '</a>' + '</div>';

            var marker = new google.maps.Marker({
                position: Loc,
                title: thisName,
                id: ID,
                animation: google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function() {
                console.log('Marker Animation');
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
                setTimeout(function() {
                    marker.setAnimation(null)
                }, 1500);
            });

            $scope.mapMarkers.push({
                marker: marker,
                content: infoBox
            });

            google.maps.event.addListener(marker, 'click', function() {
                console.log('click function working');
                infowindow.setContent(infoBox);
                map.setZoom(13);
                map.setCenter(marker.position);
                infowindow.open(map, marker);
                map.panBy(0, -125);
            });



        });
        console.log($scope.mapMarkers);
    }

    $scope.showMarker = function(string) {
        console.log(string);

        var infowindow = new google.maps.InfoWindow();

        var clickedItem = string.event.id;

        for (var key in $scope.mapMarkers) {
            if (clickedItem === $scope.mapMarkers[key].marker.id) {
                map.panTo($scope.mapMarkers[key].marker.position);
                map.setZoom(13);
                infowindow.setContent($scope.mapMarkers[key].content);
                infowindow.open(map, $scope.mapMarkers[key].marker);
                map.panBy(0, 125);
            }
        }

    }

    $scope.filterResults = function() {

        var input = $('#results-filter').val().toLowerCase();
        //console.log(input);
        var list = $scope.events;
        if (input == '' || !input) {
            $.each($scope.mapMarkers, function(index, item) {
                $scope.mapMarkers[index].marker.setMap(map);
            })
            return;
        } else {

            for (var i = 0; i < list.length; i++) {
                //console.log($scope.mapMarkers[i]);
                if (list[i].name.toLowerCase().indexOf(input) != -1) {

                    $scope.mapMarkers[i].marker.setMap(map);

                } else {

                    $scope.mapMarkers[i].marker.setMap(null);

                }

            }

        }

    }


});

function info() {
    alert('Welcome! This is a Web Application that uses MeetUps and Google Maps. Search for events by clicking the search icon at the top left and See the results by clicking the menu icon on the top right. Enjoy, and find something to do! Also, when filtering your search, if the input field is empty and the markers don\'t return, just press space. The markers will show up.');
}
