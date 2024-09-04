import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Catalog from './Catalog'
import SerieDetails from './details/SerieDetails'
import AuthorDetails from './details/AuthorDetails'
import CollectionDetails from './details/CollectionDetails'

function CatalogCont() {
  return (
    <div>
        <Routes>
            <Route path='/' element={<Catalog />} />
            <Route path='/series/:serieId/:serieName' element={<SerieDetails />} />
            <Route path='/collections/:collectionId/:collectionName' element={<CollectionDetails />} />
            <Route path='/authors/:authorId/:authorName' element={<AuthorDetails />} />
        </Routes>
    </div>
  )
}

export default CatalogCont