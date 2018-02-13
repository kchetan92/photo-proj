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
        <button onClick={this.props.triggerLogin}>Google login</button>
        </div>
      )
    } else {
      return (
        <div className="login">
        <p>logged in</p>
        <p>Hello {this.props.data.displayName}</p>
        {/* <img src={this.props.data.photoURL} alt=""/> */}
        <input type="text" placeholder="nickname" value={this.state.nickname} onChange={i => this.handleChange(i)}/>
        <button onClick={i => this.updateNickname(i)}>update nickname</button>
        <button onClick={this.props.triggerLogout}>logout</button>
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