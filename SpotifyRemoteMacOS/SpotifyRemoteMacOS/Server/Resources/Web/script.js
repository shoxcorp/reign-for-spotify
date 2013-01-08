/* plugins.js */
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

/* Author: Danger Cove

*/

var updateTimeout,
    timeout = 30000,
    currentState,
    allowForce;

function update() {
  $.getJSON('/status', function(data) {
    $('#controls').removeClass();
    currentState = data.state;
    allowForce = data['allow_force'];
    switch(currentState) {
      case "playing":
        $('#playpause').attr('class', 'pause');
        break;
      default:
        $('#playpause').attr('class', 'play');
        break;
    }
    if(currentState == 'off' || allowForce == false) {
      $('#controls').attr('class', 'off');
    }
    $('.track_cover').attr('src', data.cover);
    $('.now_playing').text(data['now_playing']);
    $('.now_playing').attr('href', data.url);
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(update, timeout);
  });
}

var displayTrackList = (function(track_list){
    // We have a track list returned, so display it
                        $('#searchlist').css({'display': 'block', 'height': $('body').height()});
                        $('#searchlist .listbox').css({'height':$('body').height() - $('#searchlist .title').height()});
                        $('#songlist').empty();
                        $('#searchlist').animate({'top': 0});
                        // TODO: Show a spinner
                        var song_list = $('<ul></ul>');
                        // Display the list
                        for(i = 0; i < track_list.length; i++){
                        var track_uri = track_list[i].tracks[0].foreign_id.replace('spotify-WW', 'spotify');
                            song_list.append('<li><a onclick="play_search_track(this.id)" id="'+track_uri+'"><span class="search_title">'+track_list[i].title+'</span><br /><span class="search_artist">' + track_list[i].artist_name + '</span></a></li>');
                        }
                        $('#songlist').append(song_list);
                        // Todo: Hide the spinner




});

var play_search_track = function(id){
    $.get('/play-track/' + id);
    $('#searchlist').animate({'top':$('body').height()}, 500, null, function(){
                             $('#searchlist').css({'display':'none'});
                           update();
                             }

                             );
}

$(document).ready(function() {
  $('#controls a').click(function(e) {
    e.preventDefault();
    if(!allowForce) {
      alert("Sorry, the owner has disabled remote commands.");
    } else {
      if(currentState != 'off') {
        $.get($(this).attr('href'), function(data) {
          //window.location.reload();
          update();
        });
      }
    }
  });
                  $('#closesearchbutton').click(function(e) {
                                                     e.preventDefault();
                                                $('#searchlist').animate({'top':$('body').height()}, 500, null, function(){
                                                                                                                                                              $('#searchlist').css({'display':'none'});
                                                                                                              }

                                                                         );
                                                });
  $('#searchlist').css({'height': $('body').height(), 'top': $('body').height()});
  $('#search_song').submit( function(e) {
    e.preventDefault();
    var search_term = $('#search_keywords').val();
                           if(search_term.length == 0){
                           alert("Please provide a search term");
                           return;
                           }

    $.ajax({
      url: 'http://developer.echonest.com/api/v4/song/search?api_key=BEJQGITFAUZFOA9ZM&format=jsonp&results=50&combined=' + escape(search_term) + '&bucket=id:spotify-WW&bucket=tracks&limit=true&callback=?',
      dataType: 'jsonp',
      success: function(data) {
        if(data.response.songs && data.response.songs.length > 1) {
            // We have more than one track, so display a list of them
           displayTrackList(data.response.songs);
        } else if (data.response.songs && data.response.songs.length > 0) {
           // We only have one track returned. It was probably a hit, so play it
          var song = data.response.songs[0];
          if(song.tracks) {
            var track = song.tracks[0],
                track_uri = track.foreign_id.replace('spotify-WW', 'spotify');
            $.get('/play-track/' + track_uri);
            update();
          }
        } else {
          alert("Didn't find anything for: " + search_term);
        }
      }
    });
  });

  update();
  updateTimeout = setTimeout(update, timeout);
  dropTrackSetup();
});
