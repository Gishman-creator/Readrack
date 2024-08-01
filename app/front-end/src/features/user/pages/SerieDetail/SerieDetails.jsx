import React from 'react'
import Details from './Details'
import Books from './Books'
import NavBar from '../../components/NavBar'
import Recommendations from '../../components/Recommendations'

function SerieDetails() {
  return (
    <div className='block'>
      <NavBar />
      <div className='md:flex md:flex-row pt-6 px-[4%] sm:px-[12%] md:justify-between md:space-x-6 xl:space-x-8'>
        <Details />
        <Books />
      </div>
      <div className='px-[4%] sm:px-[12%]'>
      <Recommendations />
      </div>
    </div>
  )
}

export default SerieDetails