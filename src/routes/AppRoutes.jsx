import React from 'react'
import { Route, BrowserRouter , Routes } from 'react-router-dom'
import Login from '../screens/login'
import SignUp from '../screens/register'
import Home from '../screens/home'
import Project from '../screens/project'
import CollaborativeEditor from '../screens/codeEditorComp'

const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<SignUp />} />
            <Route path='/project/:projectId' element={<Project />} />
            <Route path='/test' element={<CollaborativeEditor roomId={123} />} />
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes