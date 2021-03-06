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


    // set the height of cards to equal lengths
    function equalizeCardHeights() {
    	var maxHeight    = 0;
        var cardContents = $(".card .card-content");
        cardContents.each(function(){
            if ($(this).height() > maxHeight) { maxHeight = $(this).height(); }
        });
        cardContents.height(maxHeight);
    }


    equalizeCardHeights();


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


    // init FB object
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
            console.log(response);
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
            window.location.href = '/user/' + data.profile.id;
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
        var userId = $(this).attr('data-user-id');
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        FB.logout(function(response) {
            console.log(response);
            $.ajax({
                url: '/logout',
                type: 'POST',
                data: JSON.stringify({id: userId}),
                async: true,
                success: function(msg) {
                    console.log(msg);
                    window.location.href = '/';
                },
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken
                }
            });
        });
    });


    /**
     * updates the user activity table on successful image upload
     * @param pageName: String, the name of page
     * @param size: size of the image in MB
     * @param fileName: name of image file
     * */
    var updateActivityLog = function(userId, pageName, size, fileName) {
        var payLoad = {
            method: 'POST',
            mode: 'same-origin',
            body: JSON.stringify({id: userId, page: pageName, size: size, file: fileName}),
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
            if (data.status !== 200) {
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
        var self = $(this);

        var userId = $(this).attr('data-id');
        var formData = new FormData($('#image-upload-form')[0]);
        var size = $('#image-field')[0].files[0].size / 1000000;

        if (size > 1) {
            Materialize.toast('File Size must be smaller than 1 MB', 3000);
            self.val('upload');
            return;
        }

        self.val('uploading...');

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
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                FB.api("/" + id + "/photos", "POST", {
                        "url": 'https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png'
                    },
                    function (response) {
                        if (response && !response.error) {
                            Materialize.toast('Image uploaded successfully', 3000);
                            console.log(response);
                            //noinspection JSUnresolvedVariable
                            updateActivityLog(userId, pageName, size, data.filename);
                            $('#file-modal').modal('close');
                        } else {
                            Materialize.toast('An error occured while uploading file, please try again', 3000);
                            console.log(response.error)
                        }
                        self.val('upload');
                    }
                );
            } else {
                self.val('upload');
                //noinspection JSUnresolvedVariable
                Materialize.toast(data.msg, 3000);
            }
        }).catch(function(err) {
            self.val('upload');
            console.log(err);
            Materialize.toast('An error occured while uploading file, please try again', 3000);
        });
    });


    $('#id-pages').on('click', function(evt) {
        evt.preventDefault();
        window.location.href = '/user/' + window.location.pathname.split('/')[2]
    })

    $('#id-activity').on('click', function(event) {
        event.preventDefault();
        $(this).toggleClass('active');
        $('#id-pages').toggleClass('active');

        $.ajax({
	        url: '/activities',
	        type: 'POST',
	        data: JSON.stringify({id: window.location.pathname.split('/')[2]}),
	        async: true,
	        success: function(html) {
                $('#main-content').html('');
                $('#id-current-page').html('Activities')
	            $('#main-content').append(html);
	        },
         	headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            }
		});
    });
}());