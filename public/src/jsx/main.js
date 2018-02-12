class Login extends React.Component {

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
        // that.setState({
        //   userData : result
        // })
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

  render() {
    return(
      <div>
        <Login 
          updateUserData={i => this.updateUserData(i)}
          triggerLogin={i => this.triggerLogin(i)}
          triggerLogout={i => this.triggerLogout(i)}
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