import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebaseConfig';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser]=useState({
    isSignedIn: false,
    name:'',
    email:'',
    password:'',
    photo:''
  })
  const provider = new firebase.auth.GoogleAuthProvider();
  const FbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn =() =>{
    firebase.auth().signInWithPopup(provider)
    .then(res => {
      console.log(res)
      const {displayName, email, photoURL}=res.user;
      const isSignedInUser={
        isSignedIn:true,
        name:displayName,
        email:email,
        photo:photoURL
      }
      setUser(isSignedInUser);
      console.log(displayName,email, photoURL)
      
    })
    .catch(error =>{
      console.log(error);
      console.log(error.message);
    })
  }

  const handleFbLogging = ()=>{
    firebase.auth().signInWithPopup(FbProvider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res => {
      const signedOutUser={
        isSignedIn:false,
        name:'',
        email:'',
        photo:'',
        error:'',
        success:false
      }
      setUser(signedOutUser)

    })
    .catch(error =>{

    })
  }
  const handleBlur = (e) =>{    
   let isFieldValid = true;
    if(e.target.name === 'email'){
       isFieldValid=/\S+@\S+\.\S+/.test(e.target.value)
      
    }
    if(e.target.name === 'password'){
      const isPasswordValid=e.target.value.length>8;
      const passwordHasNumber =/\d{1}/.test(e.target.value)      
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if(isFieldValid){
      const newUserInfo = {...user}
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }
  const handleSubmit = (e) => {
    // console.log(user.email, user.password)
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res =>{
        const newUserInfo={...user};
        newUserInfo.error= '';
        newUserInfo.success= true;
        setUser(newUserInfo);
      })
      .catch(error => {                 
        const newUserInfo={...user};
        newUserInfo.error= error.message;
        newUserInfo.success= false;
        setUser(newUserInfo);
       
      });
    }
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(res =>{
        const newUserInfo={...user};
        newUserInfo.error= '';
        newUserInfo.success= true;
        setUser(newUserInfo);
        updateUserName(user.name);
        console.log('sign i user info', res.user)

      })
      .catch(error => {
        const newUserInfo={...user};
        newUserInfo.error= error.message;
        newUserInfo.success= false;
        setUser(newUserInfo);
      });
    }

    e.preventDefault();

  }
  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name      
    }).then(function() {      
    }).catch( error => {
      console.error(error)
    });
  }

  return (
    <div className="App">
      {
        user.isSignedIn ? <Button className="btn btn-primary" onClick={handleSignOut}>Sign out using google</Button>:
        <button className="btn btn-primary" onClick={handleSignIn}>Sign in using google</button>
      }
      <button className="btn btn-warning" onClick={handleFbLogging}>sign in using facebook</button>
      {
        user.isSignedIn && <div>
          <p className='text-info'>Welcome, {user.name}</p>
          <p className='text-warning'>Your email : {user.email} </p>
          <img className="img-thumbnail" src={user.photo} alt=""/>
        </div> 
      }

      <h3>Our Own Authentication</h3>
      <input type="checkbox" onChange={()=> setNewUser(!newUser)} name="newUser" id=""/>
      <label htmlFor="newUser">New User Sign up</label>
      <form onSubmit={handleSubmit}>
        {
          newUser && <input onBlur={handleBlur}  className="btn btn-white border border-warning" name="name" type="text" placeholder="Your Name"/>
        }        
      
      <br/> <br/>
      <input className="btn btn-white border border-success" name="email" onBlur={handleBlur} type="text" placeholder="Your email address" required/>
      <br/><br/>
      <input className="btn btn-white border border-warning" name="password" onBlur={handleBlur} type="password"  placeholder="Your password" required/>
      <br/>       
      <button className="btn btn-info rounded-pill">{newUser ? 'sign up' : 'sign in'} </button>
      </form>
      <p className="text-danger">{user.error} </p>
      {
        user.success && <p className="text-success">User {newUser ? "created" : "Logged In"}  successfully </p>
      }
    </div>
  );
}

export default App;
