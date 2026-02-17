import React, { useEffect, useState } from 'react'
import axios from "axios"
const CreateChallenge = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",

  })


  // const handleSubmit = () => {
  //   try {
  //     const response = await axios.post("http://localhost:4000/challenge/create");
  //     if(response.status === 201) {
        
  //     }
  //   }
  // }
  return (
    <div className='text-white'>
      
    </div>
  )
}

export default CreateChallenge