import React from 'react'
import NavBar from '../components/NavBar'
import GenreList from '../components/ui/GenreList'
import Cards from '../components/Cards'
import { BrowserRouter as Router } from 'react-router-dom'

export default function Home() {
    return (
        <div className='bg-white px-[4%] sm:px-[12%] pb-10'>
            <GenreList />
            <Cards />
        </div>
    )
}
