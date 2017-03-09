(function() {

    // function to get a csrfTokenVal to be passed into the headers
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');


    $('.button-collapse').sideNav({
        menuWidth: 240,
        draggable: true // Choose whether you can drag to open on touch screens
    });


    /**
     * The response object is returned with a status field that lets the
     * app know the current login status of the person.
     * @param response: Object['status']
     * */
    var statusChangeCallback = function(response) {
        console.log(response);
        if (response.status === 'connected') {
            var currentLocation = window.location.pathname.split('/')
            if (currentLocation[0] === "" && currentLocation[1] === "") {
                // noinspection JSUnresolvedVariable
                window.location.href = '/pages/' + response.authResponse.userID;
            }
        }
    }


    window.fbAsyncInit = function() {
        //noinspection JSUnresolvedVariable
        FB.init({
            appId: '1928463530773255',
            cookie: true,
            xfbml: true,
            version: 'v2.8'
        });

        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    };


    // Load the SDK asynchronously
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));



    /**
     * Check if a login status of a user
     */
    var checkLoginState = function() {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    };


    /**
     * Posts user's FB data to the server to be cached
     * @param user: object[profile, pages]
     * @param url: String, the url to make request to
     */
    var postData = function(data, url) {
        var payLoad = {
            method: 'POST',
            mode: 'same-origin',
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        };

        //noinspection JSUnresolvedFunction
        fetch(url, payLoad).then(function(response) {
            if (response.status !== 200) {
                throw new Error();
            }
            checkLoginState();
        }).catch(function(err) {
                Materialize.toast('Error while connecting to server', 3000);
                console.log(err);
        });
    };


    /**
     * requests for the basic info about the user
     * @returns: Promise<{first_name, last_name, picture[width=120, height=120], id}>
     */
    var getUser = function() {
        //noinspection JSUnresolvedFunction
        return new Promise(function(resolve) {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            FB.api('/me', {
                fields: 'id, first_name, last_name, picture.width(120).height(120)'
            },function(userData) {
                resolve(userData);
            });
        })
    };


    /**
     * requests for the list of pages that the user is managing
     * @returns: Promise<{category, description, name, can_post, picture[width=320, height=320], id}>
     */
    var getPages = function() {
        //noinspection JSUnresolvedFunction
        return new Promise(function(resolve) {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            FB.api('/me/accounts', {
                fields: 'category, description, name, picture.width(320).height(320), id'
            },function(pageData) {
                resolve(pageData);
            });
        });
    };


    $("#fb-login").on('click', function() {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        FB.login(function(response) {
            //noinspection JSUnresolvedVariable
            if (response.authResponse) {
                var data = {};
                getUser().then(function(userData) {
                    data.profile = userData;
                    getPages().then(function(pageData) {
                        data.pages = pageData;
                        console.log(data);
                        postData(data, '/');
                    });
                });
            } else {
                Materialize.toast('User cancelled login or did not fully authorize.', 3000);
            }
        }, {scope: 'public_profile, pages_show_list'});
    });


    $("#logout-btn").on('click', function() {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        FB.logout(function(response) {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            window.location.href = '/';
        });
    });
}());