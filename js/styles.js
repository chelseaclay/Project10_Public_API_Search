////////////////////////////////////////////////////////////
//GLOBAL VARIABLES
////////////////////////////////////////////////////////////
var userSearch = $("#search");
var submitBtn = $("#submit");


////////////////////////////////////////////////////////////
//FUNCATIONS
////////////////////////////////////////////////////////////
function disableSearch() {
  userSearch.prop("disabled", true);
  submitBtn.attr("disabled", true).val("Searching...");
}

function enableSearch() {
  userSearch.prop("disabled", false);
  submitBtn.attr("disabled", false).val("Search");
}

function apiSwitch() {
  if(document.getElementById("switch-input").checked) {
    return "Actor";
  } else {
    return "Artist";
  }
}


////////////////////////////////////////////////////////////
//ON FORM SUBMIT
////////////////////////////////////////////////////////////
$("form").submit(function(evt){
  //if userSearch is blank
  if (userSearch.val() === "") {
    $("#content").remove();
    var errorMessage = "Please fill out Artist or Actor Name";
    var contentDiv = '<div id="content"><p class="error-message">' + errorMessage + '</p></div>';
    $("body").append(contentDiv);
  } else {
    evt.preventDefault();
    disableSearch();
    $("#sort").remove();
    $("#content").remove();
    var contentDiv = '<div id="content"></div>';
    $("body").append(contentDiv);
    //Get Artist or Actor selection
    function selectOption() {
        var obj = document.getElementById("selectType");
        return obj.options.selectedIndex;
    }
      // IF ARTIST IS SELECTED
      if(apiSwitch() === "Artist") {
        albumArray = [];
        var artistSort = '<div id="sort"><h2>Sort by</h2><button id="artistDateSort">Date</button><button id="artistNameSort">Name</button><button id="artistPopSort">Popularity</button><hr /></div>';
        $(artistSort).insertAfter("form");

    // the AJAX part
    var artistAPI = "https://itunes.apple.com/search?";
    var artistOptions = {
      term: userSearch.val(),
      limit : 8,
      media: 'music',
      entity: 'album'
    };

    function artistCallback(data) {
      //Build gallery content
      var insertAlbum = '<div id="gallery">';
      //Create Overlay and buttons
      var overlayLightbox = '<div id="overlay"><button id="btnPrev" type="button"> < </button><div class="album"></div><button id="btnNext" type="button"> > </button></div>';

      ////////////////////////////////////////////////////////////
      //FUNCTIONS
      ////////////////////////////////////////////////////////////

      function SortByDate(a, b){
        var aDate = a.release_date;
        var bDate = b.release_date;
        return ((aDate < bDate) ? -1 : ((aDate > bDate) ? 1 : 0));
      }

      function SortByName(a, b){
        var aName = a.name;
        var bName = b.name;
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
      }

      function SortByPopularity(a, b){
        var aPop = a.popularity;
        var bPop = b.popularity;
        return ((aPop < bPop) ? -1 : ((aPop > bPop) ? 1 : 0));
      }

      function updateGallery() {
        var insertAlbumRebuild = '<div id="gallery">';
        $.each(albumArray[0].results, function(i, album) {
          //gallery content
          insertAlbumRebuild += '<a href="#lightboxAlbum" class="album-gallery">';
          insertAlbumRebuild += '<img src="' + album.artworkUrl100 + '" alt="' + album.collectionName + '" artist-id="' + album.collectionId + '" />';
          insertAlbumRebuild += '</a>';
        });
        insertAlbumRebuild += '<p>Visit <a href="' + albumArray[0].results[0].artistViewUrl + '" target="_blank">iTunes</a> for the latest news on <span>' + userSearch.val() + '</span>.</p>';
        $('#content').html(insertAlbumRebuild);
      } //END GALLERY UPDATE

      function lightboxContent() {
        var albumID = $("#active").attr("artist-id");

        //Prevent the Body from scrolling
        $('body').attr("class", "noscroll");

        // SECOND AJAX Call
        var artistAlbumAPI = "https://itunes.apple.com/lookup?";
        var artistAlbumOptions = {
          id : albumID,
          limit : 50,
          entity : 'song'
        };

        function artistAlbumCallback(albumData) {
          //Create lightbox album content
          var albumRelease = albumData.results[0].releaseDate
          var lightboxAlbum = '<div class="btnWrapper"><button id="btnExit" type="button"> X </button></div><div class="album-info">';
          lightboxAlbum += '<img class="album-art" src="' + albumData.results[0].artworkUrl100 + '">';
          lightboxAlbum += '<div><p class="album-artist">' + albumData.results[0].artistName + '</p>';
          lightboxAlbum += '<p class="album-title">' + albumData.results[0].collectionName + '</p>';
          lightboxAlbum += '<p class="album-year">' + albumRelease.substring(0, 4) + '</p>';
          lightboxAlbum += '</div></div>';
          lightboxAlbum += '<ol class="album-tracks">';

          $.each(albumData.results, function(i, track) {
            if (i > 0) {
              lightboxAlbum += '<li>' + track.trackName + '</li>';
            }
          });

          lightboxAlbum += '</ol>';

          //append lightbox to album div in overlay
          $(".album").html(lightboxAlbum);


          ////////////////////////////////////////////////////////////
          //CLICK BASED NAVIGATION
          ////////////////////////////////////////////////////////////
          $("#btnPrev").click(function(){
            if($(".album-gallery:nth-child(1)").find("img").is("#active")) {
              $("#overlay").remove();
              $(".album-gallery:nth-child(8)").find("img").trigger("click");
            } else {
              $("#overlay").remove();
              $("#active").parent(".album-gallery").prev().find("img").trigger("click");
            }
          });

          $("#btnNext").click(function(){
            if($(".album-gallery:nth-child(8)").find("img").is("#active")) {
              $("#overlay").remove();
              $(".album-gallery:nth-child(1)").find("img").trigger("click");
            } else {
              $("#overlay").remove();
              $("#active").parent(".album-gallery").next().find("img").trigger("click");
            }
          });

          $("#btnExit").click(function(){
            $("#overlay").remove();
            $("#active").removeAttr("id");
            $("body").removeClass("noscroll");
          });

          $("#overlay").click(function(){
            $("#overlay").remove();
            $("#active").removeAttr("id");
            $("body").removeClass("noscroll");
          }); // END CLICK NAVIGATION


          ////////////////////////////////////////////////////////////
          //KEYBOARD BASED NAVIGATION
          ////////////////////////////////////////////////////////////
          document.onkeydown = function(evt) {
            evt = evt || window.event;
            switch (evt.keyCode) {
              case 37:
                if($(".album-gallery:nth-child(1)").find("img").is("#active")) {
                  $("#overlay").remove();
                  $(".album-gallery:nth-child(8)").find("img").trigger("click");
                  break;
                } else {
                  $("#overlay").remove();
                  $("#active").parent(".album-gallery").prev().find("img").trigger("click");
                  break;
                }
              case 39:
                if($(".album-gallery:nth-child(8)").find("img").is("#active")) {
                  $("#overlay").remove();
                  $(".album-gallery:nth-child(1)").find("img").trigger("click");
                  break;
                } else {
                  $("#overlay").remove();
                  $("#active").parent(".album-gallery").next().find("img").trigger("click");
                  break;
                }
                case 27:
                $("#overlay").remove();
                $("#active").removeAttr("id");
                $("body").removeClass("noscroll");
                break;
              }
            }; // END KEYBOARD NAVIGATION

          } //END SECOND CALLBACK

        //append overlay to page
        $('#content').append(overlayLightbox);

        //SECOND AJAX call
        $.getJSON(artistAlbumAPI, artistAlbumOptions, artistAlbumCallback);
      } //END LIGHTBOX CONTENT CLICK

      //LOOP TO BUILD GALLERY AND ARRAY
      $.each(data.results, function(i, album) {
        //gallery content
        insertAlbum += '<a href="#lightboxAlbum" class="album-gallery">';
        insertAlbum += '<img src="' + album.artworkUrl100 + '" alt="' + album.collectionName + '" artist-id="' + album.collectionId + '" />';
        insertAlbum += '</a>';

        ////////////////////////////////////////////////////////////
        //SECOND AJAX CALL FOR ARRAY
        ////////////////////////////////////////////////////////////

        var artistAlbumAPI = "https://itunes.apple.com/lookup?";
        var artistAlbumOptions = {
          id : album.collectionId,
          limit : 50,
          entity : 'song'
        };

        function artistAlbumCallback(albumData) {
          albumArray.push(albumData);
        } //END ARRAY CALLBACK

        //ARRAY AJAX call
        $.getJSON(artistAlbumAPI, artistAlbumOptions, artistAlbumCallback);
      }); //END EACH LOOP TO BUILD GALLERY AND ARRAY


      ////////////////////////////////////////////////////////////
      //IF ARTIST DOESN'T EXIST
      ////////////////////////////////////////////////////////////
      if ( typeof data.results[0] === "undefined" ) {
        enableSearch();
        var errorMessage = "<p class='error-message'>Sorry, <span>" + userSearch.val() + "</span> is not part of our library. Please make sure you have the correct spelling and try again.</p>";
        $("#sort").remove();
        $('#content').html(errorMessage);
      } else {
        $('#sort').show();
        //Link back to iTunes under gallery
        insertAlbum += '<p>Visit <a href="' + data.results[0].artistViewUrl + '" target="_blank">iTunes</a> for the latest news on <span>' + userSearch.val() + '</span>.</p>';
        insertAlbum += '</div>';
        //Put content on page
        $('#content').html(insertAlbum);
        //put back search bar
        enableSearch();
      } // END ARTIST DOESN'T EXIST

      ////////////////////////////////////////////////////////////
      //DISPLAY LIGHTBOX ON CLICK
      ////////////////////////////////////////////////////////////
      $(".album-gallery > img").click(function() {
        //Remove active id from previous active item
        $("#active").removeAttr("id");
        //Adds active id to active image
        $(this).attr("id", "active");
        lightboxContent();
      }); //END LIGHTBOX CLICK

      ////////////////////////////////////////////////////////////
      //SORT THE GALLERY by the ARRAY
      ////////////////////////////////////////////////////////////
      $("#artistDateSort").click(function() {
        albumArray.sort(SortByDate);
        updateGallery();
        $(".album-gallery > img").click(function() {
          //Remove active id from previous active item
          $("#active").removeAttr("id");
          //Adds active id to active image
          $(this).attr("id", "active");
          lightboxContent();
        }); //END LIGHTBOX CLICK
      }); //End sort by date

      $("#artistNameSort").click(function() {
        albumArray.sort(SortByName);
        updateGallery();
        $(".album-gallery > img").click(function() {
          //Remove active id from previous active item
          $("#active").removeAttr("id");
          //Adds active id to active image
          $(this).attr("id", "active");
          lightboxContent();
        }); //END LIGHTBOX CLICK
      }); //End sort by name

      $("#artistPopSort").click(function() {
        albumArray.sort(SortByPopularity);
        updateGallery();
        $(".album-gallery > img").click(function() {
          //Remove active id from previous active item
          $("#active").removeAttr("id");
          //Adds active id to active image
          $(this).attr("id", "active");
          lightboxContent();
        }); //END LIGHTBOX CLICK
      }); //End sort by popularity

    } //END ORIGINAL CALLBACK

    //ORIGINAL AJAX CALL
    $.getJSON(artistAPI, artistOptions, artistCallback);



    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    //MOVIE API
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    } else if(apiSwitch() === "Actor") {
      enableSearch();
      var iTunesSort = '<div id="sort"><h2>Sort by</h2><button id="iTunesDateSort">Date</button><button id="iTunesNameSort">Name</button><hr /></div>';
        $(iTunesSort).insertAfter("form");


      //Other API goes here
      var iTunesAPI = "https://itunes.apple.com/search?";
      var iTunesOptions = {
        term: userSearch.val(),
        limit : 8
      };

      function iTunesCallback(data) {
        movieArray = [];
        movieArray.push(data);

        //Build gallery
        var insertMovie = '<div id="gallery">';
        //Create Overlay and buttons
        var overlayLightbox = '<div id="overlay"><button id="btnPrev" type="button"> < </button><div class="movie"></div><button id="btnNext" type="button"> > </button></div>';

        ////////////////////////////////////////////////////////////
        //FUNCTIONS
        ////////////////////////////////////////////////////////////

        function SortByDate(a, b){
          var aDate = a.releaseDate;
          var bDate = b.releaseDate;
          return ((aDate < bDate) ? -1 : ((aDate > bDate) ? 1 : 0));
        }

        function SortByName(a, b){
          var aName = a.trackName;
          var bName = b.trackName;
          return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        }

        function updateGallery() {
          var insertMovieRebuild = '<div id="gallery">';
          //gallery content
          $.each(movieArray[0].results, function(i, movie) {
            //gallery content
            var moviePoster = movie.artworkUrl100;
            var largeMoviePoster = moviePoster.replace("100x100", "600x600");
            insertMovieRebuild += '<a href="#lightboxMovie" class="movie-gallery">';
            insertMovieRebuild += '<img src="' + largeMoviePoster + '" alt="' + movie.trackName + '" />';
            insertMovieRebuild += '</a>';
          });

          $('#content').html(insertMovieRebuild);
        } //END GALLERY UPDATE

        function lightboxContent(i) {
          //Prevent the Body from scrolling
          $('body').attr("class", "noscroll");

          //Create lightbox content
          var moviePoster = movieArray[0].results[i].artworkUrl100;
          var largeMoviePoster = moviePoster.replace("100x100", "600x600");
          var movieRelease = movieArray[0].results[i].releaseDate;
          var lightboxMovie = '<div class="btnWrapper"><button id="btnExit" type="button"> X </button></div>';
          lightboxMovie += '<img class="movie-poster" src="' + largeMoviePoster + '">';
          lightboxMovie += '<div class="movie-info">';
            lightboxMovie += '<p class="movie-title">' + movieArray[0].results[i].trackName + '</p>';
            lightboxMovie += '<p class="movie-genre">' + movieArray[0].results[i].primaryGenreName + '</p>';
            lightboxMovie += '<p class="movie-year">' + movieRelease.substring(0, 4) + ' |&nbsp</p>';
            lightboxMovie += '<p class="movie-rating">' + movieArray[0].results[i].contentAdvisoryRating + '</p>';
          lightboxMovie += '</div>'; //end movie-info div
          lightboxMovie += '<p class="movie-plot">' + movieArray[0].results[i].longDescription + '</p>';

          //append overlay to page
          $('#content').append(overlayLightbox);

          //append lightbox to movie div in overlay
          $(".movie").append(lightboxMovie);


          ////////////////////////////////////////////////////////////
          //CLICK BASED NAVIGATION
          ////////////////////////////////////////////////////////////
          $("#btnPrev").click(function(){
            if($(".movie-gallery:nth-child(1)").find("img").is("#active")) {
              $("#overlay").remove();
              $(".movie-gallery:nth-child(8)").find("img").trigger("click");
            } else {
              $("#overlay").remove();
              $("#active").parent(".movie-gallery").prev().find("img").trigger("click");
            }
          });

          $("#btnNext").click(function(){
            if($(".movie-gallery:nth-child(8)").find("img").is("#active")) {
              $("#overlay").remove();
              $(".movie-gallery:nth-child(1)").find("img").trigger("click");
            } else {
              $("#overlay").remove();
              $("#active").parent(".movie-gallery").next().find("img").trigger("click");
            }
          });

          $("#btnExit").click(function(){
            $("#overlay").remove();
            $("#active").removeAttr("id");
            $("body").removeClass("noscroll");
          });

          $("#overlay").click(function(){
            $("#overlay").remove();
            $("#active").removeAttr("id");
            $("body").removeClass("noscroll");
          }); // END CLICK NAVIGATION


          ////////////////////////////////////////////////////////////
          //KEYBOARD BASED NAVIGATION
          ////////////////////////////////////////////////////////////
          document.onkeydown = function(evt) {
            evt = evt || window.event;
            switch (evt.keyCode) {
              case 37:
                if($(".movie-gallery:nth-child(1)").find("img").is("#active")) {
                  $("#overlay").remove();
                  $(".movie-gallery:nth-child(8)").find("img").trigger("click");
                  break;
                } else {
                  $("#overlay").remove();
                  $("#active").parent(".movie-gallery").prev().find("img").trigger("click");
                  break;
                }
              case 39:
                if($(".movie-gallery:nth-child(8)").find("img").is("#active")) {
                  $("#overlay").remove();
                  $(".movie-gallery:nth-child(1)").find("img").trigger("click");
                  break;
                } else {
                  $("#overlay").remove();
                  $("#active").parent(".movie-gallery").next().find("img").trigger("click");
                  break;
                }
                case 27:
                $("#overlay").remove();
                $("#active").removeAttr("id");
                $("body").removeClass("noscroll");
                break;
              }
            }; // END KEYBOARD NAVIGATION


        } //END lightboxContent


        ////////////////////////////////////////////////////////////
        //IF ITUNES ACTOR DOESN'T EXIST
        ////////////////////////////////////////////////////////////
        if ( data.results.length === 0 ) {
          enableSearch();
          var errorMessage = "<p class='error-message'>Sorry, <span>" + userSearch.val() + "</span> is not part of our library. Please make sure you have the correct spelling and try again.</p>";
          $("#sort").remove();
          $('#content').html(errorMessage);
        } else {
          //Build gallery content
          $.each(data.results, function(i, movie) {
            //gallery content
            var moviePoster = movie.artworkUrl100;
            var largeMoviePoster = moviePoster.replace("100x100", "600x600");
            insertMovie += '<a href="#lightboxMovie" class="movie-gallery">';
            insertMovie += '<img src="' + largeMoviePoster + '" alt="' + movie.trackName + '" />';
            insertMovie += '</a>';
          });

          //insert gallery into Content div
          $("#content").html(insertMovie);
        }



        // LIGHTBOX CLICK
        $(".movie-gallery > img").click(function() {
          //Remove active id from previous active item
          $("#active").removeAttr("id");
          //Adds active id to active image
          $(this).attr("id", "active");
          var titleClicked = $(".movie-gallery > img").index(this);
          lightboxContent(titleClicked);
        }); //END LIGHTBOX CLICK



        ////////////////////////////////////////////////////////////
        //SORT THE GALLERY by the ARRAY
        ////////////////////////////////////////////////////////////
        $("#iTunesDateSort").click(function() {
          var movieSort = movieArray[0].results;
          movieSort.sort(SortByDate);
          updateGallery();
          $(".movie-gallery > img").click(function() {
            //Remove active id from previous active item
            $("#active").removeAttr("id");
            //Adds active id to active image
            $(this).attr("id", "active");
            var titleClicked = $(".movie-gallery > img").index(this);
            lightboxContent(titleClicked);
          }); //END LIGHTBOX CLICK
        }); //End sort by date

        $("#iTunesNameSort").click(function() {
          var movieSort = movieArray[0].results;
          movieSort.sort(SortByName);
          updateGallery();
          $(".movie-gallery > img").click(function() {
            //Remove active id from previous active item
            $("#active").removeAttr("id");
            //Adds active id to active image
            $(this).attr("id", "active");
            var titleClicked = $(".movie-gallery > img").index(this);
            lightboxContent(titleClicked);
          }); //END LIGHTBOX CLICK

        }); //End sort by name

      } //END iTunesCallback


      //AJAX CALL
  //    $.getJSON(iTunesAPI, iTunesOptions, iTunesCallback);
      $.ajax({
        url: iTunesAPI,
        data: iTunesOptions,
        dataType: 'JSONP',
        type: "GET",
        success: iTunesCallback
        });

    } //END MOVIE API
  } // END userSearch is filled out

}); //END FORM SUBMIT
