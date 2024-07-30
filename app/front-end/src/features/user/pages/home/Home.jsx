import React from 'react'
import NavBar from '../../components/NavBar'
import GenreList from '../../components/GenreList'

export default function Home() {
    return (
        <div>
            <div><NavBar /></div>
            <main className=' px-[5%] sm:px-[12%]'>
                <GenreList />
            </main>
        </div>
    )
}
