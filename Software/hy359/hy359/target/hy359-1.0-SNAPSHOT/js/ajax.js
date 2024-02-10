var gender = document.getElementById("gender_select");
var gender_select = document.getElementById("gender_select");
var lat, lon;
var property;
var placeSelect = document.getElementById('property');
var property_container = document.getElementById('property');
var catchecked = false;
var dogchecked = false;
var username, password;
var ownersCount;
var keepersCount;
var username_loggedin_user;
var booking_pet_type;
var owner_pet_id;
var owner_id_for_booking;
var owner_booking_price;
var owner_keeper_id;
var status_booking;
var bookingData;
var selectedBookingId;
var allBookings = {}; // owner_id | keeper_id, keeper_username, keeper_firstname, keeper_lastname, keeper_catkeeper, keeper_dogkeeper, keeper_catprice, keeper_dogprice, booking_status
var distancesArray = [];
var durationsArray = [];


function sendReview() {
    var reviewText = document.getElementById('review_input').value;
    var rating = (document.getElementById('rating_input').value).toString();
    console.log("Review: " + reviewText);
    console.log("Rating: " + rating);
    var reviewData = {
        owner_id: owner_id_for_booking,
        keeper_id: owner_keeper_id,
        reviewText: reviewText,
        reviewScore: rating
    };
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'SendReviewsServlet', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('reviewInput').value = '';
            alert('Review sent successfully.');
        }
    };
    xhr.send(JSON.stringify(reviewData));
}


function finished() {
    updateBooking_status("finished");
}

function updateBooking_status(status) {
    find_booking_id(owner_id_for_booking, function (bookingId) {
        selectedBookingId = bookingId;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'UpdateBookingStatus?bookingId=' + selectedBookingId + '&status=' + status, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                $("#owner_booking_result").html("Booking status updated successfully.");
            }
        };
        xhr.send(JSON.stringify(bookingData));
    });
}

function find_owner_id(callback) {
    var xhr = new XMLHttpRequest();
    var url = "find_ownerID?username=" + encodeURIComponent(username_loggedin_user);
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var ownerId = xhr.responseText;
                owner_id_for_booking = ownerId;
                callback(ownerId);
            } else {
                alert('Request failed. Returned status of ' + xhr.status);
            }
        }
    };
    xhr.open('GET', url);
    xhr.send();
}


function find_pet(owner_id_for_booking, callback) {
    var xhr = new XMLHttpRequest();
    var url = "find_pet_info?ownerid=" + encodeURIComponent(owner_id_for_booking);
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var petInfoArray = xhr.responseText.split('\n');
                var petType = petInfoArray[0];
                var petId = petInfoArray[1];
                owner_pet_id = petId;
                callback(petType);
            } else {
                alert('Request failed. Returned status of ' + xhr.status);
            }
        }
    };
    xhr.open('GET', url);
    xhr.send();
}

function find_status(keeper_id, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let is_available = xhr.responseText;
                console.log("Keeper " + keeper_id + " availability " + is_available);
                callback(is_available);
            } else {
                alert('Request failed. Returned status of ' + xhr.status);
            }
        }
    };
    xhr.open('GET', 'StatusOfkeeperIdServlet?keeperId=' + encodeURIComponent(keeper_id), true);
    xhr.send();
}


function show_keepers_for_owner() {
    find_owner_id(function (owner_id_for_booking) {
        console.log("Owner id for booking: " + owner_id_for_booking);

        find_pet(owner_id_for_booking, function (pet_type) {
            booking_pet_type = pet_type;

            $("body").load("OwnerBooking.html");

            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var petKeepers = JSON.parse(xhr.responseText);
                        var promises = [];

                        petKeepers.forEach(function (keeper) {
                            let temp_allBookings = {};
                            temp_allBookings["keeper_id"] = keeper.keeper_id;
                            temp_allBookings["keeper_username"] = keeper.username;
                            temp_allBookings["keeper_firstname"] = keeper.firstname;
                            temp_allBookings["keeper_lastname"] = keeper.lastname;
                            temp_allBookings["keeper_catprice"] = keeper.catprice;
                            temp_allBookings["keeper_dogprice"] = keeper.dogprice;
                            temp_allBookings["lat"] = keeper.lat;
                            temp_allBookings["lon"] = keeper.lon;

                            var promise = new Promise(function (resolve) {
                                find_status(keeper.keeper_id, function (is_available) {
                                    temp_allBookings["booking_availability"] = is_available;
                                    allBookings[keeper.keeper_id] = temp_allBookings;
                                    resolve();
                                });
                            });

                            promises.push(promise);
                        });

                        Promise.all(promises).then(function () {
                            console.log(JSON.stringify(allBookings));

                            var htmlContent = '<h3>Keepers:</h3>';
                            htmlContent += '<table border="1"><tr><th>Keeper Id</th><th>Username</th><th>First Name</th><th>Last Name</th><th>Cat Price</th><th>Dog Price</th></tr>';
                            petKeepers.forEach(function (keeper) {
                                if (allBookings[keeper.keeper_id]["booking_availability"] == 1) {
                                    htmlContent += '<tr><td>' + keeper.keeper_id + '</td>' +
                                        '<td><button onclick="SaveKeeperId(\'' + keeper.keeper_id + '\',' + keeper.catprice + ',' + keeper.dogprice + ')">' + keeper.username + '</button></td>' +
                                        '<td>' + keeper.firstname + '</td>' +
                                        '<td>' + keeper.lastname + '</td>' +
                                        '<td>' + keeper.catprice + '</td>' +
                                        '<td>' + keeper.dogprice + '</td></tr>';
                                }
                            });
                            htmlContent += '</table>';

                            document.getElementById("show_keepers").innerHTML = htmlContent;
                        });
                    } else {
                        alert('Request failed. Returned status of ' + xhr.status);
                    }
                }
            };

            xhr.open('GET', 'show_keepers_with_owner_filters?pet_type=' + encodeURIComponent(pet_type));
            xhr.send();
        });
    });
}


function show_price_order() {
    const allBookingsArray = Object.entries(allBookings);

    const lowercasePetType = booking_pet_type.trim().toLowerCase();

    if (lowercasePetType === 'cat') {
        allBookingsArray.sort(([, a], [, b]) => a["keeper_catprice"] - b["keeper_catprice"]);
        console.log("Sorted by catprice: " + JSON.stringify(allBookingsArray));
    } else if (lowercasePetType === 'dog') {
        allBookingsArray.sort(([, a], [, b]) => a["keeper_dogprice"] - b["keeper_dogprice"]);
        console.log("Sorted by dogprice: " + JSON.stringify(allBookingsArray));
    } else {
        console.log("Neither cat nor dog");
    }


    var htmlContent = '<h3>Keepers:</h3>';
    htmlContent += '<table border="1"><tr><th>Keeper Id</th><th>Username</th><th>First Name</th><th>Last Name</th><th>Cat Price</th><th>Dog Price</th></tr>';

    allBookingsArray.forEach(function ([key, keeper]) {
        if (keeper["booking_availability"] == 1) {
            htmlContent += '<tr><td>' + key + '</td>' +
                '<td><button onclick="SaveKeeperId(\'' + key + '\',' + keeper["keeper_catprice"] + ',' + keeper["keeper_dogprice"] + ')">' + keeper["keeper_username"] + '</button></td>' +
                '<td>' + keeper["keeper_firstname"] + '</td>' +
                '<td>' + keeper["keeper_lastname"] + '</td>' +
                '<td>' + keeper["keeper_catprice"] + '</td>' +
                '<td>' + keeper["keeper_dogprice"] + '</td></tr>';
        }
    });

    htmlContent += '</table>';
    document.getElementById("show_keepers").innerHTML = htmlContent;
}

function show_distance_order(distance_or_duration) {
    const data = null;
    let owner_lat, owner_lon;


    find_owner_lat_lon(function (owner_lat_temp, owner_lon_temp) {
        owner_lat = owner_lat_temp;
        owner_lon = owner_lon_temp;

        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        // Array to store the coordinates of keepers
        let keepers_lat_and_lon = [];

        let allBookingsArray = Object.entries(allBookings);
        allBookingsArray.forEach(function ([key, keeper]) {
            if (keeper["booking_availability"] == 1) {
                keepers_lat_and_lon.push(keeper["lat"] + ',' + keeper["lon"]);
            }
        });

        // Forming the origins string dynamically
        const origins = owner_lat + '%2C' + owner_lon + ';' + keepers_lat_and_lon.join('%3B');

        xhr.addEventListener('readystatechange', function () {
            if (this.readyState === this.DONE) {
                console.log(this.responseText);

                const response = JSON.parse(this.responseText);
                distancesArray = response["distances"];
                durationsArray = response["durations"];

                console.log("Distances: " + distancesArray[0]);

                let counter = 1;
                allBookingsArray.forEach(function ([key, keeper]) {
                    if (keeper["booking_availability"] == 1) {
                        keeper["distance"] = distancesArray[0][counter];
                        keeper["duration"] = durationsArray[0][counter];
                        counter++;
                    }
                });

                if (distance_or_duration === 'distance') {
                    // Sort allBookingsArray based on distances from the first element of distancesArray (first element is the owner)
                    allBookingsArray.sort(([, a], [, b]) => a["distance"] - b["distance"]);
                    console.log("Sorted by distance: " + JSON.stringify(allBookingsArray));
                } else if (distance_or_duration === 'duration') {
                    // Sort allBookingsArray based on durations from the first element of durationsArray (first element is the owner)
                    allBookingsArray.sort(([, a], [, b]) => a["duration"] - b["duration"]);
                    console.log("Sorted by duration: " + JSON.stringify(allBookingsArray));
                }

                // Display the sorted allBookingsArray
                show_sorted_bookings(allBookingsArray, distance_or_duration);
            }
        });

        xhr.open('GET', 'https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix?origins=' + origins + '&destinations=' + origins);

        xhr.setRequestHeader('X-RapidAPI-Key', 'bbaf97a350mshfa3ebc42f5d6b69p1753bdjsn51365a77a8f7');
        xhr.setRequestHeader('X-RapidAPI-Host', 'trueway-matrix.p.rapidapi.com');

        xhr.send(data);
    });
}

function show_sorted_bookings(allBookingsArray, distance_or_duration) {
    var htmlContent = '<h3>Sorted Keepers:</h3>';
    htmlContent += '<table border="1"><tr><th>Keeper Id</th><th>Username</th><th>First Name</th><th>Last Name</th><th>Cat Price</th><th>Dog Price</th><th>Before Sorting Distance</th><th>Before Sorting Duration</th></tr>';

    allBookingsArray = allBookingsArray.filter(([key, keeper]) => keeper["booking_availability"] == 1);
    if (distance_or_duration === 'distance') {
        allBookingsArray.sort(([, a], [, b]) => a["distance"] - b["distance"]);
    } else if (distance_or_duration === 'duration') {
        allBookingsArray.sort(([, a], [, b]) => a["duration"] - b["duration"]);
    }

    let counter = 0;
    allBookingsArray.forEach(function ([key, keeper]) {
        htmlContent += '<tr><td>' + key + '</td>' +
            '<td><button onclick="SaveKeeperId(\'' + key + '\',' + keeper["keeper_catprice"] + ',' + keeper["keeper_dogprice"] + ')">' + keeper["keeper_username"] + '</button></td>' +
            '<td>' + keeper["keeper_firstname"] + '</td>' +
            '<td>' + keeper["keeper_lastname"] + '</td>' +
            '<td>' + keeper["keeper_catprice"] + '</td>' +
            '<td>' + keeper["keeper_dogprice"] + '</td>' +
            '<td>' + keeper["distance"] + '</td>' +
            '<td>' + keeper["duration"] + '</td></tr>';
        counter++;
    });

    htmlContent += '</table>';
    document.getElementById("show_keepers").innerHTML = htmlContent;
}


function find_owner_lat_lon(callback) {
    var xhr = new XMLHttpRequest();
    var url = "find_owner_lat_lon?ownerid=" + encodeURIComponent(owner_id_for_booking);
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var lat_lon = xhr.responseText.split(',');
                var owner_lat = lat_lon[0];
                var owner_lon = lat_lon[1];
                callback(owner_lat, owner_lon);
            } else {
                alert('Request failed. Returned status of ' + xhr.status);
            }
        }
    };
    xhr.open('GET', url);
    xhr.send();
}

function SaveKeeperId(keeper_id, catprice, dogprice) {
    owner_keeper_id = keeper_id;
    $("#keeper_select_result").html("Keeper with id " + keeper_id + " selected");

    if (booking_pet_type.trim() === 'cat') {
        owner_booking_price = catprice;
    } else if (booking_pet_type === "dog") {
        owner_booking_price = dogprice;
    } else {
        owner_booking_price = -1;
    }
}

function OwnerBooking() {
    console.log("Owner id for booking: " + owner_id_for_booking);
    console.log("Owner pet id: " + owner_pet_id);
    console.log("Keeper id: " + owner_keeper_id);
    console.log("Start date: " + document.getElementById("startDate").value);
    console.log("End date: " + document.getElementById("endDate").value);
    console.log("Price: " + owner_booking_price);

    var xhr = new XMLHttpRequest();

    bookingData = {
        owner_id: owner_id_for_booking,
        pet_id: owner_pet_id,
        keeper_id: owner_keeper_id,
        fromDate: document.getElementById("startDate").value,
        toDate: document.getElementById("endDate").value,
        status: "requested",
        price: owner_booking_price
    };
    var url = "add_booking?bookingData=" + encodeURIComponent(JSON.stringify(bookingData));

    //add booking to booking table using add_booking servlet
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Booking added to booking table");
            $("#owner_booking_result").html("Booking added to booking table");
        } else if (xhr.status !== 200) {
            console.log("Booking not added to booking table");
            $("#owner_booking_result").html("Booking not added to booking table");
        }
    };
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('username1').addEventListener('input', function () {
        var username = this.value;
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var response = xhr.responseText;
                    document.getElementById('username_existance').textContent = response;
                } else {
                    console.error('Error:', xhr.status);
                }
            }
        };

        xhr.open('GET', 'usernameExistance?username=' + encodeURIComponent(username), true);
        xhr.send();
    });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('email').addEventListener('input', function () {
        var email = document.getElementById('email').value;
        console.log(email);

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var response = xhr.responseText;
                    document.getElementById('email_existance').textContent = response;
                } else {
                    console.error('Error:', xhr.status);
                }
            }
        };

        xhr.open('GET', 'emailExistance?email=' + encodeURIComponent(email), true);
        xhr.send();
    });
});

function initDB() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#ajaxContent").html("Successful Initialization");
        } else if (xhr.status !== 200) {
            $("#ajaxContent").html("Error Occured");
        }
    };

    xhr.open('GET', 'InitDB');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function deleteDB() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#ajaxContent").html("Successful Deletion");
        } else if (xhr.status !== 200) {
            $("#ajaxContent").html("Error Occured");
        }
    };

    xhr.open('GET', 'DeleteDB');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function button_function() {
    if ($('#pet').val() === 'Pet Owner')
        add_petowner();

    else if ($('#pet').val() === 'Pet Keeper')
        add_petkeeper();
}

function createJson_for_pet_keeper(username, email, password, firstname, lastname, birthday, gender, country, city, address, lat, lon, telephone, job, property, propertydescription, catchecked, dogchecked, catprice, dogprice, personalpage) {
    const jsonObject = {
        username: username,
        email: email,
        password: password,
        firstname: firstname,
        lastname: lastname,
        birthdate: birthday,
        gender: gender,
        country: country,
        city: city,
        address: address,
        lat: lat,
        lon: lon,
        telephone: telephone,
        job: job,
        property: property,
        propertydescription: propertydescription,
        catkeeper: catchecked,
        dogkeeper: dogchecked,
        catprice: catprice,
        dogprice: dogprice,
        personalpage: personalpage
    };

    const jsonString = JSON.stringify(jsonObject);
    return jsonString;
}

function add_petkeeper() {
    const username = document.getElementById("username1");
    const email = document.getElementById("email");
    const password = document.getElementById("password1");
    const firstname = document.getElementById("firstname");
    const lastname = document.getElementById("lastname");
    const birthdate = document.getElementById("birthdate");

    const country = document.getElementById("country");
    const city = document.getElementById("city");
    const address = document.getElementById("address");

    const telephone = document.getElementById("telephone");
    const job = document.getElementById("job");

    const propertydescription = document.getElementById("propertydescription");
    const catkeeper = document.getElementById("catkeeper");
    const dogkeeper = document.getElementById("dogkeeper");
    const catprice = document.getElementById("catprice");
    const dogprice = document.getElementById("dogprice");
    const personalpage = document.getElementById("personalpage");

    console.log("Username:", username.value);
    console.log("Email:", email.value);
    console.log("Password:", password.value);
    console.log("First Name:", firstname.value);
    console.log("Last Name:", lastname.value);
    console.log("Birthdate:", birthdate.value);
    console.log("Gender:", gender);
    console.log("Country:", country.value);
    console.log("City:", city.value);
    console.log("Address:", address.value);
    console.log("Latitude:", lat);
    console.log("Longitude:", lon);
    console.log("Telephone:", telephone.value);
    console.log("Job:", job.value);
    console.log("Property:", property);
    console.log("Property Description:", propertydescription.value);

    if (catchecked === true && ($('#catkeeper').is(':disabled')))
        catchecked = false;

    if (dogchecked === true && ($('#dogkeeper').is(':disabled')))
        dogchecked = false;

    if (catchecked === false)
        catprice.value = 0;

    if (dogchecked === false)
        dogprice.value = 0;

    console.log("Cat Keeper:", catchecked);
    console.log("Dog Keeper:", dogchecked);
    console.log("Cat Price:", catprice.value);
    console.log("Dog Price:", dogprice.value);
    console.log("Personal Page:", personalpage.value);

    const user = createJson_for_pet_keeper(username.value, email.value, password.value, firstname.value, lastname.value, birthdate.value, gender, country.value, city.value, address.value, lat, lon, telephone.value, job.value, property, propertydescription.value, catchecked, dogchecked, catprice.value, dogprice.value, personalpage.value);
    var queryParams;
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = xhr.responseText;
                $('#message').text(response); // Displaying the entire response in the #message element
                //$('#registration_result').text(response);
            } else {
                $('#message').text("There was a problem with the registration"); // If there's an issue with the registration
            }
        } else {
            $('#message').text("There was a problem with the registration");
        }
    };


    const url = 'add_pet_keeper';
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    queryParams = `user=${encodeURIComponent(user)}`;
    xhr.send(queryParams);
}


function createJson_for_pet_owner(username, email, password, firstname, lastname, birthday, gender, country, city, address, lat, lon, telephone, job, personalpage) {
    const jsonObject = {
        username: username,
        email: email,
        password: password,
        firstname: firstname,
        lastname: lastname,
        birthdate: birthday,
        gender: gender,
        country: country,
        city: city,
        address: address,
        lat: lat,
        lon: lon,
        telephone: telephone,
        job: job,
        personalpage: personalpage
    };

    const jsonString = JSON.stringify(jsonObject);
    return jsonString;
}

function displayMessage(message) {
    document.getElementById('messageDiv').innerHTML += message;
}

function add_petowner() {
    console.log("Adding ...");
    const username = document.getElementById("username1");
    const email = document.getElementById("email");
    const password = document.getElementById("password1");
    const firstname = document.getElementById("firstname");
    const lastname = document.getElementById("lastname");
    const birthdate = document.getElementById("birthdate");

    const country = document.getElementById("country");
    const city = document.getElementById("city");
    const address = document.getElementById("address");

    const telephone = document.getElementById("telephone");
    const job = document.getElementById("job");

    const personalpage = document.getElementById("personalpage");

    console.log("Username:", username.value);
    console.log("Email:", email.value);
    console.log("Password:", password.value);
    console.log("First Name:", firstname.value);
    console.log("Last Name:", lastname.value);
    console.log("Birthdate:", birthdate.value);
    console.log("Gender:", gender);
    console.log("Country:", country.value);
    console.log("City:", city.value);
    console.log("Address:", address.value);
    console.log("Latitude:", lat);
    console.log("Longitude:", lon);
    console.log("Telephone:", telephone.value);
    console.log("Job:", job.value);
    console.log("Personal Page:", personalpage.value);

    const user = createJson_for_pet_owner(username.value, email.value, password.value, firstname.value, lastname.value, birthdate.value, gender, country.value, city.value, address.value, lat, lon, telephone.value, job.value, personalpage.value);

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = xhr.responseText;
                $('#message').text(response); // Displaying the entire response in the #message element
                //$("body").load("registration_success.html");
                //$('#registration_result').text(response);
            } else {
                $('#message').text("There was a problem with the registration"); // If there's an issue with the registration
            }
        } else {
            $('#message').text("There was a problem with the registration");
        }
    };
    const url = 'add_pet_owner';

    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    const queryParams = `user=${encodeURIComponent(user)}`;

    xhr.send(queryParams);
}


function Go_homepage() {
    window.location.href = 'index.html';
}


//For Bookings//
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('showBookings').addEventListener('click', function () {
        window.location.href = 'pet_keeper_bookings.html';
    });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginKeeper').addEventListener('click', function () {
        document.getElementById('showBookings').style.display = 'block';
    });
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginOwner').addEventListener('click', function () {
        document.getElementById('bookings_owner').style.display = 'block';
    });
});


document.addEventListener('DOMContentLoaded', function () {
    // Event listener for the Enter key in Keeper ID input
    document.getElementById('keeperIdInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            showKeeperInfo();
        }
    });
});


function loadBookingData() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'ShowBookingServlet', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var bookings = JSON.parse(xhr.responseText);
                var htmlContent = '<h3>Bookings:</h3><ul>';
                bookings.forEach(function (booking) {
                    var isFinishedOrRejected = booking.status === 'finished' || booking.status === 'rejected';
                    var isRequested = booking.status === 'requested';
                    var isAccepted = booking.status === 'accepted';

                    htmlContent += '<li>Booking ID: ' + booking.borrowing_id +
                        ', Owner ID: ' + booking.owner_id +
                        ', Pet ID: ' + booking.pet_id +
                        ', Keeper ID: ' + booking.keeper_id +
                        ', From Date: ' + booking.fromDate +
                        ', To Date: ' + booking.toDate +
                        ', Status: <select id="status' + booking.borrowing_id + '"' +
                        (isAccepted || isFinishedOrRejected ? ' disabled' : '') + '>';

                    if (isRequested) {
                        htmlContent += '<option value="accepted">Accepted</option>';
                        htmlContent += '<option value="rejected">Rejected</option>';
                    } else if (isAccepted || isFinishedOrRejected) {
                        htmlContent += '<option value="' + booking.status + '" selected>' + booking.status.charAt(0).toUpperCase() + booking.status.slice(1) + '</option>';
                    }

                    htmlContent += '</select>, Price: ' + booking.price;

                    if (isAccepted) {
                        htmlContent += ' <button onclick="showMessagingSection(' + booking.borrowing_id + ', ' + booking.owner_id + ')" style="line-height:10px;">Send Message</button>';
                    }
                    htmlContent += '</li>';
                });
                htmlContent += '</ul>';
                document.getElementById('ajaxContentBooking1').innerHTML = htmlContent;
            } else {
                console.log('Error fetching booking data:', xhr.status);
            }
        }
    };
    xhr.send();
}


function DisplayPetKeepers() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var petKeepers = JSON.parse(xhr.responseText);
                var htmlContent = '<h3>Keepers:</h3>';
                htmlContent += '<table class="styled-table"><thead><tr><th>Keeper Id</th><th>Username</th><th>First Name</th><th>Last Name</th></tr></thead><tbody>';
                petKeepers.forEach(function (keeper) {
                    htmlContent += '<tr><td>' + keeper.keeper_id + '</td>' +
                        '<td>' + keeper.username + '</td>' +
                        '<td>' + keeper.firstname + '</td>' +
                        '<td>' + keeper.lastname + '</td></tr>';
                });
                htmlContent += '</tbody></table>';
                document.getElementById("viewKeepers").innerHTML = htmlContent;
            } else {
                alert('Request failed. Returned status of ' + xhr.status);
            }
        }
    };
    xhr.open('GET', 'show_keepers');
    xhr.send();
}

function fetchPetOwners() {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var petOwners = JSON.parse(xhr.responseText);
                    resolve(petOwners);
                } else {
                    reject('Request failed. Returned status of ' + xhr.status);
                }
            }
        };
        xhr.open('GET', 'show_owners');
        xhr.send();
    });
}

function showMessagingSection(bookingId, ownerId) {
    selectedBookingId = bookingId;
    document.getElementById('ownerIdInput').value = ownerId;
    document.getElementById('messagingSection').style.display = 'block';
}

function sendMessage() {
    var messageText = document.getElementById('messageInput').value;
    var messageData = {
        booking_id: selectedBookingId,
        message: messageText,
        sender: 'keeper',
        receiver: "owner"
    };
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'SendMessagesServlet', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById('messageInput').value = '';
            alert("Message sent successfully.");
        }
    };
    xhr.send(JSON.stringify(messageData));
}

//-----ChatGPT-------//


function sendQuestion() {
    var question = document.getElementById('chatInput').value;
    document.getElementById('chatInput').value = ''; // Clear the input field

    // Display the question in the chat
    document.getElementById('chatDisplay').innerHTML += '<div><b>You:</b> ' + question + '</div>';

    // Send the question to your server
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'ChatGPTQueryServlet', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log("Server response: ", xhr.responseText); // Log the raw response
            if (xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    document.getElementById('chatDisplay').innerHTML += '<div><b>ChatGPT:</b> ' + response.answer + '</div>';
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    document.getElementById('chatDisplay').innerHTML += '<div>Error in response.</div>';
                }
            }
        }
    };
    xhr.send('question=' + encodeURIComponent(question));
}

//For passing default questions//
function sendPredefinedQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendQuestion();
}

function find_booking_id(owner_id_for_booking, callback) {
    var xhr = new XMLHttpRequest();
    console.log("Owner id for booking2: " + owner_id_for_booking);
    var url = "find_booking_id?ownerid=" + encodeURIComponent(owner_id_for_booking);

    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const bookingId = parseInt(xhr.responseText);
                callback(bookingId);
            } else {
                alert('Request for booking_id failed. Returned status of ' + xhr.status);
                callback(null);
            }
        }
    };
    xhr.open('GET', url);
    xhr.send();
}

function sendMessage_to_keeper() {
    find_booking_id(owner_id_for_booking, function (bookingId) {
        if (bookingId !== null) {
            console.log("Booking ID: " + bookingId);
            selectedBookingId = bookingId;

            console.log("Booking ID1: " + selectedBookingId);
            var messageText = document.getElementById('message_to_keeper').value;
            var messageData = {
                booking_id: selectedBookingId,
                message: messageText,
                sender: 'owner',
                receiver: 'keeper'
            };
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'SendMessagesServlet', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    document.getElementById('messageInput').value = '';
                    alert('Message sent successfully.');
                }
            };
            xhr.send(JSON.stringify(messageData));

        } else {
            console.log("Failed to retrieve booking ID");
        }
    });
}


function showKeeperInfo() {
    var keeperId = document.getElementById('keeperIdInput').value;
    if (!keeperId) {
        alert("Please enter a Keeper ID.");
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'GetKeeperInfo?keeperId=' + keeperId, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var keeperInfo = JSON.parse(xhr.responseText);
                var htmlContent = '<h3>Keeper Information:</h3><ul>';

                htmlContent +=
                    '<li>Keeper ID: ' + keeperInfo.keeper_id +
                    '<li>Property Description: ' + keeperInfo.propertydescription +
                    '<li>Cat Keeper: ' + keeperInfo.catkeeper +
                    '<li>Dog Keeper: ' + keeperInfo.dogkeeper +
                    '<li>Cat Price: ' + keeperInfo.catprice +
                    '<li>Dog Price: ' + keeperInfo.dogprice + '</li>';
                htmlContent += '</ul>';
                document.getElementById('keeperInfoDisplay').innerHTML = htmlContent;
            } else {
                console.log('Error fetching keeper data:', xhr.status);
            }
        }
    };
    xhr.send();
}


function saveAllBookings() {
    var bookings = document.querySelectorAll('[id^="status"]');
    var updates = [];

    bookings.forEach(function (booking) {
        var bookingId = booking.id.replace('status', '');
        var status = booking.value;
        updates.push({bookingId: bookingId, status: status});
    });

    // Send updates to the server
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'ShowBookingServlet', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Saved");
            $('#save_result').html("Saved");
        }
    };
    xhr.send(JSON.stringify(updates));
}


//---- 3.4 ----//


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('viewKeepers').addEventListener('click', function () {
        window.location.href = 'viewkeepers.html';
    });
});


function Save_new_detailsOwners() {
    const email = $('#edit_email').val();
    const edit_password = $('#edit_password').val();
    const edit_firstname = $('#edit_firstname').val();
    const edit_lastname = $('#edit_lastname').val();
    const edit_birthdate = $('#edit_birthdate').val();
    const edit_gender = $('#edit_gender').val();
    const edit_job = $('#edit_job').val();
    const edit_country = $('#edit_country').val();
    const edit_city = $('#edit_city').val();
    const edit_address = $('#edit_address').val();
    const edit_lat = $('#edit_lat').val();
    const edit_lon = $('#edit_lon').val();
    const edit_telephone = $('#edit_telephone').val();
    const edit_personalpage = $('#edit_personalpage').val();

    var xhr = new XMLHttpRequest();
    var url = "EditOwner?username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(edit_password) +
        "&firstname=" + encodeURIComponent(edit_firstname) +
        "&lastname=" + encodeURIComponent(edit_lastname) +
        "&birthdate=" + encodeURIComponent(edit_birthdate) +
        "&gender=" + encodeURIComponent(edit_gender) +
        "&job=" + encodeURIComponent(edit_job) +
        "&country=" + encodeURIComponent(edit_country) +
        "&city=" + encodeURIComponent(edit_city) +
        "&address=" + encodeURIComponent(edit_address) +
        "&lat=" + encodeURIComponent(edit_lat) +
        "&lon=" + encodeURIComponent(edit_lon) +
        "&telephone=" + encodeURIComponent(edit_telephone) +
        "&personalpage=" + encodeURIComponent(edit_personalpage);

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Saved");
            $('#save_result').html("Saved");
        } else if (xhr.status !== 200) {
            console.log("Not saved");
            $('#save_result').html("Not saved");
        }
    };
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function Save_new_detailsKeepers() {
    const email = $('#edit_email').val();
    const edit_password = $('#edit_password').val();
    const edit_firstname = $('#edit_firstname').val();
    const edit_lastname = $('#edit_lastname').val();
    const edit_birthdate = $('#edit_birthdate').val();
    const edit_gender = $('#edit_gender').val();
    const edit_job = $('#edit_job').val();
    const edit_country = $('#edit_country').val();
    const edit_city = $('#edit_city').val();
    const edit_address = $('#edit_address').val();
    const edit_lat = $('#edit_lat').val();
    const edit_lon = $('#edit_lon').val();
    const edit_telephone = $('#edit_telephone').val();
    const edit_personalpage = $('#edit_personalpage').val();
    const edit_property = $('#edit_property').val();
    const edit_propertydescription = $('#edit_propertydescription').val();
    const edit_catkeeper = $('#edit_catkeeper').val();
    const edit_dogkeeper = $('#edit_dogkeeper').val();
    const edit_catprice = $('#edit_catprice').val();
    const edit_dogprice = $('#edit_dogprice').val();

    var xhr = new XMLHttpRequest();
    var url = "EditKeeper?username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(edit_password) +
        "&firstname=" + encodeURIComponent(edit_firstname) +
        "&lastname=" + encodeURIComponent(edit_lastname) +
        "&birthdate=" + encodeURIComponent(edit_birthdate) +
        "&gender=" + encodeURIComponent(edit_gender) +
        "&job=" + encodeURIComponent(edit_job) +
        "&country=" + encodeURIComponent(edit_country) +
        "&city=" + encodeURIComponent(edit_city) +
        "&address=" + encodeURIComponent(edit_address) +
        "&lat=" + encodeURIComponent(edit_lat) +
        "&lon=" + encodeURIComponent(edit_lon) +
        "&telephone=" + encodeURIComponent(edit_telephone) +
        "&personalpage=" + encodeURIComponent(edit_personalpage) +
        "&property=" + encodeURIComponent(edit_property) +
        "&propertydescription=" + encodeURIComponent(edit_propertydescription) +
        "&catkeeper=" + encodeURIComponent(edit_catkeeper) +
        "&dogkeeper=" + encodeURIComponent(edit_dogkeeper) +
        "&catprice=" + encodeURIComponent(edit_catprice) +
        "&dogprice=" + encodeURIComponent(edit_dogprice);

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("Saved");
            $('#save_result').html("Saved");
        } else if (xhr.status !== 200) {
            console.log("Not saved");
            $('#save_result').html("Not saved");
        }
    };
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}


$(document).ready(function () {
    isLoggedInKeeper();
    isLoggedInOwner();
});

function isLoggedInKeeper() {
    var params = 'action=login';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#login_success").html("Welcome again " + xhr.responseText);
            var url = "UserInfo?username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password);
            var xhr1 = new XMLHttpRequest();
            xhr1.onload = function () {
                if (xhr1.readyState === 4) {
                    if (xhr1.status === 200) {
                        var userDetails = JSON.parse(xhr1.responseText);
                        $("#ajaxContent1").html(
                            "Username: " + userDetails.username + "<br>" +
                            "Email: " + userDetails.email + "<br>" +
                            "Password: <input type='password' id='edit_password' value='" + userDetails.password + "'><br>" +
                            "Firstname: <input type='text' id='edit_firstname' value='" + userDetails.firstname + "'><br>" +
                            "Lastname: <input type='text' id='edit_lastname' value='" + userDetails.lastname + "'><br>" +
                            "Birthdate: <input type='text' id='edit_birthdate' value='" + userDetails.birthdate + "'><br>" +
                            "Gender: <input type='text' id='edit_gender' value='" + userDetails.gender + "'><br>" +
                            "Job: <input type='text' id='edit_job' value='" + userDetails.job + "'><br>" +
                            "Country: <input type='text' id='edit_country' value='" + userDetails.country + "'><br>" +
                            "City: <input type='text' id='edit_city' value='" + userDetails.city + "'><br>" +
                            "Address: <input type='text' id='edit_address' value='" + userDetails.address + "'><br>" +
                            "Lat: <input type='text' id='edit_lat' value='" + userDetails.lat + "'><br>" +
                            "Lon: <input type='text' id='edit_lon' value='" + userDetails.lon + "'><br>" +
                            "Telephone: <input type='text' id='edit_telephone' value='" + userDetails.telephone + "'><br>" +
                            "Personal Page: <input type='text' id='edit_personalpage' value='" + userDetails.personalpage + "'><br>" +
                            "Property: <input type='text' id='edit_property' value='" + userDetails.property + "'><br>" +
                            "Property Description: <input type='text' id='edit_propertydescription' value='" + userDetails.propertydescription + "'><br>" +
                            "Catkeeper: <input type='text' id='edit_catkeeper' value='" + userDetails.catkeeper + "'><br>" +
                            "Dogkeeper: <input type='text' id='edit_dogkeeper' value='" + userDetails.dogkeeper + "'><br>" +
                            "Catprice: <input type='text' id='edit_catprice' value='" + userDetails.catprice + "'><br>" +
                            "Dogprice: <input type='text' id='edit_dogprice' value='" + userDetails.dogprice + "'>"
                        );

                    } else {
                        $("#ajaxContent1").html("Error: " + xhr1.status);
                    }
                }
            };
            xhr1.open('GET', url);
            xhr1.send();

        } else if (xhr.status !== 200) {
        }
    };
    xhr.open('POST', 'GetKeeper');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(params);
}

function isLoggedInOwner() {
    var params = 'action=login';
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#login_success").html("Welcome again " + xhr.responseText);
            var url = "UserInfoOwner?username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password);
            var xhr1 = new XMLHttpRequest();
            xhr1.onload = function () {
                if (xhr1.readyState === 4) {
                    if (xhr1.status === 200) {
                        var userDetails = JSON.parse(xhr1.responseText);
                        $("#ajaxContent1").html(
                            "Username: " + userDetails.username + "<br>" +
                            "Email: " + userDetails.email + "<br>" +
                            "Password: <input type='password' id='edit_password' value='" + userDetails.password + "'><br>" +
                            "Firstname: <input type='text' id='edit_firstname' value='" + userDetails.firstname + "'><br>" +
                            "Lastname: <input type='text' id='edit_lastname' value='" + userDetails.lastname + "'><br>" +
                            "Birthdate: <input type='text' id='edit_birthdate' value='" + userDetails.birthdate + "'><br>" +
                            "Gender: <input type='text' id='edit_gender' value='" + userDetails.gender + "'><br>" +
                            "Job: <input type='text' id='edit_job' value='" + userDetails.job + "'><br>" +
                            "Country: <input type='text' id='edit_country' value='" + userDetails.country + "'><br>" +
                            "City: <input type='text' id='edit_city' value='" + userDetails.city + "'><br>" +
                            "Address: <input type='text' id='edit_address' value='" + userDetails.address + "'><br>" +
                            "Lat: <input type='text' id='edit_lat' value='" + userDetails.lat + "'><br>" +
                            "Lon: <input type='text' id='edit_lon' value='" + userDetails.lon + "'><br>" +
                            "Telephone: <input type='text' id='edit_telephone' value='" + userDetails.telephone + "'><br>" +
                            "Personal Page: <input type='text' id='edit_personalpage' value='" + userDetails.personalpage + "'><br>"
                        );

                    } else {
                        $("#ajaxContent1").html("Error: " + xhr1.status);
                    }
                }
            };
            xhr1.open('GET', url);
            xhr1.send();

        }
    };
    xhr.open('POST', 'GetOwner');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(params);
}

function Edit() {
    $("body").load("output.html");
}

function Admin_login() {
    $("body").load("admin_login.html")
}

function connect_admin() {
    var username = document.getElementById("username_admin").value;
    var password = document.getElementById("password_admin").value;

    if (username === "admin" && password === "admin12*") {
        $("#result_admin").html("Login successful!");

        fetchAndDisplayPetOwners();
        fetchAndDisplayPetKeepers();

        // Show the spin wheel and initialize it
        document.getElementById('spinWheelContainer').style.display = 'block';
        initializeWheel(); // This function will be defined in spin.js
    } else {
        $("#result_admin").html("Invalid username or password. Please try again.");
        document.getElementById('spinWheelContainer').style.display = 'none';
    }
}

function fetchAndDisplayPetKeepers() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = xhr.responseText;
                var petKeepers = JSON.parse(response);

                var content = "";
                petKeepers.forEach(function (keeper) {
                    content += '<button onclick="deleteKeeper(\'' + keeper.keeper_id + '\')">' + keeper.firstname + keeper.lastname + "(" + keeper.username + ")" + '</buttton>';
                });
                document.getElementById("admin_output").innerHTML += content;

            } else {
                alert('Request failed. Returned status of ' + xhr.status);
            }
        }
    };
    xhr.open('GET', 'show_keepers');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function deleteKeeper(keeper_id_admin) {
    var xhr = new XMLHttpRequest();
    var params = keeper_id_admin;
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#admin_output").append("\nSuccessful deletion");
        } else if (xhr.status !== 200) {
            $("#admin_output").append("\nRequest failed. Returned status of " + xhr.status);
        }
    };
    xhr.open('GET', 'deleteKeeper?keeper_id=' + params);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function find_dogs(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var dog_counter = xhr.responseText;
                callback(dog_counter);
            } else {
                console.log("Request failed. Returned status of " + xhr.status);
            }
        }
    };
    xhr.open('GET', 'countDogs');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function find_cats(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var cat_counter = xhr.responseText;
                callback(cat_counter);
            } else {
                console.log("Request failed. Returned status of " + xhr.status);
            }
        }
    };
    xhr.open('GET', 'countCats');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function show_charts() {
    find_dogs(function (dog_counter) {
        find_cats(function (cat_counter) {
            console.log("Number of dogs: " + dog_counter);
            console.log("Number of cats: " + cat_counter);

            const jsonData = {
                "dog_count": dog_counter,
                "cat_count": cat_counter
            };
            createPieChart_cats_dogs(jsonData);
        });
    });
    earnings_chart();
    owners_keepers_chart();
}

function createPieChart_cats_dogs(jsonData) {
    google.charts.load("current", {packages: ["corechart"]});
    google.charts.setOnLoadCallback(function () {
        drawPieChart_cats_dogs(jsonData);
    });
}

function drawPieChart_cats_dogs(data) {
    var dataVis = new google.visualization.DataTable();
    dataVis.addColumn('string', 'Category');
    dataVis.addColumn('number', 'Count');

    // Add the rows for dogs and cats
    dataVis.addRow(['Dogs', parseInt(data.dog_count)]);
    dataVis.addRow(['Cats', parseInt(data.cat_count)]);

    var options = {
        title: 'Number of Dogs and Cats',
        height: 200,
        is3D: true,
        pieSliceText: 'value',
    };

    console.log("chart");
    var chart = new google.visualization.PieChart(document.getElementById('chart_cats_dogs'));
    chart.draw(dataVis, options);
}

function earnings_chart() {
    var totalPriceElement = document.getElementById("totalPrice");

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var totalPrice = parseFloat(xhr.responseText);
                createBarGraphics(totalPrice);
                totalPriceElement.textContent = "Total Booking Prices: " + totalPrice.toFixed(2);
            } else {
                totalPriceElement.textContent = "Error retrieving total booking prices";
            }
        }
    };
    xhr.open("GET", "earnings", true);
    xhr.send();
}

function createBarGraphics(totalPrice) {
    google.charts.load("current", {packages: ['corechart', 'bar']});

    const keeperEarnings = totalPrice * 0.85; // Calculating keeper earnings (85%)
    const appEarnings = totalPrice * 0.15; // Calculating app earnings (15%)

    const labels = ['Keepers', 'App'];
    const values = [keeperEarnings, appEarnings];

    google.charts.setOnLoadCallback(function () {
        drawBarChart(labels, values);
    });
}

function drawBarChart(column1, column2) {
    var dataVis = new google.visualization.DataTable();
    dataVis.addColumn('string', 'Category');
    dataVis.addColumn('number', 'Earnings');

    for (let i = 0; i < column1.length; i++) {
        dataVis.addRow([column1[i], column2[i]]);
    }

    var options = {
        title: 'Earnings Breakdown',
        width: 500,
        height: 200,
        isStacked: true,
        bar: {groupWidth: '35%'},
        annotations: {
            textStyle: {
                color: 'black',
                fontSize: 12
            }
        }
    };

    var chart = new google.visualization.BarChart(document.getElementById('chart_earnings'));
    chart.draw(dataVis, options);
}

function countOwners(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var ownersCount = parseInt(xhr.responseText);
                callback(ownersCount);
            } else {
                console.error("Error: " + xhr.status);
            }
        }
    };
    xhr.open("GET", "countOwners", true);
    xhr.send();
}

function countKeepers(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var keepersCount = parseInt(xhr.responseText);
                callback(keepersCount);
            } else {
                console.error("Error: " + xhr.status);
            }
        }
    };
    xhr.open("GET", "countKeepers", true);
    xhr.send();
}

function owners_keepers_chart() {
    google.charts.load('current', {'packages': ['corechart']});
    google.charts.setOnLoadCallback(function () {
        countOwners(function (ownersCount) {
            countKeepers(function (keepersCount) {
                drawPieChart(ownersCount, keepersCount);
            });
        });
    });
}

function drawPieChart(ownersCount, keepersCount) {
    var data = google.visualization.arrayToDataTable([
        ['Category', 'Count'],
        ['Owners', ownersCount],
        ['Keepers', keepersCount]
    ]);

    var options = {
        title: 'Owners and Keepers',
        pieHole: 0.4,
    };

    var chart = new google.visualization.PieChart(document.getElementById('chart_owners_keepers'));
    chart.draw(data, options);
}


function fetchAndDisplayPetOwners() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = xhr.responseText;
                var petOwners = JSON.parse(response);

                var content = "";
                petOwners.forEach(function (owner) {
                    content += '<button onclick="deleteOwner(\'' + owner.owner_id + '\')">' + owner.firstname + owner.lastname + "(" + owner.username + ")" + '</button>';
                });
                document.getElementById("admin_output").innerHTML += content;
            } else {
                alert('Request failed. Returned status of ' + xhr.status);
            }
        }
    };
    xhr.open('GET', 'show_owners');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function deleteOwner(owner_id_admin) {
    var xhr = new XMLHttpRequest();
    var params = owner_id_admin;
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#admin_output").append("\nSuccessful deletion");
        } else if (xhr.status !== 200) {
            $("#admin_output").append("\nRequest failed. Returned status of " + xhr.status);
        }
    };
    xhr.open('GET', 'deleteOwner?owner_id_admin=' + params);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}


function logout() {
    var xhr = new XMLHttpRequest();
    var params = 'action=logout';
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            localStorage.removeItem('isLoggedIn');
            $("#ajaxContent").html("Successful Logout");
        } else if (xhr.status !== 200) {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    };
    xhr.open('POST', 'GetKeeper');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(params);
}


function createTableFromJSON(data) {
    var html = "<table><tr><th>Category</th><th>Value</th></tr>";
    for (const x in data) {
        var category = x;
        var value = data[x];
        html += "<tr><td>" + category + "</td><td>" + value + "</td></tr>";
    }
    html += "</table>";
    return html;

}


function getUser() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            username = $('#username').val();
            password = $('#password').val();
            username_loggedin_user = username;
            console.log("Logged in " + username_loggedin_user);
            $("#ajaxContent").html(createTableFromJSON(JSON.parse(xhr.responseText)));
            $("#login_success").html("Successful Login");
        } else if (xhr.status !== 200) {
            $("#ajaxContent").html("User not exists or incorrect password");
        }
    };
    var data = $('#loginForm').serialize();
    xhr.open('GET', 'GetKeeper?' + data);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}

function getUserOwner() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            username = $('#username').val();
            password = $('#password').val();
            username_loggedin_user = username;
            console.log("Logged in " + username_loggedin_user);
            $("#ajaxContent").html(createTableFromJSON(JSON.parse(xhr.responseText)));
            $("#login_success").html("Successful Login");
        } else if (xhr.status !== 200) {
            $("#ajaxContent").html("User not exists or incorrect password");
        }
    };
    var data = $('#loginForm').serialize();
    xhr.open('GET', 'GetOwner?' + data);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}


function verifyLocation() {
    var country = document.getElementById("country").value;
    var city = document.getElementById("city").value;
    var address = document.getElementById("address").value;
    var map_container = document.getElementById("Map");
    console.log(country);
    console.log(city);
    console.log(address);
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            if (xhr.status === 200) {
                const obj = JSON.parse(xhr.responseText);

                if (obj.length > 0) {
                    var i = 0;
                    var Result = [];

                    while (obj[i]) {
                        Result.push(obj[i]);
                        if (obj[i].display_name.includes("Heraklion")) {
                            break;
                        }
                        i++;
                    }

                    if (i >= obj.length) {
                        i = 0;
                    }

                    var place = Result[i].display_name;

                    lat = Result[i].lat;
                    lon = Result[i].lon;


                    if (country.includes("Ελλάδα") || country.includes("Greece") || country.includes("GR")) {
                        // Check if the location is in Heraklion (Ηράκλειο)
                        if (city.includes("Ηράκλειο") || city.includes("Heraklion")) {
                            if ((place.includes("Ηράκλειο") || place.includes("Heraklion")) && (place.includes("Κρήτη") || place.includes("Crete"))) {
                                document.getElementById("error-message").textContent = "Latitude: " + lat + ", Longitude: " + lon;
                                show_map(lat, lon);
                            } else {
                                document.getElementById("error-message").textContent = "Η υπηρεσία είναι διαθέσιμη μόνο στο Ηράκλειο αυτή τη στιγμή.";
                                map_container.style.display = "none";
                            }
                        } else {
                            // Display error message if the location is not in Heraklion
                            document.getElementById("error-message").textContent = "Η υπηρεσία είναι διαθέσιμη μόνο στο Ηράκλειο αυτή τη στιγμή.";
                            map_container.style.display = "none";
                        }
                    } else {
                        // Handle cases where the location is not in Crete
                        document.getElementById("error-message").textContent = "Η τοποθεσία δεν ανήκει στην Ελλάδα.";
                        map_container.style.display = "none";
                    }
                } else {
                    // Display error message if the location is not found
                    document.getElementById("error-message").textContent = "Η τοποθεσία δε βρέθηκε.";
                    map_container.style.display = "none";
                }
            } else {
                // Handle other HTTP status codes if necessary
                console.error("Error:", xhr.status);
            }
        }
    });

    xhr.open("GET", `https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=${address}&accept-language=en&polygon_threshold=0.0`);
    xhr.setRequestHeader("x-rapidapi-host", "forward-reverse-geocoding.p.rapidapi.com");
    xhr.setRequestHeader("x-rapidapi-key", "9cc68dc26cmsh63e7eebcdc02a4dp1f8c28jsn7dec83bd6d1e");
    xhr.send();
}

function show_map(lan, lon) {
    map_container = document.getElementById("Map");
    map_container.style.display = "block";
    map_container.style.height = "400px";
    map_container.style.width = "500px";
    map = new OpenLayers.Map("Map");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);

    function setPosition(lat, lon) {
        var fromProjection = new OpenLayers.Projection("EPSG:4326"); // Transform from WGS 1984
        var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
        var position = new OpenLayers.LonLat(lon, lat).transform(fromProjection, toProjection);
        return position;
    }

    function handler(position, message) {
        var popup = new OpenLayers.Popup.FramedCloud("Popup",
            position, null,
            message, null,
            true // <-- true if we want a close (X) button, false otherwise
        );
        map.addPopup(popup);
    }

    //Markers
    var markers = new OpenLayers.Layer.Markers("Markers");
    map.addLayer(markers);
    //Protos Marker
    var position = setPosition(lan, lon);
    var mar = new OpenLayers.Marker(position);
    markers.addMarker(mar);
    mar.events.register('mousedown', mar, function (evt) {
        handler(position, "Η τοποθεσία που επιλέξατε");
    });

    const zoom = 11;
    map.setCenter(position, zoom);
}


document.addEventListener('DOMContentLoaded', function () {
    var passwordField = document.getElementById('password1');
    var confirmPasswordField = document.getElementById('confirmPassword');
    var passwordStrengthMessage = document.getElementById('password-error');
    var passwordIncludesWordError = document.getElementById('password-error');
    var confirmPasswordError = document.getElementById('confirmPassword-error');
    var pet = document.getElementById('pet');
    var host = document.getElementById('host');
    var catCheckbox = document.getElementById("catkeeper");
    var dogCheckbox = document.getElementById("dogkeeper");
    var priceCat = document.getElementById("price_cat");
    var priceDog = document.getElementById("price_dog");
    var property_description = document.getElementById("description");
    var pet_select = document.getElementById('pet_select');


    const words = ["cat", "dog", "gata", "skulos"];

    function contains_words(password) {
        for (var i = 0; i < words.length; i++) {
            if (password.includes(words[i])) {
                passwordIncludesWordError.textContent = 'Ο κωδικός περιέχει την λέξη ' + words[i];
                return true; // Return true if a common word is found
            }
        }
        passwordIncludesWordError.textContent = ''; // Reset error message if no common word is found
        return false; // Return false if no common word is found
    }

    document.querySelector('.form').addEventListener('submit', function (event) {
        var password1 = passwordField.value;
        var password2 = confirmPasswordField.value;

        if (contains_words(password1)) {
            event.preventDefault(); // Cancels form submission
        }

        if (password1 !== password2) {
            confirmPasswordError.textContent = 'Οι Κωδικοί δεν ταιριάζουν. Παρακαλούμε εισάγετε τους ίδιους κωδικούς στα πεδία "Κωδικός Χρήστη" και "Επαλήθευση Κωδικού".';
        } else if (check_strong_password(password1) == 'Weak') {
            event.preventDefault(); // Cancels form submission
        } else {
            confirmPasswordError.textContent = '';
            console.log("Submit");
        }
    });

    function check_strong_password(password) {
        var password = passwordField.value;
        var numCounter = 0;
        var includes_symbol = false;
        var includes_uppercase = false;
        var includes_lowercase = false;
        var characters = password.split('');

        for (var i = 0; i < characters.length; i++) {
            if (characters[i] >= '0' && characters[i] <= '9') {
                numCounter++;
            }
            if (characters[i] >= 'A' && characters[i] <= 'Z') {
                includes_uppercase = true;
            }
            if (characters[i] >= 'a' && characters[i] <= 'z') {
                includes_lowercase = true;
            }
            if (characters[i] == '!' || characters[i] == '@' || characters[i] == '#' || characters[i] == '$' || characters[i] == '%' || characters[i] == '^' || characters[i] == '&' || characters[i] == '*') {
                includes_symbol = true;
            }
        }

        if (characters.length > 0 && includes_lowercase && includes_uppercase && includes_symbol && numCounter > 0 && numCounter / characters.length < 0.5) {
            return 'Strong';
        } else if (characters.length > 0 && numCounter / characters.length >= 0.5) {
            return 'Weak';
        } else {
            return 'medium password';
        }
    }

    property_container.addEventListener('change', function () {
        var place_select = placeSelect.querySelector('input[name="location"]:checked').value;
        if (place_select == 'Εξωτερικός χώρος') {
            property = 'Outdoor';
            catCheckbox.disabled = true;
            priceCat.style.display = 'none';
        } else if (place_select == 'Εσωτερικός χώρος') {
            property = 'Indoor';
        } else {
            property = 'Both';
            catCheckbox.disabled = false;
        }
    });

    gender.addEventListener('change', function () {
        var genderselect = gender_select.querySelector('input[name="gender"]:checked').value;
        if (genderselect == 'Άνδρας') {
            gender = "Man";
        } else if (genderselect == 'Γυναίκα') {
            gender = "Woman";
        } else
            gender = "";
    });

    pet.addEventListener('change', function () {
        var pet_select = pet.value;
        if (pet_select == 'Pet Keeper') {
            property_container.style.display = 'block';
            host.style.display = 'block';
            property_description.style.display = 'block';
            property_container.required = true;
        } else {
            property_container.style.display = 'none';
            host.style.display = 'none';
            property_description.style.display = 'none';
            property_container.required = false;
        }
    });

    function validateForm_host() {
        if (dogCheckbox.checked || catCheckbox.checked || pet_select == 'Pet Owner') {
            return true;
        } else {
            alert('Please check at least one checkbox.');
            return false;
        }
    }

    catCheckbox.addEventListener("change", function () {
        if (catCheckbox.checked) {
            catchecked = true;
            priceCat.style.display = 'block';
        } else {
            catchecked = false;
            priceCat.style.display = 'none';
        }
    });

    dogCheckbox.addEventListener("change", function () {
        if (dogCheckbox.checked) {
            priceDog.style.display = 'block';
            dogchecked = true;
        } else {
            priceDog.style.display = 'none';
            dogchecked = false;
        }
    });

    // Real-time password strength checker
    passwordField.addEventListener('input', function () {
        var password = passwordField.value;
        var numCounter = 0;
        var includes_symbol = false;
        var includes_uppercase = false;
        var includes_lowercase = false;
        var characters = password.split('');

        for (var i = 0; i < characters.length; i++) {
            if (characters[i] >= '0' && characters[i] <= '9') {
                numCounter++;
            }
            if (characters[i] >= 'A' && characters[i] <= 'Z') {
                includes_uppercase = true;
            }
            if (characters[i] >= 'a' && characters[i] <= 'z') {
                includes_lowercase = true;
            }
            if (characters[i] == '!' || characters[i] == '@' || characters[i] == '#' || characters[i] == '$' || characters[i] == '%' || characters[i] == '^' || characters[i] == '&' || characters[i] == '*') {
                includes_symbol = true;
            }
        }

        if (characters.length > 0 && includes_lowercase && includes_uppercase && includes_symbol && numCounter > 0 && numCounter / characters.length < 0.5) {
            passwordStrengthMessage.textContent = 'Strong';
            passwordStrengthMessage.style.color = 'green';
        } else if (characters.length > 0 && numCounter / characters.length >= 0.5) {
            passwordStrengthMessage.textContent = 'Weak';
            passwordStrengthMessage.style.color = 'red';
        } else {
            passwordStrengthMessage.textContent = 'medium password';
            passwordStrengthMessage.style.color = 'orange';
        }
    });
});


//Pet
function PetRegisterPage() {
    $("body").load("Pet_Register.html");
}


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('owner_id').addEventListener('input', function () {
        var owner_id = this.value;
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var response = xhr.responseText;
                    document.getElementById('id_message').textContent = response;
                } else {
                    console.error('Error:', xhr.status);
                }
            }
        };

        xhr.open('GET', 'Id_existance?owner_id=' + encodeURIComponent(owner_id), true);
        xhr.send();
    });
});

function put_function() {
    const id_put = document.getElementById("pet_id_put").value;
    const weight_put = document.getElementById("new_weight").value;

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#put_message").html("Pet with id " + id_put + " updated its weight with " + xhr.responseText);
        } else if (xhr.status !== 200) {
            $("#put_message").html("Pet did not updated its weight");
        }
    };

    // Adjust the data variable to include both type and breed in the query string
    var data = 'id=' + encodeURIComponent(id_put) + '&weight=' + encodeURIComponent(weight_put);
    // Append the data to the URL
    xhr.open('PUT', 'Put_pet?' + data);
    xhr.send();
}


function delete_function() {
    const id_delete = document.getElementById("pet_id_delete").value;

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#delete_message").html("Pet with id " + id_delete + " deleted " + xhr.responseText);
        } else if (xhr.status !== 200) {
            $("#delete_message").html("Pet did not deleted");
        }
    };

    // Adjust the data variable to include both type and breed in the query string
    var data = 'id=' + encodeURIComponent(id_delete);
    // Append the data to the URL
    xhr.open('DELETE', 'Delete_pet?' + data);
    xhr.send();
}


function get_function() {
    const type = document.getElementById("type_get").value;
    const breed = document.getElementById("breed_get").value;

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#get_message").html("Pets with these filters: <br>" + xhr.responseText);
        } else if (xhr.status !== 200) {
            $("#get_message").html("Pets with these filters do not exist");
        }
    };

    // Adjust the data variable to include both type and breed in the query string
    var data = 'type=' + encodeURIComponent(type) + '&breed=' + encodeURIComponent(breed);
    // Append the data to the URL
    xhr.open('GET', 'Get_pet?' + data);
    xhr.send();
}


function post_function() {
    if (!validateFormData()) {
        return;
    }
    console.log("Pushing...");
    const petId = document.getElementById("pet_id").value;
    const ownerId = document.getElementById("owner_id").value;
    const name = document.getElementById("name").value;
    const type = document.getElementById("type").value;
    const breed = document.getElementById("breed").value;
    const gender = document.getElementById("gender").value;
    const birthYear = document.getElementById("birthyear").value;
    const weight = document.getElementById("weight").value;
    const description = document.getElementById("description").value;
    const photo = document.getElementById("photo").value;

    console.log("Pet ID:", petId);
    console.log("Owner ID:", ownerId);
    console.log("Name:", name);
    console.log("Type:", type);
    console.log("Breed:", breed);
    console.log("Gender:", gender);
    console.log("Birth Year:", birthYear);
    console.log("Weight:", weight);
    console.log("Description:", description);
    console.log("Photo:", photo);

    const pet = createJson_for_pet_keeper(petId, ownerId, name, type, breed, gender, birthYear, weight, description, photo);
    console.log("JSON:", pet);
    var queryParams;
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = xhr.responseText;
                console.log(response);
                $('#message').text("JSON -> " + response); // Displaying the entire response in the #message element
            } else {
                $('#message').text("There was a problem with the POST (xhr.status !== 200)"); // If there's an issue with the registration
            }
        } else {
            $('#message').text("There was a problem with the POST (xhr.readyState !== 4)");
        }
    };

    const url = 'New_pet';
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    queryParams = `user=${encodeURIComponent(JSON.stringify(pet))}`;
    xhr.send(queryParams);
}

// function createJson_for_pet_keeper(petId, ownerId, name, type, breed, gender, birthYear, weight, description, photo) {
//     const jsonObject = {
//         pet_id: petId,
//         owner_id: ownerId,
//         name: name,
//         type: type,
//         breed: breed,
//         gender: gender,
//         birthyear: birthYear,
//         weight: weight,
//         description: description,
//         photo: photo
//     };
//
//     const jsonString = jsonObject;
//     return jsonString;
// }


function validateFormData() {
    const petId = document.getElementById('pet_id').value;
    const birthYear = document.getElementById('birthyear').value;
    const weight = document.getElementById('weight').value;
    const photo = document.getElementById('photo').value;

    const petIdRegex = /^\d{2,}$/;
    const birthYearRegex = /^(200[1-9]|20[1-9]\d)$/; // Birth year > 2000
    const weightRegex = /^[1-9]\d*(\.\d+)?$/; // Weight > 0
    const photoRegex = /^http/; // Starts with 'http'

    if (!petIdRegex.test(petId)) {
        displayMessage('Pet ID should be a 10-digit number.');
        return false;
    }

    if (!birthYearRegex.test(birthYear)) {
        displayMessage('Birth year should be after 2000.');
        return false;
    }

    if (!weightRegex.test(weight)) {
        displayMessage('Weight should be a positive number.');
        return false;
    }

    if (!photoRegex.test(photo)) {
        displayMessage('Photo URL should start with "http".');
        return false;
    }

    // All data is valid
    return true;
}

function displayMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
}

