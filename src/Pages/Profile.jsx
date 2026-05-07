import React, { useState ,useEffect} from 'react';
import Dashboard from '../Components/Dashboard';
import './CSS/Profile.css';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [isEditing, setIsEditing] = useState(false); // Toggle for editing mode
  const navigate=useNavigate()
  const userString = localStorage.getItem('Emp');
  const name = userString ? JSON.parse(userString) : null;
  const [user, setUser] = useState({
    name: name.empName || "",
    email: name.empEmail || "",
    phone: name.empPhoneNumber || "",
    image: "/Images/ved.jpg",
  });

  const handleEditSaveToggle = () => {
    if (isEditing) {
      // When saving, switch to non-editing mode
      setIsEditing(false);
    } else {
      // When updating, switch to editing mode
      setIsEditing(true);
    }
  };
  
    useEffect(()=>{
      const tokenId=localStorage.getItem('Token');
      if(!tokenId){
        navigate('/')
      }
  
    },[navigate])

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <Dashboard active={'profile'}>
        <div className="profile-container">
          <div className="profile-header">
            <h2>{isEditing ? "Edit Profile" : "Profile"}</h2>
          </div>
          <div className="profile-details">
            <div className="profile-image">
              <img src={user.image} alt="Profile" />
            </div>
            <div className="profile-info">
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  className={isEditing ? "editing" : ""}
                  disabled={!isEditing}  // Disable input when not in editing mode
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className={isEditing ? "editing" : ""}
                  disabled={!isEditing}  // Disable input when not in editing mode
                />
              </div>
              <div>
                <label>Phone:</label>
                <input
                  type="text"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  className={isEditing ? "editing" : ""}
                  disabled={!isEditing}  // Disable input when not in editing mode
                />
              </div>
            </div>
          </div>
          <div className="button-container">
            {/* <button onClick={handleEditSaveToggle}>
              {isEditing ? "Save" : "Update"}
            </button> */}
          </div>
        </div>
        <br />
      </Dashboard>
    </div>
  );
}

export default Profile;
