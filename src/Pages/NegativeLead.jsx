import React, { useEffect, useState } from 'react'
import Dashboard from '../Components/Dashboard';
import DynamicTable from '../Components/DynmicTables';
import DynamicCard from '../Components/DynamicCard'
import axios from 'axios';

function NegativeLead() {

  const [tableTitle] = useState('Negative Lead')
  const [leads, setLeads] = useState([])

      const APi_Url = import.meta.env.VITE_API_URL;
    const employeeId = localStorage.getItem('employeeId');

  useEffect(() => {

    const fetchNegativeLeads = async () => {

      try {

        const res = await axios.get(`${APi_Url}/digicoder/crm/api/v1/lead/negative-leads/${employeeId}`)

        setLeads(res.data.leads)

      } catch (error) {

        console.log(error)

      }

    }

    fetchNegativeLeads()

  }, [employeeId])


  return (
    <>
      <Dashboard active={'negative'}>

        <div className="lead-table-container">
          <DynamicTable
            className='dynamicTable'
            lead={leads}
            TableTitle={'Negative Lead'}
          />
        </div>

        <div className='lead-card-container'>
          <DynamicCard
            leadCard={leads}
            TableTitle={'Negative Lead'}
          />
        </div>

      </Dashboard>
    </>
  )
}

export default NegativeLead;