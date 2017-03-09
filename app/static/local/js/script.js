(function() {

    // init sidebar
    $('.button-collapse').sideNav({
        menuWidth: 240,
        draggable: true // Choose whether you can drag to open on touch screens
    });

    // init modal
    $('.modal').modal({
        dismissible: false
    });


    var id, pageName;
    $('.modal-trigger').on('click', function() {
        id = $(this).attr('id')
        pageName = $(this).attr('data-name');
    })


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
            appId: '159699801213250',
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
        }, {scope: 'public_profile, pages_show_list, publish_actions, manage_pages, publish_pages'});
    });


    $("#logout-btn").on('click', function() {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        FB.logout(function(response) {
            console.log(response)
            window.location.href = '/';
        });
    });

    var updateActivityLog = function(pageName, size, fileName, callback) {
        var payLoad = {
            method: 'POST',
            mode: 'same-origin',
            body: JSON.stringify({page: pageName, size: size, file: fileName}),
            headers: {
                "Content-Type": "application/json"
            }
        };

        //noinspection JSUnresolvedFunction
        fetch('/update-activity', payLoad).then(function(response) {
            if (response.status !== 200) {
                throw new Error();
            }
            return response.json()
        }).then(function(data) {
            if (data.status === 200) {
                //noinspection JSUnresolvedVariable
                callback();
            } else {
                //noinspection JSUnresolvedVariable
                console.log(data.err);
            }
            //noinspection JSUnresolvedVariable
            Materialize.toast(data.msg, 3000);
        }).catch(function(err) {
            console.log(err);
            Materialize.toast('An error occured while updating activity, please try again', 3000);
        });
    }

    // upload file
    $('#upload-file').on('click', function(evt) {
        evt.preventDefault();
        var formData = new FormData($('#image-upload-form')[0]);
        var size = $('#image-field')[0].files[0].size / 1000000;
        if (size > 1) {
            Materialize.toast('File Size must be smaller than be 1 MB', 3000);
            return;
        }

        var payLoad = {
            method: 'POST',
            mode: 'same-origin',
            body: formData,
        };

        // noinspection JSUnresolvedFunction
        fetch('/upload', payLoad).then(function(response) {
            if (response.status !== 200) {
                throw new Error();
            }
            return response.json()
        }).then(function(data) {
            if (data.status === 200) {
                //noinspection JSUnresolvedVariable
                updateActivityLog(pageName, size, data.filename, function () {
                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    FB.api("/" + id + "/photos", "POST", {
                            "url": 'https://cdn.sstatic.net/Sites/stackoverflow/img/apple-touch-icon.png?v=c78bd457575a'
                        },
                        function (response) {
                            if (response && !response.error) {
                                Materialize.toast('Image uploaded successfully');
                                console.log(response);
                            } else {
                                Materialize.toast('An error occured while uploading file, please try again', 3000);
                                console.log(response.error)
                            }
                        }
                    );
                });
                $('#file-modal').modal('close');
            } else {
                //noinspection JSUnresolvedVariable
                Materialize.toast(data.msg, 3000);
            }
        }).catch(function(err) {
            console.log(err);
            Materialize.toast('An error occured while uploading file, please try again', 3000);
        });
    })
}());