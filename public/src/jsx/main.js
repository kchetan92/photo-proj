class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname : ''
    };
  }
  
  componentWillReceiveProps(nextProps) {
    var that = this;
    if(nextProps && nextProps.data) {
      firebase.database().ref('/users/' + nextProps.data.uid).once('value').then(function(snapshot) {
        var username = (snapshot.val() && snapshot.val().nickname) || 'none';
        that.setState({
          nickname : username
        });
      });
    };
  };
  
  updateNickname() {
    this.props.updateNickname(this.state.nickname)
  }
  
  handleChange(event) {
    this.setState({nickname: event.target.value});
  }
  
  render() {
    if(!this.props.data) {
      return (
        <div className="login">
        <h1 className="title">SnapStore</h1>
        <h2 className="subtitle">The place to share and save photos.</h2>
        <p>by <a target="_blank" href="http://kchetan.com">Chetan Keshav</a></p>
        <button className="pure-button pure-button-primary" onClick={this.props.triggerLogin}>Google login</button>
        </div>
      )
    } else {
      return (
        <div className="login-loaded">
        {/* <img src={this.props.data.photoURL} alt=""/> */}
        <div className="header">
          <div className="home-menu pure-menu pure-menu-horizontal pure-menu-fixed">
          <p className="pure-menu-heading">SnapStore</p>
          
            <ul className="pure-menu-list">
              <li className="pure-menu-item pure-menu-selected">
                <img src={this.props.data.photoURL} className="dp" alt=""/>
              </li>
              <li className="pure-menu-item pure-menu-selected">
                 {this.props.data.displayName}
              </li>
              <li className="pure-menu-item pure-menu-selected">
                  <button className="pure-button" onClick={this.props.triggerLogout}>logout</button>
              </li>
            </ul>
          </div>
        </div>
        {/* <input type="text" placeholder="nickname" value={this.state.nickname} onChange={i => this.handleChange(i)}/> */}
        </div>
      )
    }
  }
}

class Photos extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      picName : '',
      pics : []
    }
    this.fileName = '';
    this.updateProps(this.props);
  }

  updateProps(nextProps) {
    debugger;
    if(nextProps.albumPath || nextProps.selected && nextProps.selected.name) {
      var that = this;
      var path = '';
      if(nextProps.albumPath) {
        path = nextProps.albumPath + '/photos';
      } else {
        path = nextProps.path + nextProps.selected.key + '/photos';
      }
      var albumRef = firebase.database().ref(path);
      albumRef.on('value', function(snapshot) {
        var list = [];
        snapshot.forEach(function(child) {
          var obj = {
            "key" : child.key
          }
          
          if(child.val()['name']) {
            obj["name"] =  child.val()['name']
          } else if(child.val()['link']) {
            obj["link"] =  child.val()['link']
          }
          list.push(obj);
        });
        
        that.setState(Object.assign(that.state, {
          pics : list
        }));
      });
      
    };
  }
  
  componentWillReceiveProps(nextProps) {
    this.updateProps(nextProps);
  }
  
  handlePicChange(event) {
    // this.setState(Object.assign(this.state, { picName: event.target.files[0] }));
    this.fileName = event.target.files[0];
  };
  
  addPhoto(i) {
    i.preventDefault();
    
    if (!this.fileName.type.match('image.*')) {
      alert('Only Image files allowed');
    }
    
    const ref = firebase.storage().ref('/store/');
    var timestampName = ((+new Date()) + this.fileName.name).replace(/[^a-z0-9]/gi, '_').toLowerCase();;
    
    
    const task = ref.child(timestampName).put(this.fileName, {});
    
    task.then((snapshot) => {
      console.log(snapshot.downloadURL);
      
      var oneAlbum = [this.state.newAlbum];
      var ref = firebase.database().ref(this.props.path + this.props.selected.key + '/photos');
      var key = ref.push({link: timestampName});
    });
    
    // if(this.state.picName !== '' && this.props.selected) {
    //   var oneAlbum = [this.state.newAlbum];
    //   var ref = firebase.database().ref(this.props.path + this.props.selected.key + '/photos');
    //   var key = ref.push({name: this.state.picName});
    // }
    
  }
  
  deletePhoto(i, name) {
    var that = this;
    firebase.storage().ref('/store/').child(name.link).delete().then(function(){
      firebase.database().ref(that.props.path + that.props.selected.key + '/photos/' + name.key).remove();
    })
  }
  
  render() {
    
    if(this.props.albumPath || this.props.selected && this.props.selected.name) {
      var nameAlbum = this.props.selected ? this.props.selected.name : ''
      const picList = this.state.pics.map((name) => {
        if(name.name) {
          return (
            <li key={name.key}>
            {name.name}
            <button onClick={(i) => {this.deletePhoto(i, name)}} >delete</button>
            </li>
          )
        } else {
          debugger;
          return (
            <li className="pure-u-1-4" key={name.key}>
            <Pic link={name.link}></Pic>
            <a className="trash" onClick={(i) => {this.deletePhoto(i, name)}} >
              <img src="/img/trash.png" alt="delete"/>
            </a>
            </li>
          )
        }
      })
      var shareLink = encodeURI('/?album='+(this.props.albumPath || this.props.path+this.props.selected.key));
      return(
        <div>
        <p>You selected {nameAlbum || ''}</p>
        <p><a href="share" href={shareLink}>Share</a></p>
        <ul className="piclist">
        {picList}
        </ul>
        <form onSubmit={i => this.addPhoto(i)}>
        {/* <input type="text" placeholder="write photo" value={this.state.picName} onChange={i => this.handlePicChange(i)}/> */}
        <input type="file" onChange={i => this.handlePicChange(i)}/>
        <button type="submit">Add a photo</button>
        </form>
        </div>
      )
    } else {
      return (
        <p>Select an album</p>
      )
    }
  }
}

class Pic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      link: ''
    }
    this.updateLink(this.props.link)
  }
  
  updateLink(glink) {
    debugger;
    var that = this;
    firebase.storage().ref('store/').child(glink).getDownloadURL().then(function(url) {
      that.setState({
        link: url
      });
    })
  }
  
  componentWillReceiveProps(nextProps) {
    this.updateLink(nextProps.link)
  }
  
  render() {
    return(
      <img src={this.state.link} alt=""/>
    )
  }
}

class Albums extends React.Component {
  constructor(props) {
    super(props);

    var url_string = window.location.href;
    var url = new URL(url_string);
    var albumPath = url.searchParams.get("album");

    this.state = {
      albums : [],
      newAlbum : '',
      selectedAlbum : {},
      albumPath: albumPath || ''
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if(nextProps.data) {
      var that = this;
      var albumRef = firebase.database().ref('/users/' + nextProps.data.uid + '/albums');
      albumRef.on('value', function(snapshot) {
        var albums = (snapshot.val()) || [];
        var list = [];
        snapshot.forEach(function(child) {
          list.push({
            "name" : child.val()['name'],
            "key" : child.key,
          })
        });
        
        that.setState(Object.assign(that.state, {
          albums : list
        }));
      });
      
    };
  }
  
  handleChange(event) {
    this.setState(Object.assign(this.state, {newAlbum: event.target.value}));
  }

  addAlbum() {
    if(this.state.newAlbum !== '') {
      var oneAlbum = [this.state.newAlbum]
      var ref = firebase.database().ref('/users/' + this.props.data.uid + '/albums')
      var key = ref.push({name: this.state.newAlbum})
    }
  }
  
  showAlbum() {
    this.setState(Object.assign(this.state, {
      albumPath: ''
    }))
  }
  
  selectAlbum(i, name) {
    this.setState(Object.assign(this.state, {
      selectedAlbum: name,
    }))
  }
  
  
  render() {
    
    if(!this.props.data) {

      var url_string = window.location.href;
      var url = new URL(url_string);
      var albumPath = url.searchParams.get("album");
      
      return (
        <div>
        {/* <input val={this.state.albumPath} onChange={i => this.handlePathChange(i)} type="text" placeholder="enter path"/> */}
        <Photos albumPath={albumPath}/>
        </div>
      )
    } else {
      const albumList = this.state.albums.map((name) =>
      <li className="pure-u-1-4" 
        key={name.key} 
        link={'/users/' + this.props.data.uid + '/albums/' + name.key} 
        onClick={(i) => this.selectAlbum(i, name)}>
        {name.name}
      </li>
    )
    return (
      <div className="albums">
        <h3>Albums</h3>
        <ul>
        {albumList}
          <li className="pure-u-1-4 pure-form">
            <input type="text" placeholder="album name" value={this.state.newAlbum} onChange={i => this.handleChange(i)}/>
            <button className="pure-button" onClick={i => this.addAlbum()} >add album</button>
          </li>
        </ul>

        <Photos selected={this.state.selectedAlbum} path={'/users/' + this.props.data.uid + '/albums/'} />
      </div>
    )
  }
}
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    var that = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        that.setState({
          userData: user
        })
      } else {
        that.setState({
          userData: null
        })
      }
    });
    this.state = {
      userData: null
    }
  }
  
  updateUserData(data) {
    this.setState({
      userData : data
    })
  }
  
  triggerLogin() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    var that = this;
    
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(function() {
      return firebase.auth().signInWithPopup(provider).then(function(result) {
        that.setState(Object.assign(this.state, {
          userData : result
        }))
        var token = result.credential.accessToken;
        console.log('user ', result.user);
        console.log('token ', token);
      })
    })
    .catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
    });
  }
  
  triggerLogout() {
    var that = this;
    firebase.auth().signOut().then(function(){
      // that.setState({
      //   userData: null
      // })
    }), function(error) {
      console.error('sign out error', error);
    }
  }
  
  updateNickname(name) {
    firebase.database().ref('users/' + this.state.userData.uid).set({
      nickname: name
    })
  }
  
  render() {
    
    return(
      <div>
      <Login 
      updateUserData={i => this.updateUserData(i)}
      triggerLogin={i => this.triggerLogin(i)}
      triggerLogout={i => this.triggerLogout(i)}
      updateNickname={i => this.updateNickname(i)}
      data={this.state.userData}/>
      <Albums data ={this.state.userData}/>
      </div>
    )
  }
}

document.addEventListener('DOMContentLoaded', function(){
  var config = {
    apiKey: "AIzaSyDqXMSgx-Hz-1llFIzHYEzCm9LBv7jqJfo",
    authDomain: "snapstore-chetan.firebaseapp.com",
    databaseURL: "https://snapstore-chetan.firebaseio.com",
    projectId: "snapstore-chetan",
    storageBucket: "snapstore-chetan.appspot.com",
    messagingSenderId: "365243134582"
  };
  
  if (!firebase.apps.length) {
    firebase.initializeApp(config);
  }
})


ReactDOM.render(<Main/>, document.getElementById("root"));