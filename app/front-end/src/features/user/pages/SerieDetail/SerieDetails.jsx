import React from 'react'
import Details from './Details'
import Books from './Books'
import NavBar from '../../components/NavBar'

function SerieDetails() {
  return (
    <div className=''>
      <NavBar />
      <div className='md:flex md:flex-row pt-6 px-[4%] sm:px-[12%] pb-10 md:justify-between md:space-x-6 xl:space-x-8'>
        <Details />
        <Books />
      </div>
    </div>
  )
}

export default SerieDetails