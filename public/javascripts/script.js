$(document).ready(function () {

    var cache = [],
        queued = [],
        noMoreLikes = false;

    $.get("/nearby", process);

    $.get("/profile", function (data) {
        var d = JSON.parse(data),
            lat = d.pos.lat,
            lon = d.pos.lon;

        $(".gllpLatitude").val(lat);
        $(".gllpLongitude").val(lon);
    });

    function process(data) {
        var results = JSON.parse(data)["results"],
            i;

        if (!results) {
            $("#recs-error-modal").foundation("reveal", "open");
            return;
        }

        if (results[0]._id.indexOf("tinder") >= 0) {
            noMoreLikes = true;
        }

        for (i = 1; i <= 8; i++) {
            var current = results.pop();

            var age = getAgeFromObject(current);

            $("#c" + i + " > .recommendation > #id" + i).val(current["_id"]);
            $("#c" + i + " > .recommendation > .recommendation-info > .recommendation-name").text(current.name + " (" + age + ")");
            $("#c" + i + " > .recommendation > .recommendation-info > .extra-info").text(current["common_friend_count"] + " | " + current["common_like_count"] + " | " + current["photos"]["length"]);

            var im = $("#c" + i + " > .recommendation > .img-wrapper > .spinner");
            im.attr("src", "");
            im.attr("src", current.photos[0].processedFiles[1].url);
            im.removeClass("spinner");
            im.addClass("recommendation-img");

            queued[i - 1] = current;
        }

        for (var x in results) {
            if (results.hasOwnProperty(x)) {
                var img = new Image();
                img.className = "recommendation-img";
                img.src = results[x].photos[0].processedFiles[1].url;
                results[x].pageImage = img;
                cache.push(results[x]);
            }
        }
    }

    $(".like-container").click(function () {
        if (noMoreLikes) {
            var modal = $("#no-likes-modal");
            modal.foundation("reveal", "close");
            modal.foundation("reveal", "open");
            return false;
        }

        var parent = $(this).parent();
        while (!parent.hasClass("recommendation")) { //necessary to get id in hidden field independently of the nesting level of the button
            parent = parent.parent();
        }
        var id = parent.find("input[type='hidden']").val();
        var i = parent.find("input[type='hidden']").attr("id").substring(2, 3);

        var cell = $("#c" + i + " > .recommendation");
        cell.fadeOut(100);
        $.get("/like/" + id,
            function (data) {
                if (!data) {
                    var noLikesModal = $("#no-likes-modal");
                    noLikesModal.foundation("reveal", "close");
                    noLikesModal.foundation("reveal", "open");
                    noMoreLikes = true;
                    cell.fadeIn();
                    return false;
                }

                var result = JSON.parse(data);
                if (result.match) {
                    var matchModal = $("#match-modal");
                    matchModal.foundation("reveal", "close");
                    matchModal.foundation("reveal", "open");
                }

                if (cache.length <= 3) {
                    getNewRecommendations();
                }

                if (cache.length > 0) {
                    var current = cache.pop();

                    var age = getAgeFromObject(current);

                    $("#c" + i + " > .recommendation > #id" + i).val(current["_id"]);
                    $("#c" + i + " > .recommendation > .recommendation-info > .recommendation-name").text(current.name + " (" + age + ")");
                    $("#c" + i + " > .recommendation > .recommendation-info > .extra-info")
                        .text(current["common_friend_count"] + " | " + current["common_like_count"] + " | " + current["photos"]["length"]);
                    $("#c" + i + " > .recommendation > .img-wrapper > .recommendation-img").replaceWith(current.pageImage);

                    queued[i - 1] = current;
                }

                cell.fadeIn();
            }
        );
    });

    $(".nope-container").click(function () {
        var parent = $(this).parent();
        while (!parent.hasClass("recommendation")) { //necessary to get id in hidden field independently of the nesting level of the button
            parent = parent.parent();
        }
        var id = parent.find("input[type='hidden']").val();
        var i = parent.find("input[type='hidden']").attr("id").substring(2, 3);


        var cell = $("#c" + i + " > .recommendation");
        cell.fadeOut(100);
        $.get("/nope/" + id,
            function (data) {
                if (!data) {
                    var modal = $("#no-likes-modal");
                    modal.foundation("reveal", "close");
                    modal.foundation("reveal", "open");
                    noMoreLikes = true;
                }

                if (cache.length <= 3) {
                    getNewRecommendations();
                }

                if (cache.length > 0) {
                    var current = cache.pop();

                    var age = getAgeFromObject(current);

                    $("#c" + i + " > .recommendation > #id" + i).val(current["_id"]);
                    $("#c" + i + " > .recommendation > .recommendation-info > .recommendation-name").text(current.name + " (" + age + ")");
                    $("#c" + i + " > .recommendation > .recommendation-info > .extra-info")
                        .text(current["common_friend_count"] + " | " + current["common_like_count"] + " | " + current["photos"]["length"]);
                    $("#c" + i + " > .recommendation > .img-wrapper > .recommendation-img").replaceWith(current.pageImage);

                    queued[i - 1] = current;
                }

                cell.fadeIn();
            }
        );
    });

    $(".i-container").click(function () {
        var parent = $(this).parent(),
            id,
            name,
            i;
        while (!parent.hasClass("recommendation")) { //necessary to get id in hidden field independently of the nesting level of the button
            parent = parent.parent();
        }

        id = parent.find("input[type='hidden']").val();
        i = parent.find("input[type='hidden']").attr("id").substring(2, 3);
        name = parent.find(".recommendation-info > .recommendation-name").html();

        $("#info-name").html(name);

        var owlData,
            x;

        var current = queued[i - 1],
            photos = current["photos"],
            bio = current["bio"],
            friendsAmount = current["common_friend_count"],
            likesAmount = current["common_like_count"],
            friends = current["common_friends"],
            likes = current["common_likes"];

        /*
         Reset and fill pics
         */
        owlData = $("#info-carousel").data("owlCarousel");

        while (owlData.removeItem() === undefined) {
        }

        for (x in photos) {
            if (photos.hasOwnProperty(x)) {
                owlData.addItem("<div class='item'>" +
                    "<img class='lazyOwl' data-src='" + photos[x]["processedFiles"][1]["url"] + "'>" +
                    "</div>")
            }
        }

        /*
         Fill bio
         */
        if (bio) {
            $("#info-bio-div").show();
            $("#info-bio").html(bio);
        } else {
            $("#info-bio-div").hide();
        }

        /*
         Reset and fill likes
         */
        owlData = $("#info-likes-carousel").data("owlCarousel");

        while (owlData.removeItem() === undefined) {
        }

        if (likesAmount) {
            $("#info-likes-div").show();
            $("#info-likes-amount").html(likesAmount);

            for (x in likes) {
                if (likes.hasOwnProperty(x)) {
                    $.get("/fb/" + likes[x],
                        function (data) {
                            var result = JSON.parse(data);
                            if (result.error) {
                                var msg = "like not found :(";
                                $("#info-likes-carousel").data("owlCarousel").addItem("<div class='item'>" + msg + "</div>");
                            } else {
                                var name = result.name;
                                $("#info-likes-carousel").data("owlCarousel").addItem("<div class='item'>" + name + "</div>");
                            }
                        });
                }
            }
        } else {
            $("#info-likes-div").hide();
        }

        /*
         Reset and fill friends
         */
        owlData = $("#info-friends-carousel").data("owlCarousel");

        while (owlData.removeItem() === undefined) {
        }

        if (friendsAmount) {
            $("#info-friends-div").show();
            $("#info-friends-amount").html(friendsAmount);

            for (x in friends) {
                if (friends.hasOwnProperty(x)) {
                    $.get("/fb/" + friends[x],
                        function (data) {
                            var result = JSON.parse(data);
                            if (result.error) {
                                var msg = "person not found :(";
                                $("#info-friends-carousel").data("owlCarousel").addItem("<div class='item'>" + msg + "</div>");
                            } else {
                                var firstName = result["first_name"],
                                    lastName = result["last_name"],
                                    name = firstName + " " + lastName;
                                $("#info-friends-carousel").data("owlCarousel").addItem("<div class='item'>" + name + "</div>");
                            }
                        });
                }
            }
        } else {
            $("#info-friends-div").hide();
        }

        $("#info-modal").foundation("reveal", "open");
    });

    function getNewRecommendations() {
        $.get("/nearby",
            function (data) {
                var results = JSON.parse(data)["results"];

                for (var x in results) {
                    if (results.hasOwnProperty(x)) {
                        if (alreadyLoaded(results[x])) continue;

                        var img = new Image();
                        img.className = "recommendation-img";
                        img.src = results[x].photos[0].processedFiles[1].url;
                        results[x].pageImage = img;
                        cache.push(results[x]);
                    }
                }
            }
        );

        function alreadyLoaded(e) {
            for (var c in cache)
                if (cache.hasOwnProperty(c))
                    if (cache[c]._id == e._id)
                        return true;

            for (var q in queued)
                if (queued.hasOwnProperty(q))
                    if (queued[q]._id == e._id)
                        return true;

            return false;
        }
    }

    $(".navbar-header").click(function (e) {
        e.preventDefault();

        refresh();

        return false;
    });

    function refresh() {
        cache = [];

        for (var i = 1; i <= 8; i++) {
            var im = $("#c" + i + " > .recommendation > .img-wrapper > .recommendation-img");
            im.removeClass("recommendation-img").attr("src", "../assets/images/spinner_small.gif").addClass("spinner");
        }

        $.get("/nearby",
            function (data) {
                var results = JSON.parse(data)["results"];

                for (i = 1; i <= 8; i++) {
                    var current = results.pop();

                    var age = getAgeFromObject(current);

                    $("#c" + i + " > .recommendation > #id" + i).val(current["_id"]);
                    $("#c" + i + " > .recommendation > .recommendation-info > .recommendation-name").text(current.name + " (" + age + ")");
                    $("#c" + i + " > .recommendation > .recommendation-info > .extra-info").text(current["common_friend_count"] + " | " + current["common_like_count"] + " | " + current["photos"]["length"]);
                    im = $("#c" + i + " > .recommendation > .img-wrapper > .spinner");
                    im.removeClass("spinner").attr("src", "")
                        .addClass("recommendation-img").attr("src", current.photos[0].processedFiles[1].url);
                }

                for (var x in results) {
                    if (results.hasOwnProperty(x)) {
                        var img = new Image();
                        img.className = "recommendation-img";
                        img.src = results[x].photos[0].processedFiles[1].url;
                        results[x].pageImage = img;
                        cache.push(results[x]);
                    }
                }
            }
        );
    }

    $(".img-wrapper").click(function () {
        if ($(this).find(".spinner").length > 0) return false;

        var parent = $(this).parent(),
            i;
        while (!parent.hasClass("recommendation")) { //necessary to get id in hidden field independently of the nesting level of the button
            parent = parent.parent();
        }

        parent.find(".recommendation-options-container").find(".i-container").click();
    });


    var interval;
    var amount = 0;
    var time = 750;
    $("#swipe-ok").click(function () {
        if (noMoreLikes) {
            var swipeModal = $("#swipe-modal");
            swipeModal.foundation("reveal", "close");
            var modal = $("#no-likes-modal");
            //modal.foundation("reveal", "close");
            modal.foundation("reveal", "open");
            return false;
        }
        amount = $("#amount").val();
        time = $("#interval").val();
        interval = setInterval(autoSwipe, time);
        swipeModal.foundation("reveal", "close");
    });
    function autoSwipe() {
        if (amount == 0) {
            clearInterval(interval);
        } else {
            $(".like-container")[amount % 8].click();
            amount--;
        }
    }

    $("#location-ok").click(function () {
        var lat = $(".gllpLatitude").val(),
            lon = $(".gllpLongitude").val(),
            url = "/updatelocation/" + lat + "/" + lon;

        $.get(url,
            function (data) {
                var d = JSON.parse(data);
                if (d.error) {
                    $("#location-modal").foundation("reveal", "close");
                    $("#location-error-modal").foundation("reveal", "open");
                } else {
                    refresh();
                }

            }
        );

        $("#location-modal").foundation("reveal", "close");
    });

    $("#swipe-cancel").click(function () {
        $("#swipe-modal").foundation("reveal", "close");
    });

    $("#location-cancel").click(function () {
        $("#location-modal").foundation("reveal", "close");
    });


    /**
     * Initialize the carousels in the info modal
     */
    $('#info-carousel').owlCarousel({
        items: 1,
        responsiveBaseWidth: $(".recommendation"),
        navigation: true,
        lazyLoad: true
    });

    $("#info-friends-carousel").owlCarousel({
        items: 5,
        navigation: true
    });

    $("#info-likes-carousel").owlCarousel({
        items: 5,
        navigation: true
    });

    function getAgeFromObject(o) {
        var date = new Date(Date.parse(o.birth_date));
        var ageDifMs = Date.now() - date.getTime();
        var ageDate = new Date(ageDifMs); // milliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

});

$(document).foundation();