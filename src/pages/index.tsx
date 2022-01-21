/**
 * Main app screen
 */

import type { NextPage } from 'next'

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head'
import React from 'react'
import Toolbar from '@mui/material/Toolbar';

// App components
import Sidebar from '../components/sidebar';
import Appbar from '../components/appbar';

const Home: NextPage = () => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <Head>
        <title>Rasagi</title>
        <meta name="description" content="A private RSS aggregator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Appbar setSidebarOpen={() => setSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onNodeSelect={(node) => alert(node)} />

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
      </Box>
    </Box>
  )
}

export default Home