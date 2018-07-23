const app = angular.module('MyApp', []);

app.controller('MainController', ['$http', function($http){
  /* ---------------------
  Global variables
   --------------------- */
  this.h1 = 'Playlist App'
  this.playlist = {}
  this.playlists = []
  this.newPlayListName = ''
  this.createForm = {}
  this.selectedTrack = {}

   // API CALL
  this.baseURL = 'http://ws.audioscrobbler.com/2.0/?';
  this.methodSearch = 'method=track.search';
  this.methodInfo = 'method=track.getInfo';
  this.apikey = '&api_key=' + '8e2f6f5f6da4114d76e92c9b03878d02';
  this.format = '&format=json';

  this.tracks = [];
  this.foundMusic = null;
  // addTrack is true when user is adding a track to the playlist
  this.addTrack = false;

  // Toggle variables for displays
  this.viewDetails = false;

  /* ---------------------
  Playlist functions
   --------------------- */
  // Makes HTTP request to create new playlist
  this.createPlaylist = () => {
    this.createForm.creator = this.loggedInUserData.username;
    console.log('Angular - Calling createPlayList');
    $http({
      method: 'POST',
      url: '/playlists',
      data: this.createForm
    }).then(response => {
      console.log(response.data);
      this.playlists.unshift(response.data);
      this.createForm = {};
    }, error => {
      console.log(error);
    })
  }

  // Makes HTTP request to get all playlists
  this.getPlaylist = () => {
    $http({
      method: 'GET',
      url: '/playlists',
    }).then(response => {
      // console.log(response.data);
      this.playlists = response.data
      this.playlist = this.playlists[0]
    }, error => {
      console.log(error);
    })
  }

  this.editPlaylist = (playlistEdit) => {
    this.playlist = playlistEdit;
    this.addTrack = true;
  }

  // Makes HTTP request to delete playlist
  this.deletePlaylist = (playlist) => {
    console.log(this.playlist)
    this.viewDetails = false;
    $http({
      method: 'DELETE',
      url: '/playlists/' + this.playlist._id
    }).then(response => {
      console.log(response.data);
      const removeByIndex = this.playlists.findIndex(playlist => playlist._id === this.playlist._id)
      this.playlists.splice(removeByIndex, 1)
    }, error => {
      console.log(error);
    })
  }

  // Makes HTTP request to add track to playlist
  this.addTrackToPlaylist = (title, artist, images, index) => {

    let titleFormatted = title.split(' ').join('+');
    let artistFormatted = artist.split(' ').join('+');
    this.selectedTrack.title = title;
    this.selectedTrack.artist = artist;
    this.selectedTrack.image = images;
    this.selectedTrack.index = index;
    $http({
      method: 'GET',
      url: this.baseURL + this.methodInfo + this.apikey + "&artist=" + artistFormatted + '&track=' + titleFormatted + this.format
    }).then(response => {
      this.selectedTrack.tags = [this.selectedTrack.title, this.selectedTrack.artist];
      if (response.data.track) {
        console.log('Got track details back', response.data.track);
        if (response.data.track.toptags.tag) {
          this.selectedTrack.tags = this.selectedTrack.tags.concat(response.data.track.toptags.tag.map(a => a.name))
        } else {
          console.log('no tags in track details');
        }
      } else {
        console.log('Did not get any details back');
      }
      let newtrack = {
        title: this.selectedTrack.title,
        artist: this.selectedTrack.artist,
        tags: this.selectedTrack.tags,
        image: this.selectedTrack.image
      }
      console.log('newtrack is', newtrack);
      this.tracks.splice(index, 1);
      this.playlist.tracks.push(newtrack);
      console.log('About to update this playlist:', this.playlist);
      $http({
        method: 'PUT',
        url: '/playlists/' + this.playlist._id,
        data: this.playlist
      }).then(response => {
        console.log(response.data);
        this.selectedTrack = {};
      }, error => {
        console.log(error);
      })

    }, error => {
      console.error(error);
    }).catch(err => console.error('Catch: ', err));
  }

  // Remove Track from Playlist
  this.deleteTrack = (playlists_id, track_id) => {
    const removeByIndex = this.playlist.tracks.findIndex(track => track._id === track_id)
    this.playlist.tracks.splice(removeByIndex, 1)
    $http({
      method:'PUT',
      url: '/playlists/' + playlists_id,
      data: this.playlist
    }).then((response) => {
      console.log(response)
      },
      (error) => {
        console.log(error)
      }
    )
  }

  /* ---------------------
  User functions
   --------------------- */
  this.createUser = () => {
    console.log('Angular calling createUser');
    $http({
      method: 'POST',
      url: '/users',
      data: {
        username: this.username,
        password: this.password
      }
    }).then(response => {
      console.log(response);
    })
  }

  this.logIn = () => {
    $http({
      method: 'POST',
      url: '/sessions',
      data: {
        username: this.loginUsername,
        password: this.loginPassword
      }
    }).then(response => {
      console.log(response);
      this.loggedInUser();
    })
  }

  this.loggedInUser = () => {
    $http({
      method: 'GET',
      url: '/log'
    }).then(response => {
      this.loggedInUserData = response.data
      console.log('loggedInUser is', this.loggedInUserData);
    })
  }

  this.logOutUser = () => {
    $http({
      method: 'DELETE',
      url: '/sessions'
    }).then(response => {
      console.log(response.data)
      this.loggedInUserData = ''
    })
  }

  //API Functions
  this.getMusic = () => {
    $http({
      method: 'GET',
      url: this.baseURL + this.methodSearch + '&track=' + this.MusicTitle + this.apikey + this.format
    }).then(response => {
      console.log(response.data.results.trackmatches.track);
      this.tracks = response.data.results.trackmatches.track;
    }, error => {
      console.error(error);
    }).catch(err => console.error('Catch: ', err));
  }

  this.getTrackInfo = (title, artist) => {
    let titleFormatted = title.split(' ').join('+');
    let artistFormatted = artist.split(' ').join('+');
    $http({
      method: 'GET',
      url: this.baseURL + this.methodInfo + this.apikey + "&artist=" + artistFormatted + '&track=' + titleFormatted + this.format
    }).then(response => {
      console.log(response.data.track);
      this.foundMusic = response.data.track;
    }, error => {
      console.error(error);
    }).catch(err => console.error('Catch: ', err));
  }

  this.showPlaylistDetails = (currentPlayList) => {
    this.viewDetails = true;
    this.playlist = currentPlayList;
  }

  // this.loggedInUser();
  this.getPlaylist();
}]);
