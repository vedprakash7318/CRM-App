import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Components/Login'
import Dashboard from './Components/Dashboard'
import 'react-toastify/dist/ReactToastify.css';

import Leads from './Pages/Leads'
import MissedLeads from './Pages/MissedLeads'
import Reminders from './Pages/Reminders'
import Report from './Pages/Report'
import FullLeads from './Pages/FullLeads'
// App.jsx or index.jsx
import './index.css';  // Make sure the path is correct
import DynamicTable from './Components/DynmicTables'
import MainDashboard from './Pages/MainDashboard';
import Profile from './Pages/Profile'
import Priority from './Pages/Settings/Priority'
import Source from './Pages/Settings/Sources'
import Tag from './Pages/Settings/Tag'
import LeadStatus from './Pages/Settings/LeadStatus'
import FollowUpNotes from './Components/FollowUpNotes';
import DynamicCard from './Components/DynamicCard';
import ClosedLead from './Pages/ClosedLead';
import NegativeLead from './Pages/NegativeLead';

import  Calander from './Pages/Calander'
import PendingLeads from './Pages/PendingLeads';
import EmployeeTagRequest from './Pages/EmployeeTagRequest';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route  path='/' element={<Login/>}/>
          <Route  path='/employeeDashboard' element={<Dashboard/>}/>
          <Route path='/main' element={<MainDashboard/>}/>
          <Route  path='/leads' element={<Leads/>}/>
          <Route  path='/missedLeads' element={<MissedLeads/>}/>
          <Route  path='/todayRminders' element={<Reminders/>}/>
          <Route  path='/report' element={<Report/>}/>
          <Route  path='/DynamicTable' element={<DynamicTable/>}/>
          <Route  path='/profile' element={<Profile/>}/>
          <Route  path='/card' element={<DynamicCard/>}/>
          <Route  path='/calender' element={<Calander/>}/>
          <Route  path='/pending' element={<PendingLeads/>}/>
          {/* -------------------------------------------- */}
          <Route  path='/priority' element={<Priority/>}/>
          <Route  path='/source' element={<Source/>}/>
          <Route  path='/tag' element={<Tag/>}/>
          <Route  path='/status' element={<LeadStatus/>}/>
          <Route  path='/closed' element={<ClosedLead/>}/>
          <Route  path='/negative' element={<NegativeLead/>}/>

          <Route  path='/Main/fullLeads' element={<FullLeads/>}/>
          <Route  path='/todayRminders/fullLeads' element={<FullLeads/>}/>
          <Route  path='/leads/fullLeads' element={<FullLeads/>}/>
          <Route  path='/missedLeads/fullLeads' element={<FullLeads/>}/>
          <Route  path='/closed/fullLeads' element={<FullLeads/>}/>
          <Route  path='/negative/fullLeads' element={<FullLeads/>}/>
          <Route  path='/calender/fullLeads' element={<FullLeads/>}/>
          <Route  path='/pending/fullLeads' element={<FullLeads/>}/>
          <Route  path='/notes' element={<FollowUpNotes/>}/>
          
          <Route  path='/request' element={<EmployeeTagRequest/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App;
