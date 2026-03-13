import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./CSS/Login.css";
import axios from "axios";

import { getToken } from "firebase/messaging";
import { messaging } from "../Features/firebase";

const Login = () => {
  const APi_Url = import.meta.env.VITE_API_URL;
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const initNotification = async (employee) => {
  try {
    console.log("🔔 Starting notification initialization...");
    
    const permission = await Notification.requestPermission();
    console.log("📋 Notification permission:", permission);
    
    if (permission !== "granted") {
      console.warn("⚠️ Notification permission denied");
      toast.warning("Please enable notifications to receive updates");
      return;
    }

    console.log("🔑 Generating FCM token...");
    const token = await getToken(messaging, {
      vapidKey: "BDGP4W2Ay1Za0e_QGGP_BpWAcen32Nk60kqUvuE_sHWxTJ1NKyBfVCayfvXKj4kRWC8C74ZdfDboxJTTm9D2hUQ"
    });

    if (!token) {
      console.error("❌ FCM token not generated");
      toast.error("Failed to generate notification token");
      return;
    }

    console.log("✅ FCM Token generated:", token.substring(0, 20) + "...");

    console.log("💾 Saving FCM token to backend...");
    const saveResponse = await axios.post(
      `${APi_Url}/digicoder/crm/api/v1/employee/save-fcm`,
      {
        employeeId: employee._id,
        fcmToken: token
      }
    );

    if (saveResponse.data.success) {
      console.log("✅ FCM token saved successfully");
      toast.success("Notifications enabled");
    }

  } catch (err) {
    console.error("❌ FCM init error:", err.message);
    toast.error("Notification setup failed: " + err.message);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required.");
      toast.error("All fields are required.");
    } else {
      try {
        setLoading(true);

        const response = await axios.post(`${APi_Url}/digicoder/crm/api/v1/employee/login`, {
          username: email,
          password: password
        });

        if (response.status === 200) { 
          setError("");
          toast.success("Logged in successfully!");

          const employee = response.data.employee;

          localStorage.setItem("Emp", JSON.stringify(employee));
          localStorage.setItem("Token", "dvhdscvydsyjucbvdsjbvju");
          localStorage.setItem("employeeId", employee._id);
          localStorage.setItem("addedBy", employee.addedBy);

          initNotification(employee);

          setTimeout(() => {
            setEmail("");
            setPassword("");
            navigate('/main');
          }, 2000); 
        }

      } catch (error) {
        if (error.response) {
          setError(error.response.data.message || "Invalid email or password.");
          toast.error(error.response.data.message || "Invalid email or password.");
        } else {
          setError("An error occurred while processing your request.");
          toast.error("An error occurred while processing your request.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField("");
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Welcome Back</h1>
        <p>Access Your Account</p>

        <form onSubmit={handleSubmit}>
            <legend>Email</legend>
          <fieldset className={focusedField === "email" ? "focused" : ""}>
            <div className="input-group">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                required
              />
            </div>
          </fieldset>
            <legend>Password</legend>
          <fieldset className={focusedField === "password" ? "focused" : ""}>
            <div className="input-group">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                required
              />
            </div>
          </fieldset>
          <br />
          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
