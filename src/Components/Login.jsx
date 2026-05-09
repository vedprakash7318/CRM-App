import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./CSS/Login.css";
import axios from "axios";

import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

const Login = () => {

  const APi_Url = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔔 MOBILE PUSH NOTIFICATION SETUP
  const initNotification = async (employee) => {

    try {

      // Only for Mobile App
      if (!Capacitor.isNativePlatform()) return;

      // Permission
      const permission = await PushNotifications.requestPermissions();

      if (permission.receive !== "granted") {

        toast.warning("Notification permission denied");

        return;
      }

      // Register Device
      await PushNotifications.register();

      // Token Generate
      PushNotifications.addListener("registration", async (token) => {

        console.log("✅ FCM TOKEN:", token.value);

        try {

          await axios.post(
            `${APi_Url}/digicoder/crm/api/v1/employee/save-fcm`,
            {
              employeeId: employee._id,
              fcmToken: token.value
            }
          );

          console.log("✅ FCM token saved");

          toast.success("Notifications enabled");

        } catch (err) {

          console.log(err);

          toast.error("Failed to save notification token");
        }

      });

      // Foreground Notification
      PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {

          const title = notification.title || "New Notification";

          const body = notification.body || "";

          // 🔊 SOUND
          const audio = new Audio("/ring1.mp3");

          audio.play().catch(() => {});

          toast(
            <>
              <strong>{title}</strong>
              <div>{body}</div>
            </>
          );

        }
      );

    } catch (err) {

      console.log(err);

      toast.error("Notification setup failed");

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

        const response = await axios.post(
          `${APi_Url}/digicoder/crm/api/v1/employee/login`,
          {
            username: email,
            password: password
          }
        );

        if (response.status === 200) {

          setError("");

          toast.success("Logged in successfully!");

          const employee = response.data.employee;

          localStorage.setItem("Emp", JSON.stringify(employee));

          localStorage.setItem("Token", "dvhdscvydsyjucbvdsjbvju");

          localStorage.setItem("employeeId", employee._id);

          localStorage.setItem("addedBy", employee.addedBy);

          // 🔔 INIT NOTIFICATION
          await initNotification(employee);

          setTimeout(() => {

            setEmail("");

            setPassword("");

            navigate('/main');

          }, 2000);

        }

      } catch (error) {

        console.log(error);

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