import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Catalog from './Catalog'
import SerieDetails from './details/SerieDetails'
import AuthorDetails from './details/AuthorDetails'
import NotFoundPage from '../../../pages/NotFoundPage'

function CatalogCont() {
  return (
    <div>
        <Routes>
            <Route path='/' element={<Catalog />} />
            <Route path='/series/:serieId/:serie_name' element={<SerieDetails />} />
            <Route path='/authors/:authorId/:author_name' element={<AuthorDetails />} />
            <Route path='*' element={<NotFoundPage />} />
        </Routes>
    </div>
  )
}

export default CatalogCont