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



////////////////////////////////////////////////////////////
//ON FORM SUBMIT
////////////////////////////////////////////////////////////
$("form").submit(function(evt){
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
    if(selectOption() === 0) {
      albumArray = [];
      var spotifySort = '<div id="sort"><h2>Sort by</h2><button id="spotifyDateSort">Date</button><button id="spotifyNameSort">Name</button><button id="spotifyPopSort">Popularity</button><hr /></div>';
      $(spotifySort).insertAfter("form");

  // the AJAX part
  var spotifyArtistAPI = "https://api.spotify.com/v1/search";
  var spotifyArtistSearch = userSearch.val();
  var spotifyArtistOptions = {
    q: spotifyArtistSearch,
    type : 'album',
    limit : 8
  };

  function spotifyArtistCallback(data) {
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
      $.each(albumArray, function(i, album) {
        //gallery content
        insertAlbumRebuild += '<a href="#lightboxAlbum" class="album-gallery">';
        insertAlbumRebuild += '<img src="' + album.images[1].url + '" alt="' + album.name + '" spotify-id="' + album.id + '" />';
        insertAlbumRebuild += '</a>';
      });
      $('#content').html(insertAlbumRebuild);
    } //END GALLERY UPDATE

    function lightboxContent() {
      var albumID = $("#active").attr("spotify-id");

      //Prevent the Body from scrolling
      $('body').attr("class", "noscroll");

      // SECOND AJAX Call
      var spotifyAlbumAPI = "https://api.spotify.com/v1/albums/" + albumID;
      var spotifyAlbumOptions = {
        type : 'album',
        limit : 50
      };

      function spotifyAlbumCallback(albumData) {
        //Create lightbox album content
        var lightboxAlbum = '<div class="btnWrapper"><button id="btnExit" type="button"> X </button></div><div class="album-info">';
        lightboxAlbum += '<img class="album-art" src="' + albumData.images[2].url + '">';
        lightboxAlbum += '<div><p class="album-artist">' + albumData.artists[0].name + '</p>';
        lightboxAlbum += '<p class="album-title">' + albumData.name + '</p>';
        lightboxAlbum += '<p class="album-year" maxlength="4">' + albumData.release_date + '</p>';
        lightboxAlbum += '</div></div>';
        lightboxAlbum += '<ol class="album-tracks">';

        $.each(albumData.tracks.items, function(i, track) {
          lightboxAlbum += '<li>' + track.name + '</li>';
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
      $.getJSON(spotifyAlbumAPI, spotifyAlbumOptions, spotifyAlbumCallback);
    } //END LIGHTBOX CONTENT CLICK

    //LOOP TO BUILD GALLERY AND ARRAY
    $.each(data.albums.items, function(i, album) {
      //gallery content
      insertAlbum += '<a href="#lightboxAlbum" class="album-gallery">';
      insertAlbum += '<img src="' + album.images[1].url + '" alt="' + album.name + '" spotify-id="' + album.id + '" />';
      insertAlbum += '</a>';

      ////////////////////////////////////////////////////////////
      //SECOND AJAX CALL FOR ARRAY
      ////////////////////////////////////////////////////////////
      var spotifyAlbumAPI = "https://api.spotify.com/v1/albums/" + album.id;
      var spotifyAlbumOptions = {
        type : 'album',
        limit : 50
      };

      function spotifyAlbumCallback(albumData) {
        albumArray.push(albumData);
      } //END ARRAY CALLBACK

      //ARRAY AJAX call
      $.getJSON(spotifyAlbumAPI, spotifyAlbumOptions, spotifyAlbumCallback);
    }); //END EACH LOOP TO BUILD GALLERY AND ARRAY


    ////////////////////////////////////////////////////////////
    //IF SPOTIFY ARTIST DOESN'T EXIST
    ////////////////////////////////////////////////////////////
    if ( typeof data.albums.items[0] === "undefined" ) {
      enableSearch();
      var errorMessage = "<p class='error-message'>Sorry, " + userSearch.val() + " is not part of our library. Please make sure you have the correct spelling and try again.</p>";
      $('#content').html(errorMessage);
//      return;
    } else {
      $('#sort').show();
      //Link back to Spotify under gallery
      insertAlbum += '<p>Visit <a href="' + data.albums.items[0].artists[0].external_urls.spotify + '" target="_blank">Spotify</a> for the latest news on <span>' + userSearch.val() + '</span>.</p>';
      insertAlbum += '</div>';
      //Put content on page
      $('#content').html(insertAlbum);
      //put back search bar
      enableSearch();
    } // END SPOTIFY ARTIST DOESN'T EXIST

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
    $("#spotifyDateSort").click(function() {
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

    $("#spotifyNameSort").click(function() {
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

    $("#spotifyPopSort").click(function() {
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
  $.getJSON(spotifyArtistAPI, spotifyArtistOptions, spotifyArtistCallback);

  } else if(selectOption() === 1) {
    console.log(selectOption());
    enableSearch();
    //Other API goes here
  }
}); //END FORM SUBMIT
