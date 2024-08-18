'use client'

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { AppBar, Box, Button, Container, Grid, Toolbar, Typography } from "@mui/material";
import Head from "next/head";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push('/generate');  // Navigate to the generate page
  };

  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_session', {
      method: 'POST',
      headers: {
        origin: 'http://localhost:3000',
      },
    })

    const checkoutSessionJson = await checkoutSession.json()

    if (checkoutSession.statusCode === 500) {
      console.error(checkoutSession.message)
      return
    }

    const stripe = await getStripe()
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id
    })

    if (error) {
      console.warn(error.message)
    }
  }

  
  return (
    <Container maxWidth="lg" sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Head>
        <title>Flashcard SaaS</title>
        <meta name="description" content="Create flashcards from your text" />
      </Head>

      <AppBar position="fixed" sx={{ backgroundColor: '#3f51b5', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>Flashcard SaaS</Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in" sx={{ textTransform: 'none', fontWeight: 'bold' }}>Login</Button>
            <Button color="inherit" href="/sign-up" sx={{ ml: 2, textTransform: 'none', fontWeight: 'bold' }}>Sign Up</Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
          Welcome to Flashcard SaaS
        </Typography>
        <Typography variant="h5" sx={{ color: '#666' }}>
          The easiest way to create flashcards
        </Typography>
        <Button variant="contained" sx={{ mt: 4, px: 4, py: 1.5, backgroundColor: '#3f51b5', '&:hover': { backgroundColor: '#2c3e9d' }, boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)', borderRadius: '30px', textTransform: 'none' }} onClick={handleGetStarted}>
          Get Started
        </Button>
      </Box>

      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#333' }}>
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 2 }}>Easy Text Input</Typography>
              <Typography sx={{ color: '#666' }}>Simply input your text and let our software do the rest.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 2 }}>Smart Flashcards</Typography>
              <Typography sx={{ color: '#666' }}>Our AI-powered flashcards break down your text into concise, easy-to-study cards.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 3, borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 2 }}>Accessible Anywhere</Typography>
              <Typography sx={{ color: '#666' }}>Access your flashcards from any device, at any time. Study on the go with ease.</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: '#333' }}>Pricing</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4, borderRadius: '8px', backgroundColor: '#f5f5f5', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 2 }}>Basic</Typography>
              <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>$5/month</Typography>
              <Typography sx={{ color: '#666', mb: 3 }}>Access to basic flashcard features with limited storage.</Typography>
              <Button variant="contained" sx={{ backgroundColor: '#3f51b5', '&:hover': { backgroundColor: '#2c3e9d' }, textTransform: 'none', borderRadius: '30px' }}>Choose Basic</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 4, borderRadius: '8px', backgroundColor: '#f5f5f5', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5', mb: 2 }}>Pro</Typography>
              <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>$10/month</Typography>
              <Typography sx={{ color: '#666', mb: 3 }}>Unlimited flashcards with storage, plus priority support.</Typography>
              <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: '#3f51b5', '&:hover': { backgroundColor: '#2c3e9d' }, textTransform: 'none', borderRadius: '30px' }}>Choose Pro</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
