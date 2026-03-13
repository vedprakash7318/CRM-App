import React, { useEffect, useState } from 'react'
import Dashboard from '../Components/Dashboard'
import DynamicTable from '../Components/DynmicTables'
import DynamicCard from '../Components/DynamicCard'
import axios from 'axios'

function ClosedLead() {

  const [tableTitle] = useState('Closed Lead')
  const [leads, setLeads] = useState([])

      const APi_Url = import.meta.env.VITE_API_URL;
    const employeeId = localStorage.getItem('employeeId');

  useEffect(() => {

    const fetchClosedLeads = async () => {

      try {

        const res = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/closed-leads/${employeeId}`)

        setLeads(res.data.leads)

      } catch (error) {

        console.log(error)

      }

    }

    fetchClosedLeads()

  }, [employeeId])


  return (
    <>
      <Dashboard active={'closedLead'}>

        <div className="lead-table-container">
          <DynamicTable
            className='dynamicTable'
            lead={leads}
            TableTitle={tableTitle}
          />
        </div>

        <div className='lead-card-container'>
          <DynamicCard
            leadCard={leads}
            TableTitle={tableTitle}
          />
        </div>

      </Dashboard>
    </>
  )
}

export default ClosedLead